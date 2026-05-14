<?php

namespace App\Models;

use CodeIgniter\Model;

class CategorieModel extends Model
{
    protected $table            = 'categories';
    protected $primaryKey       = 'id';
    protected $useTimestamps    = true;
    protected $allowedFields    = ['libelle', 'description', 'icone'];

    // Validation intégrée au modèle
    protected $validationRules = [
        'libelle' => 'required|min_length[2]|max_length[100]',
    ];

    /**
     * Récupère toutes les catégories avec le nombre de repas associés
     * Utile pour la page d'accueil ou les listes globales
     */
    public function withRepasCount()
    {
        return $this->select('categories.*, COUNT(repas.id) as nb_repas')
                    ->join('repas', 'repas.id_categorie = categories.id', 'left')
                    ->groupBy('categories.id')
                    ->findAll();
    }

    /**
     * Récupère UNE catégorie avec la LISTE complète de ses repas
     * Résout l'erreur BadMethodCallException dans CategorieController::show()
     */
    public function withRepas(int $id)
    {
        $categorie = $this->find($id);

        if (!$categorie) {
            return null;
        }

        // On récupère les repas liés
        $db = \Config\Database::connect();
        $repas = $db->table('repas')
                    ->where('id_categorie', $id)
                    ->get()
                    ->getResultArray();

        $categorie['repas'] = $repas;

        return $categorie;
    }
}