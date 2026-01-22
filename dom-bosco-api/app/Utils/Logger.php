<?php

class Logger
{
    private string $logFile;
    private string $logDir;

    public function __construct(string $fileName = 'app.log')
    {
        $this->logDir = __DIR__ . '/../../storage/logs';
        $this->logFile = $this->logDir . '/' . $fileName;
        
        // Cria o diretório de logs se não existir
        if (!is_dir($this->logDir)) {
            mkdir($this->logDir, 0755, true);
        }
    }

    public function info(string $message, array $context = []): void
    {
        $this->log('INFO', $message, $context);
    }

    public function warning(string $message, array $context = []): void
    {
        $this->log('WARNING', $message, $context);
    }

    public function error(string $message, array $context = []): void
    {
        $this->log('ERROR', $message, $context);
    }

    public function exception(\Throwable $exception, string $message = ''): void
    {
        $context = [
            'exception' => get_class($exception),
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString()
        ];
        
        $logMessage = $message ? $message . ': ' : 'Exception: ';
        $this->log('ERROR', $logMessage . $exception->getMessage(), $context);
    }

    private function log(string $level, string $message, array $context = []): void
    {
        $timestamp = date('Y-m-d H:i:s');
        $contextStr = !empty($context) ? ' ' . json_encode($context) : '';
        $logMessage = "[$timestamp] [$level] $message$contextStr" . PHP_EOL;
        
        file_put_contents($this->logFile, $logMessage, FILE_APPEND);
    }
}
