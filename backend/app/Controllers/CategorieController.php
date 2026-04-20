<?php namespace App\Controllers\Api;
use App\Controllers\BaseController;
use App\Models\CategorieModel;
 
class CategorieController extends BaseController
{
    // GET /api/categories
    public function index()
    {
        $categories = (new CategorieModel())->findAll();
        return $this->response->setJSON(['status'=>true,'data'=>$categories]);
    }
 
    // GET /api/categories/{id}
    public function show(int $id)
    {
        $data = (new CategorieModel())->withRepas($id);
        if (!$data) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'=>false,'message'=>'Catégorie introuvable.'
            ]);
        }
        return $this->response->setJSON(['status'=>true,'data'=>$data]);
    }
 
    // POST /api/categories  [Admin]
    public function create()
    {
        if (!$this->validate(['libelle'=>'required|min_length[2]'])) {
            return $this->response->setStatusCode(422)->setJSON([
                'status'=>false,'errors'=>$this->validator->getErrors()
            ]);
        }
        $id = (new CategorieModel())->insert($this->request->getPost(), true);
        return $this->response->setStatusCode(201)->setJSON([
            'status'=>true,'message'=>'Catégorie créée.','id'=>$id
        ]);
    }
 
    // PUT /api/categories/{id}  [Admin]
    public function update(int $id)
    {
        (new CategorieModel())->update($id, $this->request->getRawInput());
        return $this->response->setJSON(['status'=>true,'message'=>'Catégorie mise à jour.']);
    }
 
    // DELETE /api/categories/{id}  [Admin]
    public function delete(int $id)
    {
        (new CategorieModel())->delete($id);
        return $this->response->setJSON(['status'=>true,'message'=>'Catégorie supprimée.']);
    }
}
