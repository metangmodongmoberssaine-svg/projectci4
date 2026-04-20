<?php namespace App\Models;
use CodeIgniter\Model;
 
class PanierRepasModel extends Model
{
    protected $table         = 'panier_repas';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $allowedFields = [
        'id_panier','id_repas','quantite','prix_unitaire'
    ];
 
    // Tous les items d'un panier avec les infos du repas
    public function getByPanier(int $panierId): array
    {
        return $this->select('panier_repas.*, repas.nom, repas.photo, repas.status')
            ->join('repas','repas.id = panier_repas.id_repas')
            ->where('panier_repas.id_panier', $panierId)
            ->findAll();
    }
 
    // Ajouter ou incrémenter un repas dans le panier
    public function addOrUpdate(int $panierId, int $repasId, int $qty, float $prix): void
    {
        $existing = $this->where('id_panier', $panierId)
            ->where('id_repas', $repasId)->first();
        if ($existing) {
            $this->update($existing['id'], ['quantite' => $existing['quantite'] + $qty]);
        } else {
            $this->insert([
                'id_panier'     => $panierId,
                'id_repas'      => $repasId,
                'quantite'      => $qty,
                'prix_unitaire' => $prix,
            ]);
        }
    }
 
    // Vider un panier
    public function clearPanier(int $panierId): void
    {
        $this->where('id_panier', $panierId)->delete();
    }
}
 
