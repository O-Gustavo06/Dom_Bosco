<?php

namespace App\Services;

require_once __DIR__ . '/../Utils/SMTPMailer.php';
require_once __DIR__ . '/../../config/env.php';
require_once __DIR__ . '/../Models/EmailLog.php';

use App\Utils\SMTPMailer;

class EmailService
{
    private string $fromEmail;
    private string $fromName;
    private int $maxRetries = 3;
    private \EmailLog $emailLog;

    public function __construct()
    {
        $this->fromEmail = env('SMTP_FROM_EMAIL', 'noreply@dombosco.com');
        $this->fromName = env('SMTP_FROM_NAME', 'Papelaria Dom Bosco');
        $this->emailLog = new \EmailLog();
    }

    public function sendOrderConfirmation(array $order, string $customerEmail, string $customerName): bool
    {
        try {
            $subject = "✅ Pedido #{$order['id']} Confirmado!";
            $htmlBody = $this->getOrderConfirmationTemplate($order, $customerName);
            
            return $this->sendEmail(
                $customerEmail, 
                $subject, 
                $htmlBody,
                'order_confirmation',
                $customerName,
                $order['id'] ?? null
            );
            
        } catch (\Exception $e) {
            error_log("Erro ao enviar e-mail de confirmação: " . $e->getMessage());
            return false;
        }
    }
    

    public function sendStatusUpdate(array $order, string $customerEmail, string $customerName, string $newStatus): bool
    {
        try {
            $statusLabels = [
                'analise_pendente' => 'Em Análise',
                'separando' => 'Sendo Separado',
                'pronto_envio' => 'Pronto para Envio',
                'a_caminho' => 'A Caminho',
                'entregue' => 'Entregue',
                'cancelado' => 'Cancelado'
            ];
            
            $statusLabel = $statusLabels[$newStatus] ?? $newStatus;
            $subject = "📦 Atualização do Pedido #{$order['id']}";
            $htmlBody = $this->getStatusUpdateTemplate($order, $customerName, $statusLabel);
            
            return $this->sendEmail(
                $customerEmail, 
                $subject, 
                $htmlBody,
                'status_update',
                $customerName,
                $order['id'] ?? null
            );
            
        } catch (\Exception $e) {
            error_log("Erro ao enviar e-mail de atualização: " . $e->getMessage());
            return false;
        }
    }
    

    private function sendEmail(
        string $to, 
        string $subject, 
        string $htmlBody,
        string $emailType = 'general',
        ?string $recipientName = null,
        ?int $orderId = null
    ): bool
    {
        $this->logEmail($to, $subject, $htmlBody);
        
        $logId = null;
        try {
            $logId = $this->emailLog->create([
                'recipient_email' => $to,
                'recipient_name' => $recipientName,
                'subject' => $subject,
                'email_type' => $emailType,
                'order_id' => $orderId,
                'status' => 'pending',
                'attempts' => 0
            ]);
        } catch (\Exception $dbError) {
            error_log("⚠️ Aviso: Não foi possível registrar e-mail no banco: " . $dbError->getMessage());
        }
        
        $attempts = 0;
        $lastError = '';
        
        while ($attempts < $this->maxRetries) {
            $attempts++;
            
            try {
                $mail = new SMTPMailer();
                
                $mail->setFrom($this->fromEmail, $this->fromName);
                $mail->addAddress($to);
                $mail->isHTML(true);
                $mail->setSubject($subject);
                $mail->setBody($htmlBody);
                
                if ($mail->send()) {
                    if ($logId) {
                        try {
                            $this->emailLog->update($logId, [
                                'status' => 'sent',
                                'attempts' => $attempts,
                                'sent_at' => date('Y-m-d H:i:s')
                            ]);
                        } catch (\Exception $dbError) {
                            error_log("⚠️ Aviso: Não foi possível atualizar status no banco: " . $dbError->getMessage());
                        }
                    }
                    
                    error_log("✅ E-mail enviado com sucesso para: {$to}");
                    return true;
                }
                
                $lastError = $mail->getError();
                error_log("❌ Tentativa " . $attempts . " falhou: {$lastError}");
                
            } catch (\Exception $e) {
                $lastError = $e->getMessage();
                error_log("❌ Exceção na tentativa " . $attempts . ": {$lastError}");
            }
            
            if ($logId) {
                try {
                    $this->emailLog->update($logId, [
                        'attempts' => $attempts,
                        'error_message' => $lastError
                    ]);
                } catch (\Exception $dbError) {
                    error_log("⚠️ Aviso: Não foi possível atualizar tentativas no banco: " . $dbError->getMessage());
                }
            }
            
            if ($attempts < $this->maxRetries) {
                sleep(2);
            }
        }
        
        if ($logId) {
            try {
                $this->emailLog->update($logId, [
                    'status' => 'failed',
                    'attempts' => $attempts,
                    'error_message' => $lastError
                ]);
            } catch (\Exception $dbError) {
                error_log("⚠️ Aviso: Não foi possível atualizar status final no banco: " . $dbError->getMessage());
            }
        }
        
        error_log("❌ Falha ao enviar e-mail para {$to} após {$this->maxRetries} tentativas. Último erro: {$lastError}");
        return false;
    }
    

    private function getOrderConfirmationTemplate(array $order, string $customerName): string
    {
        $items = '';
        $totalItems = 0;
        
        if (isset($order['items']) && is_array($order['items'])) {
            foreach ($order['items'] as $item) {
                $itemTotal = $item['price'] * $item['quantity'];
                $totalItems += $item['quantity'];
                
                $items .= "
                    <tr style='border-bottom: 1px solid #e0e0e0;'>
                        <td style='padding: 12px 8px;'>{$item['product_name']}</td>
                        <td style='padding: 12px 8px; text-align: center;'>{$item['quantity']}x</td>
                        <td style='padding: 12px 8px; text-align: right;'>R$ " . number_format($item['price'], 2, ',', '.') . "</td>
                        <td style='padding: 12px 8px; text-align: right; font-weight: bold;'>R$ " . number_format($itemTotal, 2, ',', '.') . "</td>
                    </tr>
                ";
            }
        }
        
        $deliveryType = $order['delivery_tipo'] === 'delivery' ? '🚚 Entrega em Casa' : '🏪 Retirar na Loja';
        $deliveryInfo = '';
        
        if ($order['delivery_tipo'] === 'delivery' && !empty($order['delivery_entrega'])) {
            $deliveryInfo = "
                <div style='background: #f5f5f5; padding: 16px; border-radius: 8px; margin-top: 20px;'>
                    <h3 style='margin: 0 0 12px 0; color: #333; font-size: 16px;'>📍 Endereço de Entrega:</h3>
                    <p style='margin: 4px 0; color: #666;'>{$order['delivery_entrega']}, {$order['delivery_Numero_casa']}</p>
                    <p style='margin: 4px 0; color: #666;'>{$order['delivery_cidade']} - CEP: {$order['delivery_cep']}</p>
                </div>
            ";
        } elseif ($order['delivery_tipo'] === 'pickup') {
            $deliveryInfo = "
                <div style='background: #f0f9ff; padding: 16px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #3b82f6;'>
                    <h3 style='margin: 0 0 12px 0; color: #333; font-size: 16px;'>📍 Local de Retirada:</h3>
                    <p style='margin: 4px 0; color: #666;'><strong>Loja Dom Bosco</strong></p>
                    <p style='margin: 4px 0; color: #666;'>Rua Principal, 123 - Centro</p>
                    <p style='margin: 4px 0; color: #666;'>Horário: Segunda a Sábado, 9h às 18h</p>
                </div>
            ";
        }
        
        return "
        <!DOCTYPE html>
        <html lang='pt-BR'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Pedido Confirmado</title>
        </head>
        <body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
            <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff;'>
                <!-- Header -->
                <div style='background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); color: white; padding: 40px 20px; text-align: center;'>
                    <h1 style='margin: 0 0 10px 0; font-size: 28px;'>🎉 Pedido Confirmado!</h1>
                    <p style='margin: 0; font-size: 18px; opacity: 0.9;'>Pedido #{$order['id']}</p>
                </div>
                
                <!-- Content -->
                <div style='padding: 30px 20px;'>
                    <p style='color: #333; font-size: 16px; line-height: 1.6;'>
                        Olá <strong>{$customerName}</strong>,
                    </p>
                    <p style='color: #666; font-size: 15px; line-height: 1.6;'>
                        Recebemos seu pedido com sucesso! Estamos preparando tudo com muito carinho para você.
                    </p>
                    
                    <!-- Order Items -->
                    <h2 style='color: #333; font-size: 20px; margin: 30px 0 15px 0; border-bottom: 2px solid #8b5cf6; padding-bottom: 8px;'>
                        📦 Itens do Pedido
                    </h2>
                    <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                        <thead>
                            <tr style='background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;'>
                                <th style='padding: 12px 8px; text-align: left; color: #495057; font-weight: 600;'>Produto</th>
                                <th style='padding: 12px 8px; text-align: center; color: #495057; font-weight: 600;'>Qtd</th>
                                <th style='padding: 12px 8px; text-align: right; color: #495057; font-weight: 600;'>Preço</th>
                                <th style='padding: 12px 8px; text-align: right; color: #495057; font-weight: 600;'>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {$items}
                        </tbody>
                    </table>
                    
                    <!-- Order Summary -->
                    <div style='background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                        <div style='display: flex; justify-content: space-between; margin-bottom: 12px;'>
                            <span style='color: #666;'>Tipo de Entrega:</span>
                            <span style='color: #333; font-weight: 600;'>{$deliveryType}</span>
                        </div>
                        <div style='display: flex; justify-content: space-between; margin-bottom: 12px;'>
                            <span style='color: #666;'>Total de Itens:</span>
                            <span style='color: #333; font-weight: 600;'>{$totalItems}</span>
                        </div>
                        <div style='border-top: 2px solid #dee2e6; padding-top: 12px; margin-top: 12px;'>
                            <div style='display: flex; justify-content: space-between; align-items: center;'>
                                <span style='color: #333; font-size: 20px; font-weight: 700;'>Total:</span>
                                <span style='color: #8b5cf6; font-size: 24px; font-weight: 700;'>R$ " . number_format($order['total'], 2, ',', '.') . "</span>
                            </div>
                        </div>
                    </div>
                    
                    {$deliveryInfo}
                    
                    <!-- Status -->
                    <div style='background: #fff3cd; padding: 16px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;'>
                        <p style='margin: 0; color: #856404; font-size: 14px;'>
                            <strong>Status atual:</strong> Em Análise 🔍
                        </p>
                        <p style='margin: 8px 0 0 0; color: #856404; font-size: 13px;'>
                            Você receberá atualizações por e-mail conforme seu pedido for processado.
                        </p>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='http://localhost:3000/meus-pedidos' 
                           style='display: inline-block; background: linear-gradient(135deg, #8b5cf6, #3b82f6); 
                                  color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; 
                                  font-weight: 600; font-size: 16px;'>
                            Acompanhar Pedido
                        </a>
                    </div>
                    
                    <p style='color: #999; font-size: 13px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;'>
                        Dúvidas? Entre em contato conosco:<br>
                        📧 ricardogutomolina@gmail.com<br>
                        📱 (14) 99611-1783
                    </p>
                </div>
                
                <!-- Footer -->
                <div style='background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;'>
                    <p style='color: #6c757d; font-size: 13px; margin: 0;'>
                        © 2026 Papelaria Dom Bosco. Todos os direitos reservados.
                    </p>
                    <p style='color: #adb5bd; font-size: 12px; margin: 8px 0 0 0;'>
                        Este é um e-mail automático, por favor não responda.
                    </p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
    
    
    private function getStatusUpdateTemplate(array $order, string $customerName, string $statusLabel): string
    {
        $statusIcons = [
            'Em Análise' => '🔍',
            'Sendo Separado' => '📦',
            'Pronto para Envio' => '✅',
            'A Caminho' => '🚚',
            'Entregue' => '🎉',
            'Cancelado' => '❌'
        ];
        
        $icon = $statusIcons[$statusLabel] ?? '📦';
        
        $statusColors = [
            'Em Análise' => '#3b82f6',
            'Sendo Separado' => '#f59e0b',
            'Pronto para Envio' => '#8b5cf6',
            'A Caminho' => '#10b981',
            'Entregue' => '#059669',
            'Cancelado' => '#ef4444'
        ];
        
        $color = $statusColors[$statusLabel] ?? '#8b5cf6';
        
        return "
        <!DOCTYPE html>
        <html lang='pt-BR'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Atualização de Pedido</title>
        </head>
        <body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
            <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff;'>
                <!-- Header -->
                <div style='background: {$color}; color: white; padding: 40px 20px; text-align: center;'>
                    <div style='font-size: 48px; margin-bottom: 10px;'>{$icon}</div>
                    <h1 style='margin: 0 0 10px 0; font-size: 28px;'>Pedido Atualizado!</h1>
                    <p style='margin: 0; font-size: 18px; opacity: 0.9;'>Pedido #{$order['id']}</p>
                </div>
                
                <!-- Content -->
                <div style='padding: 30px 20px;'>
                    <p style='color: #333; font-size: 16px; line-height: 1.6;'>
                        Olá <strong>{$customerName}</strong>,
                    </p>
                    <p style='color: #666; font-size: 15px; line-height: 1.6;'>
                        Temos novidades sobre o seu pedido!
                    </p>
                    
                    <!-- Status Box -->
                    <div style='background: linear-gradient(135deg, {$color}15, {$color}05); 
                                padding: 24px; border-radius: 12px; margin: 30px 0; 
                                border-left: 4px solid {$color}; text-align: center;'>
                        <p style='margin: 0 0 8px 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;'>
                            Novo Status
                        </p>
                        <p style='margin: 0; color: {$color}; font-size: 28px; font-weight: 700;'>
                            {$icon} {$statusLabel}
                        </p>
                    </div>
                    
                    <p style='color: #666; font-size: 15px; line-height: 1.6;'>
                        Você pode acompanhar todos os detalhes do seu pedido clicando no botão abaixo:
                    </p>
                    
                    <!-- CTA Button -->
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='http://localhost:3000/meus-pedidos' 
                           style='display: inline-block; background: {$color}; 
                                  color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; 
                                  font-weight: 600; font-size: 16px;'>
                            Ver Detalhes do Pedido
                        </a>
                    </div>
                    
                    <p style='color: #999; font-size: 13px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;'>
                        Dúvidas? Entre em contato conosco:<br>
                        📧 ricardogutomolina@gmail.com<br>
                        📱 (14) 99611-1783
                    </p>
                </div>
                
                <!-- Footer -->
                <div style='background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;'>
                    <p style='color: #6c757d; font-size: 13px; margin: 0;'>
                        © 2026 Papelaria Dom Bosco. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
    
    
    private function logEmail(string $to, string $subject, string $body): void
    {
        $logDir = __DIR__ . '/../../storage/logs/emails';
        
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $filename = $logDir . '/' . date('Y-m-d_His') . '_' . md5($to . $subject) . '.html';
        
        $logContent = "
        <!--
        Para: {$to}
        Assunto: {$subject}
        Data: " . date('d/m/Y H:i:s') . "
        -->
        {$body}
        ";
        
        file_put_contents($filename, $logContent);
    }
}
