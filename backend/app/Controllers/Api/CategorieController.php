<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\CategorieModel;
use CodeIgniter\API\ResponseTrait;

class CategorieController extends BaseController
{
    use ResponseTrait;

    protected $model;

    public function __construct()
    {
        $this->model = new CategorieModel();
    }

    /**
     * Liste des catégories avec pagination
     * GET /api/categories
     */
    public function index()
    {
        $perPage = $this->request->getVar('per_page') ?? 10;
        
        $data = [
            'status'     => true,
            'categories' => $this->model->paginate($perPage),
            'pager'      => [
                'current_page' => $this->model->pager->getCurrentPage(),
                'per_page'     => $this->model->pager->getPerPage(),
                'total'        => $this->model->pager->getTotal(),
                'last_page'    => $this->model->pager->getPageCount(),
            ]
        ];

        return $this->response->setJSON($data);
    }

    /**
     * Détails d'une catégorie
     * GET /api/categories/{id}
     */
    public function show($id = null)
    {
        $data = $this->model->withRepas($id);

        if (!$data) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Catégorie introuvable.'
            ]);
        }

        return $this->response->setJSON([
            'status' => true,
            'data'   => $data
        ]);
    }

    /**
     * Création d'une catégorie
     * POST /api/categories
     */
    public function create()
    {
        // Récupération identique à ton AuthController (JSON ou Form-Data)
        $input = $this->request->getJSON(true) ?: $this->request->getPost();

        $rules = [
            'libelle'     => 'required|min_length[2]|is_unique[categories.libelle]',
            'description' => 'permit_empty|min_length[5]',
        ];

        if (!$this->validateData($input, $rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status' => false,
                'errors' => $this->validator->getErrors()
            ]);
        }

        if ($this->model->insert($input)) {
            return $this->response->setStatusCode(201)->setJSON([
                'status'  => true,
                'message' => 'Catégorie créée avec succès.',
                'id'      => $this->model->getInsertID()
            ]);
        }

        return $this->response->setStatusCode(500)->setJSON([
            'status'  => false,
            'message' => 'Erreur lors de la création.'
        ]);
    }

    /**
     * Mise à jour
     * PUT /api/categories/{id}
     */
    public function update($id = null)
    {
        if (!$this->model->find($id)) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Catégorie inexistante.'
            ]);
        }

        // Pour le PUT, on récupère le flux JSON
        $input = $this->request->getJSON(true) ?: $this->request->getRawInput();
        
        if (isset($input['libelle']) && strlen($input['libelle']) < 2) {
            return $this->response->setStatusCode(422)->setJSON([
                'status' => false,
                'errors' => ['libelle' => 'Le libellé est trop court.']
            ]);
        }

        if ($this->model->update($id, $input)) {
            return $this->response->setJSON([
                'status'  => true,
                'message' => 'Catégorie mise à jour avec succès.'
            ]);
        }

        return $this->response->setStatusCode(500)->setJSON([
            'status'  => false,
            'message' => 'Échec de la mise à jour.'
        ]);
    }

    /**
     * Suppression
     * DELETE /api/categories/{id}
     */
    public function delete($id = null)
    {
        if (!$this->model->find($id)) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Catégorie introuvable.'
            ]);
        }

        if ($this->model->delete($id)) {
            return $this->response->setJSON([
                'status'  => true,
                'message' => 'Catégorie supprimée.'
            ]);
        }

        return $this->response->setStatusCode(500)->setJSON([
            'status'  => false,
            'message' => 'Erreur lors de la suppression.'
        ]);
    }
}