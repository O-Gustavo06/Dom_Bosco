<?php

class SettingsController
{
	public function index()
	{
		// Retornar configurações (exemplo)
		echo json_encode([
			'site_name' => 'Dom Bosco',
			'maintenance_mode' => false
		]);
	}

	public function update()
	{
		// Atualizar configurações (exemplo)
		echo json_encode([
			'success' => true,
			'message' => 'Configurações atualizadas com sucesso!'
		]);
	}
}
