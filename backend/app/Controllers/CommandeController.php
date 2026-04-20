<?php namespace App\Controllers\Api;
use App\Controllers\BaseController;
use App\Models\{CommandeModel,CommandeRepasModel,PanierModel,PanierRepasModel,PromotionModel,RepasModel};
 
class CommandeController extends BaseController
{
    private int $userId;
    public function __construct()
    {
        $this->userId = (int) service('request')->userId;
    }
 
    // GET /api/commandes
    public function index()
    {
        $commandes = (new CommandeModel())->getByUser($this->userId);
        return $this->response->setJSON(['status'=>true,'data'=>$commandes]);
    }
 
    // GET /api/commandes/{id}
    public function show(int $id)
    {
        $commande = (new CommandeModel())->getDetail($id);
        if (!$commande || $commande['id_user'] !== $this->userId) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'=>false,'message'=>'Commande introuvable.'
            ]);
        }
        return $this->response->setJSON(['status'=>true,'data'=>$commande]);
    }
 
    // POST /api/commandes
    public function create()
    {
        $panier = (new PanierModel())->getWithItems($this->userId);
        if (empty($panier['items'])) {
            return $this->response->setStatusCode(400)->setJSON([
                'status'=>false,'message'=>'Votre panier est vide.'
            ]);
        }
        $total   = $panier['total'];
        $remise  = 0;
        $promoId = null;
        // Appliquer code promo si fourni
        $code = $this->request->getVar('code_promo');
        if ($code) {
            $promoModel = new PromotionModel();
            $promo = $promoModel->findValidCode($code);
            if ($promo) {
                $remise  = $promoModel->calculerRemise($promo, $total);
                $promoId = $promo['id'];
            }
        }
        // Créer la commande
        $commandeModel = new CommandeModel();
        $commandeId    = $commandeModel->insert([
            'id_user'           => $this->userId,
            'id_promotion'      => $promoId,
            'adresse_livraison' => $this->request->getVar('adresse'),
            'montant_total'     => $total - $remise,
            'montant_remise'    => $remise,
        ], true);
        // Copier les items du panier dans commande_repas
        $cmdRepasModel = new CommandeRepasModel();
        foreach ($panier['items'] as $item) {
            $cmdRepasModel->insert([
                'id_commande'   => $commandeId,
                'id_repas'      => $item['id_repas'],
                'quantite'      => $item['quantite'],
                'prix_snapshot' => $item['prix_unitaire'],
            ]);
            // Décrémenter le stock
            (new RepasModel())->decrementStock($item['id_repas'], $item['quantite']);
        }
        // Vider le panier
        (new PanierRepasModel())->clearPanier($panier['id']);
        return $this->response->setStatusCode(201)->setJSON([
            'status'=>true,'message'=>'Commande créée.','commande_id'=>$commandeId
        ]);
    }
 
    // PATCH /api/commandes/{id}/statut  [Admin]
    public function changerStatut(int $id)
    {
        $statut = $this->request->getVar('status');
        (new CommandeModel())->changerStatut($id, $statut);
        return $this->response->setJSON(['status'=>true,'message'=>'Statut mis à jour.']);
    }
 
    // POST /api/commandes/{id}/annuler
    public function annuler(int $id)
    {
        $commande = (new CommandeModel())->find($id);
        if (!$commande || $commande['id_user'] !== $this->userId) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'=>false,'message'=>'Commande introuvable.'
            ]);
        }
        if ($commande['status'] !== 'en_attente') {
            return $this->response->setStatusCode(400)->setJSON([
                'status'=>false,'message'=>'Seules les commandes en attente peuvent être annulées.'
            ]);
        }
        (new CommandeModel())->changerStatut($id, 'annulee');
        return $this->response->setJSON(['status'=>true,'message'=>'Commande annulée.']);
    }
}
 
