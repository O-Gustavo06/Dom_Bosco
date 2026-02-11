<?php

namespace App\Http\Controllers\Api\Admin;

require_once __DIR__ . '/../../../../Models/Category.php';
require_once __DIR__ . '/../../../Response.php';
require_once __DIR__ . '/../../../Middleware/Authenticate.php';
require_once __DIR__ . '/../../../Middleware/CheckRole.php';

use App\Http\Response;
use App\Http\Middleware\Authenticate;
use App\Http\Middleware\CheckRole;

class CategoryController
{
    private \Category $categoryModel;

    public function __construct()
    {
        $this->categoryModel = new \Category();
    }

    public function index(): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        try {
            $categories = $this->categoryModel->getAll();
            Response::json($categories);
        } catch (\Exception $e) {
            Response::error('Erro ao buscar categorias: ' . $e->getMessage(), 500);
        }
    }
}
