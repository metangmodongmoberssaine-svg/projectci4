<?php namespace App\Controllers\Api;
use App\Controllers\BaseController;
use App\Models\{RepasModel, AvisModel, CategorieModel};
 
class RepasController extends BaseController
{
    // GET /api/repas
    public function index()
    {
        $model    = new RepasModel();
        $categorie = $this->request->getGet('categorie');
        $repas = $categorie
            ? $model->getByCategorie((int)$categorie)
            : $model->getDisponibles();
        return $this->response->setJSON(['status'=>true,'data'=>$repas]);
    }
 
    // GET /api/repas/{id}
    public function show(int $id)
    {
        $repas = (new RepasModel())->find($id);
        if (!$repas) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'=>false,'message'=>'Repas introuvable.'
            ]);
        }
        $avisModel        = new AvisModel();
        $repas['avis']    = $avisModel->getByRepas($id);
        $repas['note_moy']= $avisModel->moyenneRepas($id);
        return $this->response->setJSON(['status'=>true,'data'=>$repas]);
    }
 
    // POST /api/repas  [Admin]
    public function create()
    {
        $rules = [
            'nom'          => 'required|min_length[2]',
            'prix'         => 'required|decimal|greater_than[0]',
            'id_categorie' => 'required|integer',
        ];
        if (!$this->validate($rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status'=>false,'errors'=>$this->validator->getErrors()
            ]);
        }
        $data = $this->request->getPost();
        // Gestion upload photo
        $photo = $this->request->getFile('photo');
        if ($photo && $photo->isValid()) {
            $photo->move(WRITEPATH.'uploads/repas');
            $data['photo'] = 'uploads/repas/'.$photo->getName();
        }
        $id = (new RepasModel())->insert($data, true);
        return $this->response->setStatusCode(201)->setJSON([
            'status'=>true,'message'=>'Repas créé.','id'=>$id
        ]);
    }
 
    // PUT /api/repas/{id}  [Admin]
    public function update(int $id)
    {
        $model = new RepasModel();
        if (!$model->find($id)) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'=>false,'message'=>'Repas introuvable.'
            ]);
        }
        $model->update($id, $this->request->getRawInput());
        return $this->response->setJSON(['status'=>true,'message'=>'Repas mis à jour.']);
    }
 
    // DELETE /api/repas/{id}  [Admin]
    public function delete(int $id)
    {
        $model = new RepasModel();
        if (!$model->find($id)) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'=>false,'message'=>'Repas introuvable.'
            ]);
        }
        $model->delete($id);
        return $this->response->setJSON(['status'=>true,'message'=>'Repas supprimé.']);
    }
 
    // PATCH /api/repas/{id}/status  [Admin]
    public function toggleStatus(int $id)
    {
        $model = new RepasModel();
        $repas = $model->find($id);
        if (!$repas) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'=>false,'message'=>'Repas introuvable.'
            ]);
        }
        $newStatus = $repas['status']==='disponible' ? 'indisponible' : 'disponible';
        $model->update($id, ['status'=>$newStatus]);
        return $this->response->setJSON(['status'=>true,'nouveau_status'=>$newStatus]);
    }
}
