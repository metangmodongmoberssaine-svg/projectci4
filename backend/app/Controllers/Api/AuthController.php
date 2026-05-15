<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\UserModel;
use Firebase\JWT\Key;
use Firebase\JWT\JWT;
use Config\Services;

class AuthController extends BaseController
{
    /**
     * Inscription d'un utilisateur et envoi d'OTP
     * POST /api/auth/register
     */
    public function register()
    {
        $input = $this->request->getJSON(true) ?: $this->request->getPost();

        $rules = [
            'nom'       => 'required|min_length[2]',
            'prenom'    => 'required|min_length[2]',
            'telephone' => 'required|is_unique[users.telephone]',
            'email'     => 'required|valid_email|is_unique[users.email]',
            'password'  => 'required|min_length[8]',
        ];

        if (!$this->validateData($input, $rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status' => false,
                'errors' => $this->validator->getErrors()
            ]);
        }

        $model = new UserModel();

        $otp     = (string) rand(100000, 999999);
        $expires = date('Y-m-d H:i:s', strtotime('+10 minutes'));

        $userData = [
            'nom'            => $input['nom'],
            'prenom'         => $input['prenom'],
            'telephone'      => $input['telephone'],
            'email'          => $input['email'],
            'password'       => $input['password'], 
            'ville'          => $input['ville'] ?? null,
            'otp_code'       => $otp,
            'otp_expires_at' => $expires,
            'is_verified'    => 0,
            'is_actif'       => 1,
            'role'           => 'client'
        ];

        if ($model->insert($userData)) {
            $emailService = Services::email();
            $emailService->setTo($userData['email']);
            $emailService->setSubject('Vérification de compte - AfricaFood');
            
            $message = "
                <div style='font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;'>
                    <h1 style='color: #E67E22;'>AfricaFood</h1>
                    <p>Bonjour <strong>{$userData['prenom']}</strong>,</p>
                    <p>Merci de nous avoir rejoint. Voici votre code de vérification pour activer votre compte :</p>
                    <div style='font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;'>
                        $otp
                    </div>
                    <p>Ce code expirera dans 10 minutes.</p>
                </div>
            ";
            
            $emailService->setMessage($message);

            if ($emailService->send()) {
                return $this->response->setStatusCode(201)->setJSON([
                    'status'  => true,
                    'message' => 'Compte créé avec succès. Vérifiez votre boîte mail pour le code OTP.',
                ]);
            } else {
                return $this->response->setStatusCode(201)->setJSON([
                    'status'  => true,
                    'message' => 'Compte créé, mais l\'envoi du mail a échoué.',
                    'debug'   => $emailService->printDebugger(['headers']) 
                ]);
            }
        }

        return $this->response->setStatusCode(500)->setJSON([
            'status'    => false,
            'message'   => 'Erreur lors de la création du compte.',
            'db_errors' => $model->errors() 
        ]);
    }

    /**
     * Vérification de l'OTP
     * POST /api/auth/verify-otp
     */
    public function verifyOtp()
    {
        $input = $this->request->getJSON(true) ?: $this->request->getPost();
        $model = new UserModel();
        
        $email = $input['email'] ?? '';
        $otp   = (string) ($input['otp'] ?? '');

        $user = $model->where('email', $email)->first();

        if (!$user || $user['otp_code'] !== $otp) {
            return $this->response->setStatusCode(400)->setJSON([
                'status'  => false,
                'message' => 'Code OTP incorrect.'
            ]);
        }

        if (strtotime($user['otp_expires_at']) < time()) {
            return $this->response->setStatusCode(400)->setJSON([
                'status'  => false,
                'message' => 'Ce code OTP a expiré. Veuillez en demander un nouveau.'
            ]);
        }

        $model->markVerified($user['id']);

        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Votre compte AfricaFood a été activé avec succès !'
        ]);
    }

    /**
     * Connexion et génération du JWT
     * POST /api/auth/login
     */
    public function login()
    {
        $input    = $this->request->getJSON(true) ?: $this->request->getPost();
        $model    = new UserModel();
        $email    = (string) ($input['email'] ?? '');
        $password = (string) ($input['password'] ?? '');

        $user = $model->findByEmail($email);

        if (!$user || !password_verify($password, (string)$user['password'])) {
            return $this->response->setStatusCode(401)->setJSON([
                'status'  => false,
                'message' => 'Email ou mot de passe incorrect.'
            ]);
        }

        if (!$user['is_verified']) {
            return $this->response->setStatusCode(403)->setJSON([
                'status'  => false,
                'message' => 'Votre compte n\'est pas encore vérifié. Utilisez votre code OTP.'
            ]);
        }

        $key     = getenv('JWT_SECRET') ?: 'ma_cle_par_defaut';
        $payload = [
            'iss'  => 'AfricaFood',
            'iat'  => time(),
            'exp'  => time() + (60 * 60 * 24), 
            'uid'  => (int) $user['id'],
            'role' => $user['role']
        ];

        $token = JWT::encode($payload, $key, 'HS256');

        unset($user['password'], $user['otp_code'], $user['otp_expires_at']);

        return $this->response->setJSON([
            'status' => true,
            'token'  => $token,
            'user'   => $user
        ]);
    }

    /**
     * Récupérer les informations du profil
     * GET /api/auth/profile
     */
    public function profile()
    {
        $userId = $this->getAuthenticatedUserId();
        if (!$userId) return $this->errorUnauthorized();

        $model = new UserModel();
        $user = $model->find($userId);

        if (!$user) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => false,
                'message' => 'Utilisateur introuvable.'
            ]);
        }

        unset($user['password'], $user['otp_code'], $user['otp_expires_at']);

        return $this->response->setJSON([
            'status' => true,
            'user'   => $user
        ]);
    }

    /**
     * Mettre à jour les informations du profil
     * PUT /api/auth/update-profile
     */
    public function updateProfile()
    {
        $userId = $this->getAuthenticatedUserId();
        if (!$userId) return $this->errorUnauthorized();

        $input = $this->request->getJSON(true) ?: $this->request->getPost();

        $rules = [
            'nom'       => 'permit_empty|min_length[2]',
            'prenom'    => 'permit_empty|min_length[2]',
            'telephone' => "permit_empty|is_unique[users.telephone,id,{$userId}]",
            'email'     => "permit_empty|valid_email|is_unique[users.email,id,{$userId}]",
        ];

        if (!$this->validateData($input, $rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status' => false,
                'errors' => $this->validator->getErrors()
            ]);
        }

        $model = new UserModel();
        $allowedFields = ['nom', 'prenom', 'telephone', 'email', 'ville'];
        $updateData = array_intersect_key($input, array_flip($allowedFields));

        if (empty($updateData)) {
            return $this->response->setJSON(['status' => false, 'message' => 'Aucune donnée à modifier.']);
        }

        if ($model->update($userId, $updateData)) {
            return $this->response->setJSON([
                'status'  => true,
                'message' => 'Profil mis à jour avec succès.'
            ]);
        }

        return $this->response->setStatusCode(500)->setJSON(['status' => false, 'message' => 'Erreur de mise à jour.']);
    }

    /**
     * Changer le mot de passe
     * POST /api/auth/change-password
     */
    public function changePassword()
    {
        $userId = $this->getAuthenticatedUserId();
        if (!$userId) return $this->errorUnauthorized();

        $input = $this->request->getJSON(true) ?: $this->request->getPost();

        $rules = [
            'old_password'     => 'required',
            'new_password'     => 'required|min_length[8]',
            'confirm_password' => 'required|matches[new_password]'
        ];

        if (!$this->validateData($input, $rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status' => false,
                'errors' => $this->validator->getErrors()
            ]);
        }

        $model = new UserModel();
        $user = $model->find($userId);

        $oldPasswordInput = (string) ($input['old_password'] ?? '');
        $currentHashedPassword = (string) ($user['password'] ?? '');

        if (!password_verify($oldPasswordInput, $currentHashedPassword)) {
            return $this->response->setStatusCode(401)->setJSON([
                'status'  => false,
                'message' => 'L\'ancien mot de passe est incorrect.'
            ]);
        }

        if ($model->update($userId, ['password' => $input['new_password']])) {
            return $this->response->setJSON([
                'status'  => true,
                'message' => 'Mot de passe modifié avec succès.'
            ]);
        }

        return $this->response->setStatusCode(500)->setJSON(['status' => false, 'message' => 'Erreur technique.']);
    }

    /**
     * Déconnexion
     * POST /api/auth/logout
     */
    public function logout()
    {
        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Déconnexion réussie.'
        ]);
    }

    /**
     * Helpers privés
     */
    private function getAuthenticatedUserId()
    {
        $authHeader = $this->request->getServer('HTTP_AUTHORIZATION');
        if (!$authHeader) return null;

        $token = str_replace('Bearer ', '', $authHeader);
        try {
            $key = getenv('JWT_SECRET') ?: 'ma_cle_par_defaut';
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            return $decoded->uid;
        } catch (\Exception $e) {
            return null;
        }
    }

    private function errorUnauthorized() {
        return $this->response->setStatusCode(401)->setJSON(['status' => false, 'message' => 'Session invalide.']);
    }
}