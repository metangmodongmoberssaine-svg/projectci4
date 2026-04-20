<?php namespace App\Models;
use CodeIgniter\Model;
 
class RepasModel extends Model {
protected $table = 'repas';
protected $primaryKey = 'id';
protected $useTimestamps = true;
 
protected $allowedFields = [
'id_categorie','nom','description','prix',
'quantite','photo','temps_preparation','status',
];
 
protected $validationRules = [
'nom' => 'required|min_length[2]',
'prix' => 'required|decimal|greater_than[0]',
'id_categorie' => 'required|integer',
];
 
// Repas disponibles avec leur catégorie
public function getDisponibles() {
return $this->select('repas.*, categories.libelle as categorie')->join('categories','categories.id = repas.id_categorie')->where('repas.status','disponible')->findAll();
}
 
// Filtrer par catégorie
public function parCategorie(int $idCategorie) {
return $this->where('id_categorie', $idCategorie)->where('status', 'disponible')->findAll();
}
 
// Recherche par nom
public function rechercher(string $terme) {
return $this->like('nom', $terme)->findAll();
}
}