<?php namespace App\Models;
use CodeIgniter\Model;
 
class PromotionModel extends Model
{
    protected $table         = 'promotions';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $allowedFields = [
        'id_repas','id_categorie','code','valeur',
        'type','date_debut','date_fin','is_actif'
    ];
 
    // Vérifier si un code promo est valide aujourd'hui
    public function findValidCode(string $code): ?array
    {
        $today = date('Y-m-d');
        return $this->where('code', $code)
            ->where('is_actif', 1)
            ->where('date_debut <=', $today)
            ->where('date_fin >=', $today)
            ->first();
    }
 
    // Calculer la remise selon le type de promotion
    public function calculerRemise(array $promo, float $montant): float
    {
        if ($promo['type'] === 'pourcentage') {
            return round($montant * $promo['valeur'] / 100, 2);
        }
        return min($promo['valeur'], $montant);
    }
}
