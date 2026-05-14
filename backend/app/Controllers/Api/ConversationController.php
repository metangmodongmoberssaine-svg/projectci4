<?php namespace App\Controllers\Api;
use App\Controllers\BaseController;
use App\Models\{ConversationModel, MessageModel};
 
class ConversationController extends BaseController
{
    private int $userId;
    private string $userRole;
    public function __construct()
    {
        $req            = service('request');
        $this->userId   = (int) $req->userId;
        $this->userRole = $req->userRole ?? 'client';
    }
 
    // GET /api/conversations
    public function index()
    {
        $convs = (new ConversationModel())->getByUser($this->userId);
        return $this->response->setJSON(['status'=>true,'data'=>$convs]);
    }
 
    // POST /api/conversations
    public function create()
    {
        if (!$this->validate(['sujet'=>'required|min_length[5]'])) {
            return $this->response->setStatusCode(422)->setJSON([
                'status'=>false,'errors'=>$this->validator->getErrors()
            ]);
        }
        $id = (new ConversationModel())->insert([
            'id_user' => $this->userId,
            'sujet'   => $this->request->getVar('sujet'),
        ], true);
        return $this->response->setStatusCode(201)->setJSON([
            'status'=>true,'message'=>'Conversation ouverte.','id'=>$id
        ]);
    }
 
    // GET /api/conversations/{id}/messages
    public function messages(int $convId)
    {
        $msgs = (new MessageModel())->getByConversation($convId);
        // Marquer les messages de l'autre partie comme lus
        $type = $this->userRole === 'client' ? 'client' : 'agent';
        (new MessageModel())->markReadByClient($convId);
        return $this->response->setJSON(['status'=>true,'data'=>$msgs]);
    }
 
    // POST /api/conversations/{id}/messages
    public function send(int $convId)
    {
        if (!$this->validate(['contenu'=>'required|min_length[1]'])) {
            return $this->response->setStatusCode(422)->setJSON([
                'status'=>false,'errors'=>$this->validator->getErrors()
            ]);
        }
        $type = in_array($this->userRole, ['admin','agent']) ? 'agent' : 'client';
        (new MessageModel())->insert([
            'id_conversation' => $convId,
            'id_expediteur'   => $this->userId,
            'contenu'         => $this->request->getVar('contenu'),
            'type_expediteur' => $type,
        ]);
        return $this->response->setStatusCode(201)->setJSON([
            'status'=>true,'message'=>'Message envoyé.'
        ]);
    }
 
    // GET /api/conversations/ouvertes  [Admin]
    public function ouvertes()
    {
        $convs = (new ConversationModel())->getOuvertes();
        return $this->response->setJSON(['status'=>true,'data'=>$convs]);
    }
 
    // PATCH /api/conversations/{id}/assigner  [Admin]
    public function assigner(int $convId)
    {
        $agentId = (int) $this->request->getVar('id_agent');
        (new ConversationModel())->assignerAgent($convId, $agentId);
        return $this->response->setJSON(['status'=>true,'message'=>'Agent assigné.']);
    }
}
 
