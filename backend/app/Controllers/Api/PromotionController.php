<?php 

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\PromotionModel;

class PromotionController extends BaseController
{
    // GET /api/promotions (Avec filtres optionnels transmis par query params)
    public function index()
    {
        $model = new PromotionModel();
        
        // Construction de la requête de base avec jointures
        $builder = $model->select('promotions.*, repas.nom as repas_nom, categories.libelle as categorie_nom')
                         ->join('repas', 'repas.id = promotions.id_repas', 'left')
                         ->join('categories', 'categories.id = promotions.id_categorie', 'left');

        // --- APPLICATION DES FILTRES DYNAMIQUES VIA LA ROUTE ---
        $idRepas     = $this->request->getGet('id_repas');
        $idCategorie = $this->request->getGet('id_categorie');
        $isActif     = $this->request->getGet('is_actif');

        if ($idRepas !== null && $idRepas !== '') {
            $builder->where('promotions.id_repas', $idRepas);
        }
        if ($idCategorie !== null && $idCategorie !== '') {
            $builder->where('promotions.id_categorie', $idCategorie);
        }
        if ($isActif !== null && $isActif !== '') {
            $builder->where('promotions.is_actif', $isActif);
        }

        $promotions = $builder->orderBy('promotions.created_at', 'DESC')->findAll();

        return $this->response->setJSON([
            'status' => true,
            'data'   => $promotions,
        ]);
    }

    // POST /api/promotions
    public function store()
    {
        // Validation mise à jour pour exiger le montant calculé ou saisi
        $rules = [
            'type'       => 'required|in_list[pourcentage,montant_fixe]',
            'new_amount' => 'required|decimal|greater_than[0]', // Ajout de la règle pour le nouveau montant
            'date_debut' => 'required|valid_date[Y-m-d]',
            'date_fin'   => 'required|valid_date[Y-m-d]',
        ];

        if (!$this->validate($rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status' => false,
                'errors' => $this->validator->getErrors(),
            ]);
        }

        $idRepas     = $this->request->getVar('id_repas');
        $idCategorie = $this->request->getVar('id_categorie');

        // Sécurité : Une promo ne peut pas cibler à la fois un plat unique ET une catégorie
        if ($idRepas && $idCategorie) {
            return $this->response->setStatusCode(400)->setJSON([
                'status'  => false,
                'message' => 'Une promo cible soit un repas, soit une catégorie, pas les deux.',
            ]);
        }

        // Enregistrement avec la colonne 'new_amount'
        $id = (new PromotionModel())->insert([
            'type'         => $this->request->getVar('type'),
            'new_amount'   => $this->request->getVar('new_amount'), // Prise en compte du nouveau montant
            'date_debut'   => $this->request->getVar('date_debut'),
            'date_fin'     => $this->request->getVar('date_fin'),
            'id_repas'     => $idRepas ?: null,
            'id_categorie' => $idCategorie ?: null,
            'is_actif'     => 1,
        ], true);

        return $this->response->setStatusCode(201)->setJSON([
            'status'  => true,
            'message' => ($idRepas === null && $idCategorie === null) 
                         ? 'Promotion globale créée (Toutes les catégories).' 
                         : 'Promotion créée avec succès.',
            'id'      => $id,
        ]);
    }

    // PUT /api/promotions/{id}// PUT /api/promotions/{id}
public function update(int $id)
{
    $model = new PromotionModel();
    if (!$model->find($id)) {
        return $this->response->setStatusCode(404)->setJSON([
            'status'  => false,
            'message' => 'Promotion introuvable.',
        ]);
    }
    
    // Récupérer proprement les données envoyées (gère le JSON envoyé par Axios)
    $input = $this->request->getJSON(true);
    
    // Si ce n'est pas du JSON, on se rabat sur le raw input classique
    if (empty($input)) {
        $input = $this->request->getRawInput();
    }

    // Sécurité CRITIQUE : Supprimer l'ID des données à mettre à jour
    // Si 'id' est présent dans le tableau, CI4 tente de modifier la clé primaire
    if (isset($input['id'])) {
        unset($input['id']);
    }

    // Validation ou nettoyage rapide des champs optionnels vides passés par le front
    if (array_key_exists('id_repas', $input) && ($input['id_repas'] === '' || $input['id_repas'] === 'null')) {
        $input['id_repas'] = null;
    }
    if (array_key_exists('id_categorie', $input) && ($input['id_categorie'] === '' || $input['id_categorie'] === 'null')) {
        $input['id_categorie'] = null;
    }

    try {
        $model->update($id, $input);
        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Promotion mise à jour.',
        ]);
    } catch (\Exception $e) {
        return $this->response->setStatusCode(500)->setJSON([
            'status'  => false,
            'message' => 'Erreur lors de la mise à jour en base de données.',
            'error'   => $e->getMessage() // À retirer en production pour la sécurité
        ]);
    }
    // 
}

    // DELETE /api/promotions/{id}
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

    // PATCH /api/promotions/{id}/toggle
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