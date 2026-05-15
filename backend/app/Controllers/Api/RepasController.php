<?php 

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\{RepasModel, AvisModel, CategorieModel};
// Importation du modèle de promotion pour vérifier les offres actives
use App\Models\PromotionModel; 

class RepasController extends BaseController
{
    /**
     * GET /api/client/repas
     * Route spécifique pour l'affichage côté client avec calcul dynamique des promotions.
     */
    public function clientIndex()
    {
        $repasModel = new RepasModel();
        $promoModel = new PromotionModel();
        
        $categorie = $this->request->getGet('categorie');
        $repasListe = $categorie
            ? $repasModel->getByCategorie((int)$categorie)
            : $repasModel->getDisponibles();

        // Récupérer toutes les promotions actives à la date d'aujourd'hui
        $dateAujourdhui = date('Y-m-d');
        $promotionsActives = $promoModel->where('is_actif', 1)
                                        ->where('date_debut <=', $dateAujourdhui)
                                        ->where('date_fin >=', $dateAujourdhui)
                                        ->findAll();

        // Séparer les promotions globales des promotions spécifiques pour optimiser le traitement
        $promoGlobale = null;
        $promosParRepas = [];

        foreach ($promotionsActives as $promo) {
            if (empty($promo['id_repas'])) {
                // On garde la promotion globale (la dernière trouvée si plusieurs)
                $promoGlobale = $promo;
            } else {
                // Indexation par l'ID du repas pour un accès direct en O(1)
                $promosParRepas[$promo['id_repas']] = $promo;
            }
        }

        // Traitement de chaque repas pour lui injecter les détails de tarification
        foreach ($repasListe as &$repas) {
            $prixOriginal = (float) $repas['prix'];
            $promotionAppliquee = null;

            // 1. Vérification d'une promotion spécifique sur le plat
            if (isset($promosParRepas[$repas['id']])) {
                $promotionAppliquee = $promosParRepas[$repas['id']];
            } 
            // 2. Sinon, repli sur la promotion globale si elle existe
            elseif ($promoGlobale !== null) {
                $promotionAppliquee = $promoGlobale;
            }

            // Calcul du nouveau prix si une offre est éligible
            if ($promotionAppliquee) {
                $repas['en_promotion'] = true;
                $repas['prix_normal']   = $prixOriginal; // Ancien prix à barrer
                
                $valeurReduction = (float) $promotionAppliquee['new_amount'];

                if ($promotionAppliquee['type'] === 'pourcentage') {
                    // Exemple : 2000 - (2000 * 10 / 100) = 1800
                    $repas['prix'] = $prixOriginal - ($prixOriginal * ($valeurReduction / 100));
                    $repas['reduction_formatee'] = $valeurReduction . '%';
                } else {
                    // Exemple : 2000 - 500 = 1500
                    // On s'assure que le prix ne devienne pas négatif
                    $repas['prix'] = max(0, $prixOriginal - $valeurReduction);
                    $repas['reduction_formatee'] = $valeurReduction . ' FCFA';
                }
            } else {
                // Pas de promotion sur ce plat
                $repas['en_promotion'] = false;
                $repas['prix_normal']   = $prixOriginal;
                $repas['prix']          = $prixOriginal;
            }
        }

        return $this->response->setJSON(['status' => true, 'data' => $repasListe]);
    }

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

    // PUT /api/repas/{id}  [Admin]
    public function update(int $id)
    {
        $model = new RepasModel();
        $repasActuel = $model->find($id);

        if (!$repasActuel) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'=>false,'message'=>'Repas introuvable.'
            ]);
        }

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

        $data = $this->request->getPost();

        $photo = $this->request->getFile('photo');
        if ($photo && $photo->isValid() && !$photo->hasMoved()) {
            
            if (!empty($repasActuel['photo'])) {
                $ancienChemin = ROOTPATH . 'public/' . $repasActuel['photo'];
                if (file_exists($ancienChemin)) {
                    @unlink($ancienChemin);
                }
            }

            $newName = $photo->getRandomName();
            $photo->move(ROOTPATH . 'public/uploads/repas', $newName);
            $data['photo'] = 'uploads/repas/' . $newName;
        } else {
            unset($data['photo']);
        }

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