<?php namespace App\Models;
use CodeIgniter\Model;
 
class CommandeRepasModel extends Model {
protected $table = 'commande_repas';
protected $primaryKey = 'id';
protected $useTimestamps = true;
 
protected $allowedFields = [
'id_commande','id_repas','quantite','prix_snapshot',
];
 
// Détails d'une commande avec noms des repas
public function detailCommande(int $commandeId) {
return $this->select('commande_repas.*, repas.nom, repas.photo,
(commande_repas.quantite * commande_repas.prix_snapshot) as sous_total')->join('repas','repas.id = commande_repas.id_repas')->where('commande_repas.id_commande', $commandeId)->findAll();
}
 
// Insérer les lignes depuis le panier
public function insererDepuisPanier(int $commandeId, array $items): void {
foreach ($items as $item) {
$this->insert([
'id_commande' => $commandeId,
'id_repas' => $item['id_repas'],
'quantite' => $item['quantite'],
'prix_snapshot' => $item['prix_unitaire'],
]);
}
}
}