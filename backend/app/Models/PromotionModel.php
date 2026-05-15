<?php 

namespace App\Models;

use CodeIgniter\Model;

class PromotionModel extends Model
{
    protected $table         = 'promotions';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    
    // Mise à jour des champs autorisés (retrait de 'code' et 'valeur', ajout de 'new_amount')
    protected $allowedFields = [
        'id_repas', 
        'id_categorie', 
        'type', 
        'new_amount', 
        'date_debut', 
        'date_fin', 
        'is_actif'
    ];

    /**
     * Récupère la promotion active pour un repas spécifique (ou sa catégorie) à la date d'aujourd'hui.
     * Cette méthode te permettra de récupérer directement le 'new_amount' lors de l'affichage du menu.
     */
    public function getActivePromotionForRepas(int $idRepas, ?int $idCategorie = null): ?array
    {
        $today = date('Y-m-d');

        $builder = $this->where('is_actif', 1)
                        ->where('date_debut <=', $today)
                        ->where('date_fin >=', $today)
                        ->groupStart()
                            ->where('id_repas', $idRepas);
        
        if ($idCategorie !== null) {
            $builder->orWhere('id_categorie', $idCategorie);
        }

        return $builder->groupEnd()
                       ->orderBy('id_repas', 'DESC') // Priorité au prix spécifique du repas sur celui de la catégorie
                       ->first();
    }
}