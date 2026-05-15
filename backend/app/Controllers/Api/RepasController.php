<?php 

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\{RepasModel, AvisModel, CategorieModel};

class RepasController extends BaseController
{
    // GET /api/repas
    public function index()
    {
        $model     = new RepasModel();
        $categorie = $this->request->getGet('categorie');
        $repas = $categorie
            ? $model->getByCategorie((int)$categorie)
            : $model->getDisponibles();
        return $this->response->setJSON(['status'=>true,'data'=>$repas]);
    }

    // GET /api/repas/{id}
    public function show(int $id)
    {
        $repas = (new RepasModel())->find($id);
        if (!$repas) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'=>false,'message'=>'Repas introuvable.'
            ]);
        }
        $avisModel        = new AvisModel();
        $repas['avis']    = $avisModel->getByRepas($id);
        $repas['note_moy']= $avisModel->moyenneRepas($id);
        return $this->response->setJSON(['status'=>true,'data'=>$repas]);
    }

    // POST /api/repas  [Admin]
    public function create()
    {
        $rules = [
            'nom'          => 'required|min_length[2]',
            'prix'         => 'required|decimal|greater_than[0]',
            'id_categorie' => 'required|integer',
            'quantite'     => 'permit_empty|integer',
            'description'  => 'permit_empty|string',
            'photo'        => 'permit_empty|uploaded[photo]|is_image[photo]|max_size[photo,2048]',
        ];

        if (!$this->validate($rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status'=>false,'errors'=>$this->validator->getErrors()
            ]);
        }

        $data = $this->request->getPost();
        
        $photo = $this->request->getFile('photo');
        if ($photo && $photo->isValid() && !$photo->hasMoved()) {
            $newName = $photo->getRandomName();
            $photo->move(ROOTPATH . 'public/uploads/repas', $newName);
            $data['photo'] = 'uploads/repas/' . $newName;
        } else {
            $data['photo'] = null; 
        }

        $id = (new RepasModel())->insert($data, true);
        return $this->response->setStatusCode(201)->setJSON([
            'status'=>true,'message'=>'Repas créé avec succès.','id'=>$id
        ]);
    }

    // PUT /api/repas/{id}  [Admin] -> Gère la modification complète avec ou sans nouvelle photo
    public function update(int $id)
    {
        $model = new RepasModel();
        $repasActuel = $model->find($id);

        if (!$repasActuel) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'=>false,'message'=>'Repas introuvable.'
            ]);
        }

        // Règles de validation adaptées pour la modification
        $rules = [
            'nom'          => 'required|min_length[2]',
            'prix'         => 'required|decimal|greater_than[0]',
            'id_categorie' => 'required|integer',
            'quantite'     => 'permit_empty|integer',
            'description'  => 'permit_empty|string',
            'status'       => 'permit_empty|in_list[disponible,non disponible,indisponible]',
            'photo'        => 'permit_empty|uploaded[photo]|is_image[photo]|max_size[photo,2048]',
        ];

        if (!$this->validate($rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status'=>false,'errors'=>$this->validator->getErrors()
            ]);
        }

        // Récupération des données textuelles du formulaire
        $data = $this->request->getPost();

        // Gestion de la nouvelle photo si elle est fournie
        $photo = $this->request->getFile('photo');
        if ($photo && $photo->isValid() && !$photo->hasMoved()) {
            
            // 1. Supprimer l'ancienne photo du serveur si elle existe
            if (!empty($repasActuel['photo'])) {
                $ancienChemin = ROOTPATH . 'public/' . $repasActuel['photo'];
                if (file_exists($ancienChemin)) {
                    @unlink($ancienChemin);
                }
            }

            // 2. Uploader la nouvelle photo
            $newName = $photo->getRandomName();
            $photo->move(ROOTPATH . 'public/uploads/repas', $newName);
            $data['photo'] = 'uploads/repas/' . $newName;
        } else {
            // Si aucune nouvelle photo n'est envoyée, on garde l'ancienne intacte
            unset($data['photo']);
        }

        // Mise à jour en base de données
        $model->update($id, $data);

        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Repas mis à jour avec succès.'
        ]);
    }

    // DELETE /api/repas/{id}  [Admin]
    public function delete(int $id)
    {
        $model = new RepasModel();
        $repas = $model->find($id);

        if (!$repas) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'=>false,'message'=>'Repas introuvable.'
            ]);
        }

        // Suppression du fichier image lié avant de supprimer la ligne
        if (!empty($repas['photo'])) {
            $cheminFichier = ROOTPATH . 'public/' . $repas['photo'];
            if (file_exists($cheminFichier)) {
                @unlink($cheminFichier);
            }
        }

        $model->delete($id);
        return $this->response->setJSON(['status'=>true,'message'=>'Repas supprimé de la carte.']);
    }

    // PATCH /api/repas/{id}/status  [Admin]
    public function toggleStatus(int $id)
    {
        $model = new RepasModel();
        $repas = $model->find($id);
        if (!$repas) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'=>false,'message'=>'Repas introuvable.'
            ]);
        }
        $newStatus = $repas['status']==='disponible' ? 'indisponible' : 'disponible';
        $model->update($id, ['status'=>$newStatus]);
        return $this->response->setJSON(['status'=>true,'nouveau_status'=>$newStatus]);
    }
}