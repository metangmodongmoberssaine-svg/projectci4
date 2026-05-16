<?php

namespace App\Models;

use CodeIgniter\Model;

class RepasModel extends Model 
{
    protected $table = 'repas';
    protected $primaryKey = 'id';
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    // Mise à jour : temps_preparation retiré
    protected $allowedFields = [
        'id_categorie',
        'nom',
        'description',
        'prix',
        'quantite',
        'photo',
        'status',
    ];

    protected $validationRules = [
        'nom'          => 'required|min_length[2]',
        'prix'         => 'required|decimal|greater_than[0]',
        'id_categorie' => 'required|integer',
    ];

    /**
     * Récupère les repas disponibles avec le libellé de leur catégorie
     */
    public function getDisponibles() 
    {
        return $this->select('repas.*, categories.libelle as categorie')
                    ->join('categories', 'categories.id = repas.id_categorie')
                    ->where('repas.status', 'disponible')
                    ->findAll();
    }

    /**
     * Récupère les repas par catégorie (Uniquement ceux disponibles)
     */
    public function parCategorie(int $idCategorie) 
    {
        return $this->select('repas.*, categories.libelle as categorie')
                    ->join('categories', 'categories.id = repas.id_categorie')
                    ->where('repas.id_categorie', $idCategorie)
                    ->where('repas.status', 'disponible')
                    ->findAll();
    }

    /**
     * Recherche simple par nom
     */
    public function rechercher(string $terme) 
    {
        return $this->like('nom', $terme)->findAll();
    }
}