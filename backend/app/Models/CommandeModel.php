<?php namespace App\Models;
use CodeIgniter\Model;
 
class CommandeModel extends Model
{
    protected $table         = 'commande';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $allowedFields = [
        'id_user','id_livreur','id_promotion',
        'adresse_livraison','montant_total','montant_remise','status'
    ];
 
    // Toutes les commandes d'un client avec statut
    public function getByUser(int $userId): array
    {
        return $this->where('id_user', $userId)
            ->orderBy('created_at','DESC')
            ->findAll();
    }
 
    // Commande complète avec ses repas
    public function getDetail(int $commandeId): ?array
    {
        $commande = $this->find($commandeId);
        if (!$commande) return null;
        $cmdRepasModel = new CommandeRepasModel();
        $commande['repas'] = $cmdRepasModel->getByCommande($commandeId);
        return $commande;
    }
 
    // Changer le statut d'une commande
    public function changerStatut(int $id, string $statut): bool
    {
        return $this->update($id, ['status' => $statut]);
    }
 
    // Toutes commandes en attente (pour l'admin)
    public function getEnAttente(): array
    {
        return $this->select('commande.*, users.nom, users.prenom, users.telephone')
            ->join('users','users.id = commande.id_user')
            ->where('commande.status','en_attente')
            ->orderBy('commande.created_at','ASC')
            ->findAll();
    }
}
