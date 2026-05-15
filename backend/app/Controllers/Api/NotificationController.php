<?php namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\NotificationModel;

class NotificationController extends BaseController
{
    private int $userId;
    private NotificationModel $model;

    public function __construct()
    {
        $this->model = new NotificationModel();
        // On récupère l'ID via le service request (injecté par ton Middleware/Filter Auth)
        $this->userId = (int) (service('request')->userId ?? 0);
    }

    // LISTER : GET /api/notifications
    public function index()
    {
        $notifs = $this->model->getByUser($this->userId);
        $unread = $this->model->countUnread($this->userId);

        return $this->response->setJSON([
            'status' => true,
            'unread' => $unread,
            'data'   => $notifs,
        ]);
    }

    // MARQUER LU : PATCH /api/notifications/read/[:id]
    // Si l'ID est passé, on marque une seule. Sinon tout.
    public function markRead($id = null)
    {
        $this->model->markAsRead($this->userId, $id ? (int)$id : null);
        return $this->response->setJSON([
            'status' => true, 
            'message' => $id ? 'Notification lue.' : 'Toutes les notifications marquées comme lues.'
        ]);
    }

    // ENVOYER (ADMIN) : POST /api/notifications/send
    public function send()
    {
        $rules = [
            'titre'   => 'required',
            'message' => 'required',
            'target'  => 'required' // 'all' ou l'ID de l'utilisateur
        ];

        if (!$this->validate($rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status' => false, 
                'errors' => $this->validator->getErrors()
            ]);
        }

        $target  = $this->request->getVar('target');
        $titre   = $this->request->getVar('titre');
        $message = $this->request->getVar('message');
        $type    = $this->request->getVar('type') ?? 'info';

        if ($target === 'all') {
            $this->model->broadcast($titre, $message, $type);
            $msg = "Notification envoyée à tous les utilisateurs.";
        } else {
            $this->model->sendDirect((int)$target, $titre, $message, $type);
            $msg = "Notification envoyée à l'utilisateur.";
        }

        return $this->response->setJSON(['status' => true, 'message' => $msg]);
    }
}