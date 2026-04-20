<?php namespace App\Models;
use CodeIgniter\Model;
 
class PanierModel extends Model
{
    protected $table         = 'panier';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $allowedFields = ['id_user'];
 
    // Panier actif d'un user (ou création si inexistant)
    public function getOrCreate(int $userId): array
    {
        $panier = $this->where('id_user', $userId)->first();
        if (!$panier) {
            $id = $this->insert(['id_user' => $userId], true);
            $panier = $this->find($id);
        }
        return $panier;
    }
 
    // Panier avec tous ses repas et le total
    public function getWithItems(int $userId): array
    {
        $panier = $this->getOrCreate($userId);
        $panierRepasModel = new PanierRepasModel();
        $items = $panierRepasModel->getByPanier($panier['id']);
        $total = array_sum(array_map(
            fn($i) => $i['prix_unitaire'] * $i['quantite'], $items
        ));
        $panier['items'] = $items;
        $panier['total'] = $total;
        return $panier;
    }
}
