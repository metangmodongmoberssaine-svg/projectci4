<?php namespace App\Models;
use CodeIgniter\Model;
 
class FactureModel extends Model
{
    protected $table         = 'factures';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $allowedFields = ['id_commande','montant_total','pdf_url'];
 
    // Facture d'une commande
    public function getByCommande(int $commandeId): ?array
    {
        return $this->where('id_commande', $commandeId)->first();
    }
 
    // Créer une facture après paiement
    public function creer(int $commandeId, float $montant): int
    {
        return $this->insert([
            'id_commande'   => $commandeId,
            'montant_total' => $montant,
        ], true);
    }
}
