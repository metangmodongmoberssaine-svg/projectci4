<?php namespace App\Controllers\Api;
use App\Controllers\BaseController;
use App\Models\NotificationModel;
 
class NotificationController extends BaseController
{
    private int $userId;
    public function __construct()
    {
        $this->userId = (int) service('request')->userId;
    }
 
    // GET /api/notifications
    public function index()
    {
        $model = new NotificationModel();
        $notifs = $model->getByUser($this->userId);
        $unread = $model->countUnread($this->userId);
        return $this->response->setJSON([
            'status' => true,
            'unread' => $unread,
            'data'   => $notifs,
        ]);
    }
 
    // PATCH /api/notifications/read-all
    public function readAll()
    {
        (new NotificationModel())->markAllRead($this->userId);
        return $this->response->setJSON(['status'=>true,'message'=>'Tout marqué comme lu.']);
    }
 
    // POST /api/notifications/broadcast  [Admin]
    public function broadcast()
    {
        $rules = ['titre'=>'required','message'=>'required'];
        if (!$this->validate($rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status'=>false,'errors'=>$this->validator->getErrors()
            ]);
        }
        (new NotificationModel())->broadcast(
            $this->request->getVar('titre'),
            $this->request->getVar('message'),
            $this->request->getVar('type') ?? 'info'
        );
        return $this->response->setJSON(['status'=>true,'message'=>'Notification envoyée à tous.']);
    }
}
 
