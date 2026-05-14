<?php namespace App\Controllers\Api;
use App\Controllers\BaseController;
use App\Models\AvisModel;
 
class AvisController extends BaseController
{
    private int $userId;
    public function __construct()
    {
        $this->userId = (int) service('request')->userId;
    }
 
    // GET /api/avis/repas/{id}
    public function byRepas(int $repasId)
    {
        $model = new AvisModel();
        return $this->response->setJSON([
            'status'   => true,
            'note_moy' => $model->moyenneRepas($repasId),
            'data'     => $model->getByRepas($repasId),
        ]);
    }
 
    // POST /api/avis
    public function store()
    {
        $repasId = (int) $this->request->getVar('id_repas');
        $model   = new AvisModel();
        if ($model->dejaNote($this->userId, $repasId)) {
            return $this->response->setStatusCode(400)->setJSON([
                'status'=>false,'message'=>'Vous avez déjà noté ce repas.'
            ]);
        }
        if (!$this->validate(['note'=>'required|integer|greater_than[0]|less_than[6]'])) {
            return $this->response->setStatusCode(422)->setJSON([
                'status'=>false,'errors'=>$this->validator->getErrors()
            ]);
        }
        $model->insert([
            'id_user'     => $this->userId,
            'id_repas'    => $repasId,
            'note'        => $this->request->getVar('note'),
            'commentaire' => $this->request->getVar('commentaire'),
        ]);
        return $this->response->setStatusCode(201)->setJSON([
            'status'=>true,'message'=>'Avis soumis. Merci !'
        ]);
    }
 
    // DELETE /api/avis/{id}
    public function delete(int $id)
    {
        $avis = (new AvisModel())->find($id);
        if (!$avis || $avis['id_user'] !== $this->userId) {
            return $this->response->setStatusCode(403)->setJSON([
                'status'=>false,'message'=>'Non autorisé.'
            ]);
        }
        (new AvisModel())->delete($id);
        return $this->response->setJSON(['status'=>true,'message'=>'Avis supprimé.']);
    }
}
