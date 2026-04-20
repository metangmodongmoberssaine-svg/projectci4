<?php namespace App\Controllers\Api;
use App\Controllers\BaseController;
use App\Models\{RemboursementModel, PaiementModel, CommandeModel};
 
class RemboursementController extends BaseController
{
    private int $userId;
    public function __construct()
    {
        $this->userId = (int) service('request')->userId;
    }
 
    // GET /api/remboursements
    public function index()
    {
        $data = (new RemboursementModel())->getByUser($this->userId);
        return $this->response->setJSON(['status'=>true,'data'=>$data]);
    }
 
    // POST /api/remboursements
    public function store()
    {
        $commandeId = (int) $this->request->getVar('id_commande');
        $commande   = (new CommandeModel())->find($commandeId);
        if (!$commande || $commande['id_user'] !== $this->userId) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'=>false,'message'=>'Commande introuvable.'
            ]);
        }
        if ($commande['status'] !== 'annulee') {
            return $this->response->setStatusCode(400)->setJSON([
                'status'=>false,'message'=>'La commande doit être annulée pour demander un remboursement.'
            ]);
        }
        $paiement = (new PaiementModel())->getByCommande($commandeId);
        if (!$paiement || $paiement['statut'] !== 'reussi') {
            return $this->response->setStatusCode(400)->setJSON([
                'status'=>false,'message'=>'Aucun paiement confirmé pour cette commande.'
            ]);
        }
        (new RemboursementModel())->insert([
            'id_commande' => $commandeId,
            'id_user'     => $this->userId,
            'id_paiement' => $paiement['id'],
            'montant'     => $paiement['montant'],
            'motif'       => $this->request->getVar('motif'),
        ]);
        return $this->response->setStatusCode(201)->setJSON([
            'status'=>true,'message'=>'Demande de remboursement soumise.'
        ]);
    }
 
    // GET /api/remboursements/tous  [Admin]
    public function tous()
    {
        $data = (new RemboursementModel())->findAll();
        return $this->response->setJSON(['status'=>true,'data'=>$data]);
    }
 
    // PATCH /api/remboursements/{id}/approuver  [Admin]
    public function approuver(int $id)
    {
        $ref = $this->request->getVar('reference_retour');
        (new RemboursementModel())->approuver($id, $ref);
        return $this->response->setJSON(['status'=>true,'message'=>'Remboursement approuvé.']);
    }
 
    // PATCH /api/remboursements/{id}/rejeter  [Admin]
    public function rejeter(int $id)
    {
        (new RemboursementModel())->rejeter($id);
        return $this->response->setJSON(['status'=>true,'message'=>'Remboursement rejeté.']);
    }
}
 
