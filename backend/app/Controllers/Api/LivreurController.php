<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class LivreurController extends ResourceController
{
    protected $modelName = 'App\Models\UserModel';
    protected $format    = 'json';

    /**
     * Liste des livreurs (Pagination + Recherche + Filtre)
     * GET /api/livreurs
     */
    public function index()
    {
        $search = $this->request->getVar('search');
        $status = $this->request->getVar('status');

        $query = $this->model->where('role', 'livreur');

        if ($search) {
            $query->groupStart()
                  ->like('nom', $search)
                  ->orLike('prenom', $search)
                  ->orLike('telephone', $search)
                  ->groupEnd();
        }

        if ($status !== null) {
            $query->where('is_actif', $status);
        }

        $perPage = 10;
        return $this->respond([
            'status' => true,
            'data'   => $query->paginate($perPage),
            'pager'  => $query->pager->getDetails(),
            'total'  => $query->countAllResults(false)
        ]);
    }

    /**
     * Créer un livreur + Code à 5 chiffres + Mail
     * POST /api/livreurs
     */
    public function create()
    {
        $rules = [
            'nom'       => 'required|min_length[2]',
            'prenom'    => 'required',
            'email'     => 'required|valid_email|is_unique[users.email]',
            'telephone' => 'required|is_unique[users.telephone]',
        ];

        if (!$this->validate($rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $tempPassword = str_pad(random_int(0, 99999), 5, '0', STR_PAD_LEFT);

        $data = [
            'nom'         => $this->request->getVar('nom'),
            'prenom'      => $this->request->getVar('prenom'),
            'email'       => $this->request->getVar('email'),
            'telephone'   => $this->request->getVar('telephone'),
            'role'        => 'livreur',
            'password'    => password_hash($tempPassword, PASSWORD_BCRYPT),
            'is_verified' => 1,
            'is_actif'    => 1,
            'created_at'  => date('Y-m-d H:i:s'),
        ];

        if ($this->model->insert($data)) {
            $this->sendCredentialsEmail($data['email'], $data['nom'], $tempPassword);

            return $this->respondCreated([
                'status'  => true,
                'message' => "Livreur créé. Code d'accès envoyé : $tempPassword",
                'email'   => $data['email']
            ]);
        }

        return $this->fail("Erreur lors de l'enregistrement.");
    }

    /**
     * Voir un livreur spécifique
     * GET /api/livreurs/(:num)
     */
    public function show($id = null)
    {
        $livreur = $this->model->where(['id' => $id, 'role' => 'livreur'])->first();
        if (!$livreur) return $this->failNotFound("Livreur introuvable.");

        return $this->respond(['status' => true, 'data' => $livreur]);
    }

    /**
     * Modifier un livreur
     * PUT /api/livreurs/(:num)
     */
    public function update($id = null)
    {
        // getRawInput() est indispensable pour récupérer les données en PUT
        $input = $this->request->getRawInput();
        
        // Sécurité : vérifier que l'ID existe ET est bien un livreur
        $exists = $this->model->where(['id' => $id, 'role' => 'livreur'])->first();
        
        if (!$exists) {
            return $this->failNotFound("Livreur inexistant.");
        }

        if ($this->model->update($id, $input)) {
            return $this->respond([
                'status' => true, 
                'message' => 'Profil livreur mis à jour avec succès.'
            ]);
        }

        return $this->fail("Échec de la mise à jour.");
    }

    /**
     * Supprimer un livreur
     * DELETE /api/livreurs/(:num)
     */
    public function delete($id = null)
    {
        $exists = $this->model->where(['id' => $id, 'role' => 'livreur'])->first();
        
        if (!$exists) {
            return $this->failNotFound("Livreur introuvable.");
        }

        if ($this->model->delete($id)) {
            return $this->respondDeleted(['status' => true, 'message' => 'Livreur supprimé.']);
        }
        
        return $this->fail("Impossible de supprimer ce compte.");
    }

    /**
     * Service interne d'envoi d'email
     */
    private function sendCredentialsEmail($to, $nom, $pass)
    {
        $email = \Config\Services::email();
        $email->setTo($to);
        $email->setSubject('Bienvenue chez AfricaFood - Vos accès Livreur');

        $body = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 15px;'>
            <div style='background: #1A252F; padding: 20px; text-align: center; border-radius: 15px 15px 0 0;'>
                <h1 style='color: #E67E22; margin: 0;'>AfricaFood</h1>
            </div>
            <div style='padding: 30px; color: #2C3E50;'>
                <h2>Félicitations $nom !</h2>
                <p>Votre compte livreur est actif.</p>
                <div style='background: #F4F7F6; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;'>
                    <p><strong>Email :</strong> $to</p>
                    <p><strong>Code d'accès provisoire :</strong></p>
                    <h2 style='color: #27AE60; letter-spacing: 5px; margin: 10px 0;'>$pass</h2>
                </div>
            </div>
            <div style='background: #F4F7F6; padding: 15px; text-align: center; font-size: 0.8rem; color: #7F8C8D;'>
                &copy; 2026 AfricaFood - Service Livraison.
            </div>
        </div>";

        $email->setMessage($body);
        return $email->send();
    }
}