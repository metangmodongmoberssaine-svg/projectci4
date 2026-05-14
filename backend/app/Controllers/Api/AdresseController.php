<?php namespace App\Controllers\Api;
use App\Controllers\BaseController;
use App\Models\AdresseModel;
 
class AdresseController extends BaseController
{
    private int $userId;
 
    public function __construct()
    {
        $this->userId = (int) service('request')->userId;
    }
 
    // GET /api/adresses
    public function index()
    {
        $adresses = (new AdresseModel())->getByUser($this->userId);
        return $this->response->setJSON([
            'status' => true,
            'data'   => $adresses,
        ]);
    }
 
    // POST /api/adresses
    public function store()
    {
        $rules = [
            'libelle' => 'required|min_length[2]|max_length[100]',
            'adresse' => 'required|min_length[5]',
            'ville'   => 'required|min_length[2]',
        ];
        if (!$this->validate($rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status' => false,
                'errors' => $this->validator->getErrors(),
            ]);
        }
        $model = new AdresseModel();
        $data  = [
            'id_user' => $this->userId,
            'libelle' => $this->request->getVar('libelle'),
            'adresse' => $this->request->getVar('adresse'),
            'ville'   => $this->request->getVar('ville'),
        ];
        // Si c'est la première adresse, la mettre par défaut automatiquement
        $existantes = $model->getByUser($this->userId);
        if (empty($existantes)) {
            $data['is_default'] = 1;
        }
        $id = $model->insert($data, true);
        return $this->response->setStatusCode(201)->setJSON([
            'status'  => true,
            'message' => 'Adresse ajoutée.',
            'id'      => $id,
        ]);
    }
 
    // PUT /api/adresses/{id}
    public function update(int $id)
    {
        $model   = new AdresseModel();
        $adresse = $model->find($id);
        if (!$adresse || $adresse['id_user'] !== $this->userId) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Adresse introuvable.',
            ]);
        }
        $model->update($id, $this->request->getRawInput());
        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Adresse mise à jour.',
        ]);
    }
 
    // DELETE /api/adresses/{id}
    public function delete(int $id)
    {
        $model   = new AdresseModel();
        $adresse = $model->find($id);
        if (!$adresse || $adresse['id_user'] !== $this->userId) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Adresse introuvable.',
            ]);
        }
        // Empêcher la suppression de l'adresse par défaut si d'autres existent
        if ($adresse['is_default']) {
            $autres = $model->getByUser($this->userId);
            if (count($autres) > 1) {
                return $this->response->setStatusCode(400)->setJSON([
                    'status'  => false,
                    'message' => 'Définissez une autre adresse par défaut avant de supprimer celle-ci.',
                ]);
            }
        }
        $model->delete($id);
        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Adresse supprimée.',
        ]);
    }
 
    // PATCH /api/adresses/{id}/default
    public function setDefault(int $id)
    {
        $model   = new AdresseModel();
        $adresse = $model->find($id);
        if (!$adresse || $adresse['id_user'] !== $this->userId) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Adresse introuvable.',
            ]);
        }
        // Met is_default=0 sur toutes, puis 1 sur celle-ci
        $model->setDefault($id, $this->userId);
        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Adresse définie comme adresse par défaut.',
        ]);
    }
}
 

