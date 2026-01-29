<?php

class SettingsController
{
	public function index()
	{
		echo json_encode([
			'site_name' => 'Dom Bosco',
			'maintenance_mode' => false
		]);
	}

	public function update()
	{
		echo json_encode([
			'success' => true,
			'message' => 'Configurações atualizadas com sucesso!'
		]);
	}
}
