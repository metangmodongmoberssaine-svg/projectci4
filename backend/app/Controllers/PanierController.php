<?php namespace App\Controllers\Api;
use App\Controllers\BaseController;
use App\Models\{PanierModel, PanierRepasModel, RepasModel};
 
class PanierController extends BaseController
{
    private int $userId;
 
    public function __construct()
    {
        // L'id du user connecté est injecté par le filtre JWT
        $this->userId = (int) service('request')->userId;
    }
 
    // GET /api/panier
    public function index()
    {
        $panier = (new PanierModel())->getWithItems($this->userId);
        return $this->response->setJSON(['status'=>true,'data'=>$panier]);
    }
 
    // POST /api/panier/add
    public function add()
    {
        $repasId = (int) $this->request->getVar('id_repas');
        $qty     = (int) $this->request->getVar('quantite') ?: 1;
        $repas   = (new RepasModel())->find($repasId);
        if (!$repas || $repas['status'] === 'indisponible') {
            return $this->response->setStatusCode(400)->setJSON([
                'status'=>false,'message'=>'Repas indisponible.'
            ]);
        }
        $panier = (new PanierModel())->getOrCreate($this->userId);
        (new PanierRepasModel())->addOrUpdate($panier['id'], $repasId, $qty, $repas['prix']);
        return $this->response->setJSON(['status'=>true,'message'=>'Repas ajouté au panier.']);
    }
 
    // PUT /api/panier/item/{id}
    public function update(int $itemId)
    {
        $qty = (int) $this->request->getVar('quantite');
        if ($qty < 1) {
            return $this->response->setStatusCode(400)->setJSON([
                'status'=>false,'message'=>'Quantité invalide.'
            ]);
        }
        (new PanierRepasModel())->update($itemId, ['quantite'=>$qty]);
        return $this->response->setJSON(['status'=>true,'message'=>'Quantité mise à jour.']);
    }
 
    // DELETE /api/panier/item/{id}
    public function remove(int $itemId)
    {
        (new PanierRepasModel())->delete($itemId);
        return $this->response->setJSON(['status'=>true,'message'=>'Repas retiré du panier.']);
    }
 
    // DELETE /api/panier/clear
    public function clear()
    {
        $panier = (new PanierModel())->getOrCreate($this->userId);
        (new PanierRepasModel())->clearPanier($panier['id']);
        return $this->response->setJSON(['status'=>true,'message'=>'Panier vidé.']);
    }
}
 
