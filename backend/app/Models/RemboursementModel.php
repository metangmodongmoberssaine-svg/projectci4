<?php namespace App\Models;
use CodeIgniter\Model;
 
class RemboursementModel extends Model
{
    protected $table         = 'remboursements';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $allowedFields = [
        'id_commande','id_user','id_paiement',
        'montant','motif','statut','reference_retour'
    ];
 
    // Remboursements d'un utilisateur
    public function getByUser(int $userId): array
    {
        return $this->where('id_user', $userId)
            ->orderBy('created_at','DESC')->findAll();
    }
 
    // Approuver un remboursement
    public function approuver(int $id, string $ref): bool
    {
        return $this->update($id, [
            'statut'           => 'effectue',
            'reference_retour' => $ref,
        ]);
    }
 
    // Rejeter un remboursement
    public function rejeter(int $id): bool
    {
        return $this->update($id, ['statut' => 'rejete']);
    }
}
