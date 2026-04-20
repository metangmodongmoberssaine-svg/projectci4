<?php namespace App\Models;
use CodeIgniter\Model;
 
class LivraisonModel extends Model
{
    protected $table         = 'livraisons';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $allowedFields = [
        'id_commande','id_livreur','position_gps','heure_estimee','statut'
    ];
 
    // Livraison d'une commande
    public function getByCommande(int $commandeId): ?array
    {
        return $this->where('id_commande', $commandeId)->first();
    }
 
    // Livraisons assignées à un livreur
    public function getByLivreur(int $livreurId): array
    {
        return $this->where('id_livreur', $livreurId)
            ->where('statut !=','livree')
            ->findAll();
    }
 
    // Mettre à jour la position GPS
    public function updatePosition(int $id, string $gps): bool
    {
        return $this->update($id, ['position_gps' => $gps]);
    }
}
