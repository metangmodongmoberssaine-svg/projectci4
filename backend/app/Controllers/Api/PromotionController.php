<?php namespace App\Controllers\Api;
use App\Controllers\BaseController;
use App\Models\PromotionModel;
 
class PromotionController extends BaseController
{
    // GET /api/promotions  [Admin]
    public function index()
    {
        $promotions = (new PromotionModel())
            ->select('promotions.*, repas.nom as repas_nom, categories.libelle as categorie_nom')
            ->join('repas','repas.id = promotions.id_repas','left')
            ->join('categories','categories.id = promotions.id_categorie','left')
            ->orderBy('promotions.created_at','DESC')
            ->findAll();
        return $this->response->setJSON([
            'status' => true,
            'data'   => $promotions,
        ]);
    }
 
    // POST /api/promotions  [Admin]
    public function store()
    {
        $rules = [
            'code'       => 'required|min_length[3]|is_unique[promotions.code]',
            'valeur'     => 'required|decimal|greater_than[0]',
            'type'       => 'required|in_list[pourcentage,montant_fixe]',
            'date_debut' => 'required|valid_date[Y-m-d]',
            'date_fin'   => 'required|valid_date[Y-m-d]',
        ];
        if (!$this->validate($rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status' => false,
                'errors' => $this->validator->getErrors(),
            ]);
        }
        // Vérifier qu'on cible repas OU catégorie, pas les deux
        $idRepas     = $this->request->getVar('id_repas');
        $idCategorie = $this->request->getVar('id_categorie');
        if ($idRepas && $idCategorie) {
            return $this->response->setStatusCode(400)->setJSON([
                'status'  => false,
                'message' => 'Une promo cible soit un repas, soit une catégorie, pas les deux.',
            ]);
        }
        $id = (new PromotionModel())->insert([
            'code'         => strtoupper($this->request->getVar('code')),
            'valeur'       => $this->request->getVar('valeur'),
            'type'         => $this->request->getVar('type'),
            'date_debut'   => $this->request->getVar('date_debut'),
            'date_fin'     => $this->request->getVar('date_fin'),
            'id_repas'     => $idRepas     ?: null,
            'id_categorie' => $idCategorie ?: null,
            'is_actif'     => 1,
        ], true);
        return $this->response->setStatusCode(201)->setJSON([
            'status'  => true,
            'message' => 'Promotion créée.',
            'id'      => $id,
        ]);
    }
 
    // PUT /api/promotions/{id}  [Admin]
    public function update(int $id)
    {
        $model = new PromotionModel();
        if (!$model->find($id)) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Promotion introuvable.',
            ]);
        }
        $model->update($id, $this->request->getRawInput());
        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Promotion mise à jour.',
        ]);
    }
 
    // DELETE /api/promotions/{id}  [Admin]
    public function delete(int $id)
    {
        $model = new PromotionModel();
        if (!$model->find($id)) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Promotion introuvable.',
            ]);
        }
        $model->delete($id);
        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Promotion supprimée.',
        ]);
    }
 
    // POST /api/promotions/verifier  [JWT]
    // Appelé par React avant validation de la commande
    public function verifier()
    {
        $code  = $this->request->getVar('code');
        $model = new PromotionModel();
        $promo = $model->findValidCode($code);
        if (!$promo) {
            return $this->response->setStatusCode(400)->setJSON([
                'status'  => false,
                'message' => 'Code promo invalide ou expiré.',
            ]);
        }
        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Code valide !',
            'promo'   => [
                'id'     => $promo['id'],
                'code'   => $promo['code'],
                'valeur' => $promo['valeur'],
                'type'   => $promo['type'],
            ],
        ]);
    }
 
    // PATCH /api/promotions/{id}/toggle  [Admin]
    public function toggle(int $id)
    {
        $model = new PromotionModel();
        $promo = $model->find($id);
        if (!$promo) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Promotion introuvable.',
            ]);
        }
        $newStatut = $promo['is_actif'] ? 0 : 1;
        $model->update($id, ['is_actif' => $newStatut]);
        return $this->response->setJSON([
            'status'    => true,
            'is_actif'  => $newStatut,
            'message'   => $newStatut ? 'Promotion activée.' : 'Promotion désactivée.',
        ]);
    }
}
 
