<?php

require_once __DIR__ . '/../../config/database.php';

class Settings
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connection();
    }

    /**
     * Buscar todas as configurações
     */
    public function getAll(): array
    {
        $stmt = $this->pdo->query("SELECT setting_key, setting_value FROM settings");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $settings = [];
        foreach ($results as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }

        return $settings;
    }

    /**
     * Buscar uma configuração específica
     */
    public function get(string $key): ?string
    {
        $stmt = $this->pdo->prepare("SELECT setting_value FROM settings WHERE setting_key = :key");
        $stmt->execute([':key' => $key]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? $result['setting_value'] : null;
    }

    /**
     * Atualizar uma configuração
     */
    public function set(string $key, string $value): bool
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO settings (setting_key, setting_value, updated_at) 
            VALUES (:key, :value, datetime('now'))
            ON CONFLICT(setting_key) 
            DO UPDATE SET setting_value = :value, updated_at = datetime('now')
        ");

        return $stmt->execute([
            ':key' => $key,
            ':value' => $value
        ]);
    }

    /**
     * Atualizar múltiplas configurações
     */
    public function setMultiple(array $settings): bool
    {
        $this->pdo->beginTransaction();

        try {
            foreach ($settings as $key => $value) {
                $this->set($key, $value);
            }

            $this->pdo->commit();
            return true;

        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Deletar uma configuração
     */
    public function delete(string $key): bool
    {
        $stmt = $this->pdo->prepare("DELETE FROM settings WHERE setting_key = :key");
        return $stmt->execute([':key' => $key]);
    }
}
