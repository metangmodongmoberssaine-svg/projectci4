<?php namespace App\Models;
use CodeIgniter\Model;
 
class CategorieModel extends Model {
protected $table = 'categories';
protected $primaryKey = 'id';
protected $useTimestamps = true;
 
protected $allowedFields = [
'libelle', 'description', 'icone',
];
 
protected $validationRules = [
'libelle' => 'required|min_length[2]|max_length[100]',
];
 
// Récupérer les catégories avec le nombre de repas
public function withRepasCount() {
return $this->select('categories.*, COUNT(repas.id) as nb_repas')->join('repas','repas.id_categorie = categories.id','left')->groupBy('categories.id')->findAll();
}
}