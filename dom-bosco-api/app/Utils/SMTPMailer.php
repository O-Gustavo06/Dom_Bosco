<?php
namespace App\Utils;

class SMTPMailer
{
    private $host;
    private $port;
    private $username;
    private $password;
    private $encryption;
    private $from;
    private $fromName;
    private $to = [];
    private $subject;
    private $body;
    private $isHTML = true;
    private $charset = 'UTF-8';
    private $socket;
    private $error;

    public function __construct()
    {
        
        require_once __DIR__ . '/../../config/env.php';
        
        $this->host = env('SMTP_HOST', 'smtp.gmail.com');
        $this->port = (int)env('SMTP_PORT', 587);
        $this->username = env('SMTP_USERNAME', '');
        $this->password = env('SMTP_PASSWORD', '');
        $this->encryption = env('SMTP_ENCRYPTION', 'tls');
        $this->from = env('SMTP_FROM_EMAIL', 'noreply@dombosco.com');
        $this->fromName = env('SMTP_FROM_NAME', 'Dom Bosco');
    }

    public function setFrom($email, $name = '')
    {
        $this->from = $email;
        if ($name) {
            $this->fromName = $name;
        }
    }

    public function addAddress($email, $name = '')
    {
        $this->to[] = ['email' => $email, 'name' => $name];
    }

    public function isHTML($isHTML = true)
    {
        $this->isHTML = $isHTML;
    }

    public function setSubject($subject)
    {
        $this->subject = $subject;
    }

    public function setBody($body)
    {
        $this->body = $body;
    }

    public function send()
    {
        try {
            if (empty($this->to)) {
                throw new \Exception('Nenhum destinatário especificado');
            }
            
            if (empty($this->subject)) {
                throw new \Exception('Assunto não especificado');
            }

            if (!$this->connect()) {
                throw new \Exception('Falha ao conectar no servidor SMTP: ' . $this->error);
            }

            if (!$this->sendMail()) {
                throw new \Exception('Falha ao enviar email: ' . $this->error);
            }

            $this->disconnect();
            return true;

        } catch (\Exception $e) {
            $this->error = $e->getMessage();
            error_log("SMTPMailer Error: " . $e->getMessage());
            $this->disconnect();
            return false;
        }
    }

    private function connect()
    {
        try {
            $protocol = '';
            
            if ($this->encryption === 'ssl') {
                $protocol = 'ssl://';
            }

            $this->socket = @fsockopen(
                $protocol . $this->host,
                $this->port,
                $errno,
                $errstr,
                30
            );

            if (!$this->socket) {
                $this->error = "Erro ao conectar: $errstr ($errno)";
                return false;
            }

            $response = $this->getResponse();
            if (substr($response, 0, 3) !== '220') {
                $this->error = "Resposta inválida do servidor: $response";
                return false;
            }

            $this->sendCommand("EHLO " . $this->host);
            
            if ($this->encryption === 'tls') {
                $this->sendCommand("STARTTLS");
                
                if (!stream_socket_enable_crypto($this->socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                    $this->error = "Falha ao iniciar TLS";
                    return false;
                }
                
                $this->sendCommand("EHLO " . $this->host);
            }

            if (!empty($this->username) && !empty($this->password)) {
                $this->sendCommand("AUTH LOGIN");
                $this->sendCommand(base64_encode($this->username));
                $this->sendCommand(base64_encode($this->password));
            }

            return true;

        } catch (\Exception $e) {
            $this->error = $e->getMessage();
            return false;
        }
    }

    private function sendMail()
    {
        try {
            $this->sendCommand("MAIL FROM:<{$this->from}>");

            foreach ($this->to as $recipient) {
                $this->sendCommand("RCPT TO:<{$recipient['email']}>");
            }

            $this->sendCommand("DATA");
            $headers = $this->buildHeaders();
            fputs($this->socket, $headers . "\r\n");

            fputs($this->socket, $this->body . "\r\n");

            fputs($this->socket, ".\r\n");
            
            $response = $this->getResponse();
            if (substr($response, 0, 3) !== '250') {
                $this->error = "Erro ao enviar dados: $response";
                return false;
            }

            return true;

        } catch (\Exception $e) {
            $this->error = $e->getMessage();
            return false;
        }
    }

    private function buildHeaders()
    {
        $headers = [];
        
        
        $from = $this->fromName ? "\"$this->fromName\" <{$this->from}>" : $this->from;
        $headers[] = "From: $from";
        
        
        $toList = [];
        foreach ($this->to as $recipient) {
            $toList[] = $recipient['name'] ? "\"{$recipient['name']}\" <{$recipient['email']}>" : $recipient['email'];
        }
        $headers[] = "To: " . implode(', ', $toList);
        
        
        $headers[] = "Subject: =?UTF-8?B?" . base64_encode($this->subject) . "?=";
        
        
        $headers[] = "MIME-Version: 1.0";
        
        if ($this->isHTML) {
            $headers[] = "Content-Type: text/html; charset={$this->charset}";
        } else {
            $headers[] = "Content-Type: text/plain; charset={$this->charset}";
        }
        
        $headers[] = "Content-Transfer-Encoding: base64";
        $headers[] = "Date: " . date('r');
        $headers[] = "Message-ID: <" . md5(uniqid(time())) . "@{$this->host}>";
        $headers[] = "X-Mailer: SMTPMailer/1.0";
        
        return implode("\r\n", $headers);
    }

    private function sendCommand($command)
    {
        fputs($this->socket, $command . "\r\n");
        $response = $this->getResponse();
        
        $code = substr($response, 0, 3);
        
        
        if ($code[0] !== '2' && $code[0] !== '3') {
            throw new \Exception("Comando falhou: $command | Resposta: $response");
        }
        
        return $response;
    }

    private function getResponse()
    {
        $response = '';
        while ($line = fgets($this->socket, 515)) {
            $response .= $line;
            if (substr($line, 3, 1) === ' ') {
                break;
            }
        }
        return trim($response);
    }

    private function disconnect()
    {
        if ($this->socket) {
            fputs($this->socket, "QUIT\r\n");
            fclose($this->socket);
            $this->socket = null;
        }
    }

    public function getError()
    {
        return $this->error;
    }
}
