<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Utils/Logger.php';
class User
{
	protected $table = 'users';
	protected $fillable = ['name', 'email', 'password', 'data_nascimento', 'role'];
	protected $hidden = ['password'];
	private PDO $pdo;
	private const ROLES = ['admin', 'customer'];

	public function __construct()
	{
		$this->pdo = Database::connection();
	}
	public function getByEmail(string $email): ?array
	{
		$stmt = $this->pdo->prepare(
			'SELECT * FROM users WHERE email = :email LIMIT 1'
		);

		$stmt->execute([':email' => $email]);

		$user = $stmt->fetch(PDO::FETCH_ASSOC);

		return $user ?: null;
	}

	public function getById(int $id): ?array
	{
		$stmt = $this->pdo->prepare(
			'SELECT id, name, email, role FROM users WHERE id = :id LIMIT 1'
		);

		$stmt->execute([':id' => $id]);

		$user = $stmt->fetch(PDO::FETCH_ASSOC);

		return $user ?: null;
	}

	public function getAll(): array
	{
		$sql = 'SELECT id, name, email, role, created_at FROM users ORDER BY id DESC';

		$stmt = $this->pdo->prepare($sql);

		if (!$stmt) {
			return [];
		}

		$stmt->execute();
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

		return $rows;
	}

	public function create(
		string $name,
		string $email,
		string $password,
		string $birthdate,
		string $role = 'customer'
	): int {
		$email = strtolower(trim($email));
		$role = strtolower(trim($role));
		$this->validateUserData($email, $password, $birthdate, $role);

		if ($this->getByEmail($email)) {
			throw new Exception('Email já cadastrado');
		}

		$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

		$stmt = $this->pdo->prepare(
			'INSERT INTO users (name, email, password, data_nascimento, role, created_at)
			 VALUES (:name, :email, :password, :data_nascimento, :role, datetime(\'now\'))'
		);

		$stmt->execute([
			':name'     => $name,
			':email'    => $email,
			':password' => $hashedPassword,
			':data_nascimento' => $birthdate,
			':role'     => $role
		]);

		return (int) $this->pdo->lastInsertId();
	}

	public function update(int $id, array $data): bool
	{
		$updates = [];
		$params  = [':id' => $id];

		if (array_key_exists('name', $data)) {
			$updates[] = 'name = :name';
			$params[':name'] = $data['name'];
		}

		if (array_key_exists('email', $data)) {
			$normalizedEmail = strtolower(trim($data['email']));
			if (!filter_var($normalizedEmail, FILTER_VALIDATE_EMAIL)) {
				throw new Exception('Email inválido');
			}
			$updates[] = 'email = :email';
			$params[':email'] = $normalizedEmail;
		}

		if (array_key_exists('role', $data)) {
			$roleNorm = strtolower(trim($data['role']));
			if (!in_array($roleNorm, self::ROLES, true)) {
				throw new Exception('Role inválido. Use: admin ou customer');
			}
			$updates[] = 'role = :role';
			$params[':role'] = $roleNorm;
		}

		if (empty($updates)) {
			return false;
		}

		$stmt = $this->pdo->prepare(
			'UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = :id'
		);

		return $stmt->execute($params);
	}

	public function delete(int $id): bool
	{
		$stmt = $this->pdo->prepare(
			'DELETE FROM users WHERE id = :id'
		);

		return $stmt->execute([':id' => $id]);
	}

	public function setPassword(int $id, string $password): bool
	{
		if (strlen($password) < 6) {
			throw new Exception('Senha deve ter no mínimo 6 caracteres');
		}

		$hashed = password_hash($password, PASSWORD_BCRYPT);

		$logger = new \Logger('debug_sql.log');
		$logger->info('setPassword start', [
			'id' => $id,
			'password_hash_prefix' => substr($hashed, 0, 12) . '...'
		]);

		$attempts = 0;
		$maxAttempts = 8;
		$sleepUs = 150000; // 150ms

		while (true) {
			try {
				$stmt = $this->pdo->prepare(
					'UPDATE users SET password = :password WHERE id = :id'
				);
				$stmt->bindValue(':password', $hashed, \PDO::PARAM_STR);
				$stmt->bindValue(':id', (int) $id, \PDO::PARAM_INT);
				$ok = $stmt->execute();

				if ($ok === false) {
					$err = $stmt->errorInfo();
					$logger->warning('setPassword execute returned false', ['id' => $id, 'errorInfo' => $err]);
					throw new \PDOException('Execute returned false', $err[0] ?? 0);
				}

				$logger->info('setPassword execute succeeded', ['id' => $id, 'rows' => $stmt->rowCount()]);
				return true;
			} catch (\PDOException $e) {
				$attempts++;
				$msg = $e->getMessage();
				$logger->exception($e, 'setPassword execute PDOException');

				if ($attempts < $maxAttempts && stripos($msg, 'database is locked') !== false) {
					usleep($sleepUs);
					continue;
				}

				// Fallback: quote + exec to avoid binding issues if the driver is misbehaving.
				$logger->info('setPassword using exec fallback', ['id' => $id]);
				$quoted = $this->pdo->quote($hashed);
				$sql = "UPDATE users SET password = $quoted WHERE id = " . (int) $id;
				$res = $this->pdo->exec($sql);
				if ($res === false) {
					$err = $this->pdo->errorInfo();
					$logger->warning('setPassword exec returned false', ['id' => $id, 'errorInfo' => $err]);
					throw $e;
				}

				$logger->info('setPassword exec succeeded', ['id' => $id, 'rows' => $res]);
				return true;
			}
		}
	}

	public function authenticate(string $email, string $password): ?array
	{
		$user = $this->getByEmail($email);

		if (!$user) {
			return null;
		}

		if (!$this->verifyPassword($password, $user)) {
			return null;
		}

		$this->rehashPasswordIfNeeded($user, $password);

		unset($user['password']);

		return $user;
	}

	public function findByEmail(string $email)
	{
		return $this->getByEmail($email);
	}

	public function findByEmailAndBirthdate(string $email, string $birthdate): ?array
	{
		// Accept either Y-m-d or d/m/Y as input and try matching both formats stored in DB
		$candidates = [];

		// If input looks like Y-m-d
		$dtY = \DateTime::createFromFormat('Y-m-d', $birthdate);
		if ($dtY && $dtY->format('Y-m-d') === $birthdate) {
			$candidates[] = $dtY->format('Y-m-d');
			$candidates[] = $dtY->format('d/m/Y');
		}

		// If input looks like d/m/Y
		$dtD = \DateTime::createFromFormat('d/m/Y', $birthdate);
		if ($dtD && $dtD->format('d/m/Y') === $birthdate) {
			$candidates[] = $dtD->format('Y-m-d');
			$candidates[] = $dtD->format('d/m/Y');
		}

		// Ensure we have at least the raw value as a fallback
		$candidates[] = $birthdate;

		// Try each candidate format until a match is found
		foreach (array_unique($candidates) as $candidate) {
			$stmt = $this->pdo->prepare(
				'SELECT * FROM users WHERE email = :email AND data_nascimento = :data_nascimento LIMIT 1'
			);

			$stmt->execute([
				':email' => $email,
				':data_nascimento' => $candidate
			]);

			$user = $stmt->fetch(PDO::FETCH_ASSOC);
			if ($user) {
				return $user;
			}
		}

		return null;
	}

	private function validateUserData(string $email, string $password, string $birthdate, string $role): void
	{
		$email = strtolower(trim($email));
		$role = strtolower(trim($role));

		if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
			throw new Exception('Email inválido');
		}

		if (strlen($password) < 6) {
			throw new Exception('Senha deve ter no mínimo 6 caracteres');
		}

		$dt = DateTime::createFromFormat('Y-m-d', $birthdate);

		if (!$dt || $dt->format('Y-m-d') !== $birthdate) {
			throw new Exception('Data de aniversário inválida');
		}

		if (!in_array($role, self::ROLES, true)) {
			throw new Exception('Role inválido. Use: admin ou customer');
		}
	}

	private function verifyPassword(string $password, array $user): bool
	{
		if (password_verify($password, $user['password'])) {
			return true;
		}

		return $user['password'] === $password;
	}

	private function rehashPasswordIfNeeded(array $user, string $password): void
	{
		if (
			$user['password'] === $password &&
			!password_needs_rehash($user['password'], PASSWORD_BCRYPT)
		) {
			$hashed = password_hash($password, PASSWORD_BCRYPT);

			$stmt = $this->pdo->prepare(
				'UPDATE users SET password = :password WHERE id = :id'
			);

			$stmt->execute([
				':password' => $hashed,
				':id' => $user['id']
			]);
		}
	}
}

