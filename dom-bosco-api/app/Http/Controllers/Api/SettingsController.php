<?php

namespace App\Http\Controllers\Api;

require_once __DIR__ . '/../../../Models/Settings.php';
require_once __DIR__ . '/../../Response.php';
require_once __DIR__ . '/../../Middleware/Authenticate.php';
require_once __DIR__ . '/../../Middleware/CheckRole.php';

use App\Http\Response;
use App\Http\Middleware\Authenticate;
use App\Http\Middleware\CheckRole;

class SettingsController
{
    private \Settings $settingsModel;

    public function __construct()
    {
        $this->settingsModel = new \Settings();
    }

    
    public function index(): void
    {
        try {
            $settings = $this->settingsModel->getAll();
            Response::json($settings);
        } catch (\Exception $e) {
            Response::error('Erro ao buscar configurações: ' . $e->getMessage(), 500);
        }
    }

    
    public function update(): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data)) {
            Response::error('Nenhuma configuração fornecida');
            return;
        }

        try {
            $this->settingsModel->setMultiple($data);
            Response::success(['settings' => $data], 'Configurações atualizadas com sucesso');
        } catch (\Exception $e) {
            Response::error('Erro ao atualizar configurações: ' . $e->getMessage());
        }
    }
}
