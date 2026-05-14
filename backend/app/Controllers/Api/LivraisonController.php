<?php namespace App\Controllers\Api;
use App\Controllers\BaseController;
use App\Models\{LivraisonModel, CommandeModel, NotificationModel};
 
class LivraisonController extends BaseController
{
    private int    $userId;
    private string $userRole;
 
    public function __construct()
    {
        $req            = service('request');
        $this->userId   = (int) $req->userId;
        $this->userRole = $req->userRole ?? 'client';
    }
 
    // GET /api/livraisons/{commandeId}
    // Le client suit sa livraison via l'id de sa commande
    public function show(int $commandeId)
    {
        $livraison = (new LivraisonModel())->getByCommande($commandeId);
        if (!$livraison) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Aucune livraison trouvée pour cette commande.',
            ]);
        }
        return $this->response->setJSON([
            'status' => true,
            'data'   => $livraison,
        ]);
    }
 
    // POST /api/livraisons  [Admin]
    // Assigner un livreur à une commande
    public function assigner()
    {
        $rules = [
            'id_commande' => 'required|integer',
            'id_livreur'  => 'required|integer',
        ];
        if (!$this->validate($rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status' => false,
                'errors' => $this->validator->getErrors(),
            ]);
        }
        $commandeId = (int) $this->request->getVar('id_commande');
        $livreurId  = (int) $this->request->getVar('id_livreur');
        $heureEstimee = $this->request->getVar('heure_estimee');
 
        $id = (new LivraisonModel())->insert([
            'id_commande'   => $commandeId,
            'id_livreur'    => $livreurId,
            'heure_estimee' => $heureEstimee,
            'statut'        => 'assignee',
        ], true);
 
        // Mettre à jour le livreur dans la commande
        (new CommandeModel())->update($commandeId, [
            'id_livreur' => $livreurId,
            'status'     => 'en_livraison',
        ]);
 
        // Notifier le client
        $commande = (new CommandeModel())->find($commandeId);
        (new NotificationModel())->insert([
            'id_user'  => $commande['id_user'],
            'titre'    => 'Votre commande est en route !',
            'message'  => 'Un livreur a été assigné à votre commande.',
            'type'     => 'livraison',
        ]);
 
        return $this->response->setStatusCode(201)->setJSON([
            'status'  => true,
            'message' => 'Livreur assigné avec succès.',
            'id'      => $id,
        ]);
    }
 
    // PATCH /api/livraisons/{id}/position  [Livreur]
    public function updatePosition(int $id)
    {
        $gps = $this->request->getVar('position_gps');
        if (!$gps) {
            return $this->response->setStatusCode(400)->setJSON([
                'status'  => false,
                'message' => 'Position GPS manquante.',
            ]);
        }
        $livraison = (new LivraisonModel())->find($id);
        if (!$livraison || $livraison['id_livreur'] !== $this->userId) {
            return $this->response->setStatusCode(403)->setJSON([
                'status'  => false,
                'message' => 'Non autorisé.',
            ]);
        }
        (new LivraisonModel())->updatePosition($id, $gps);
        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Position mise à jour.',
        ]);
    }
 
    // PATCH /api/livraisons/{id}/statut  [Livreur]
    public function changerStatut(int $id)
    {
        $statut    = $this->request->getVar('statut');
        $statutsOk = ['en_route', 'livree'];
        if (!in_array($statut, $statutsOk)) {
            return $this->response->setStatusCode(400)->setJSON([
                'status'  => false,
                'message' => 'Statut invalide. Valeurs acceptées : en_route, livree.',
            ]);
        }
        $livraison = (new LivraisonModel())->find($id);
        if (!$livraison || $livraison['id_livreur'] !== $this->userId) {
            return $this->response->setStatusCode(403)->setJSON([
                'status'  => false,
                'message' => 'Non autorisé.',
            ]);
        }
        (new LivraisonModel())->update($id, ['statut' => $statut]);
 
        // Si livraison terminée → mettre la commande à 'livree' + notifier client
        if ($statut === 'livree') {
            $commande = (new CommandeModel())->find($livraison['id_commande']);
            (new CommandeModel())->changerStatut($livraison['id_commande'], 'livree');
            (new NotificationModel())->insert([
                'id_user'  => $commande['id_user'],
                'titre'    => 'Commande livrée !',
                'message'  => 'Votre commande a été livrée. Bon appétit !',
                'type'     => 'livraison',
            ]);
        }
        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Statut livraison mis à jour.',
        ]);
    }
 
    // GET /api/livraisons/mes-livraisons  [Livreur]
    public function mesLivraisons()
    {
        $livraisons = (new LivraisonModel())->getByLivreur($this->userId);
        return $this->response->setJSON([
            'status' => true,
            'data'   => $livraisons,
        ]);
    }
 
    // GET /api/livraisons/toutes  [Admin]
    public function toutes()
    {
        $livraisons = (new LivraisonModel())
            ->select('livraisons.*, commande.adresse_livraison, commande.montant_total,
                      users.nom as livreur_nom, users.prenom as livreur_prenom,
                      users.telephone as livreur_telephone')
            ->join('commande','commande.id = livraisons.id_commande')
            ->join('users','users.id = livraisons.id_livreur')
            ->orderBy('livraisons.created_at','DESC')
            ->findAll();
        return $this->response->setJSON([
            'status' => true,
            'data'   => $livraisons,
        ]);
    }
}
