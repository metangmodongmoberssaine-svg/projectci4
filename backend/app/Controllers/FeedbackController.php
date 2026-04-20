<?php namespace App\Controllers\Api;
use App\Controllers\BaseController;
use App\Models\FeedbackModel;
 
class FeedbackController extends BaseController
{
    private int $userId;
    public function __construct()
    {
        $this->userId = (int) service('request')->userId;
    }
 
    // POST /api/feedback
    public function store()
    {
        if (!$this->validate(['note'=>'required|integer|greater_than[0]|less_than[6]'])) {
            return $this->response->setStatusCode(422)->setJSON([
                'status'=>false,'errors'=>$this->validator->getErrors()
            ]);
        }
        (new FeedbackModel())->insert([
            'id_user'     => $this->userId,
            'note'        => $this->request->getVar('note'),
            'commentaire' => $this->request->getVar('commentaire'),
        ]);
        return $this->response->setStatusCode(201)->setJSON([
            'status'=>true,'message'=>'Feedback envoyé. Merci pour votre retour !'
        ]);
    }
 
    // GET /api/feedback  [Admin]
    public function index()
    {
        $data = (new FeedbackModel())->getAllWithUser();
        return $this->response->setJSON(['status'=>true,'data'=>$data]);
    }
 
    // GET /api/feedback/moyenne
    public function moyenne()
    {
        $moy = (new FeedbackModel())->moyenneGlobale();
        return $this->response->setJSON(['status'=>true,'moyenne'=>$moy]);
    }
}
 
