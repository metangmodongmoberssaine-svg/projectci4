<?php namespace App\Models;
use CodeIgniter\Model;
 
class PaiementModel extends Model
{
    protected $table         = 'paiement';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $allowedFields = [
        'id_commande','id_user','montant','methode','statut','reference'
    ];
 
    // Paiement d'une commande précise
    public function getByCommande(int $commandeId): ?array
    {
        return $this->where('id_commande', $commandeId)->first();
    }
 
    // Mettre à jour statut + référence après réponse du provider
    public function confirmer(int $id, string $reference): bool
    {
        return $this->update($id, [
            'statut'    => 'reussi',
            'reference' => $reference,
        ]);
    }
 
    public function echouer(int $id): bool
    {
        return $this->update($id, ['statut' => 'echoue']);
    }
}
