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
        // On récupère les données peu importe le format (JSON ou Form-Data)
        $input = $this->request->getJSON(true) ?: $this->request->getPost();

        $rules = [
            'nom'       => 'required|min_length[2]',
            'prenom'    => 'required|min_length[2]',
            'telephone' => 'required|is_unique[users.telephone]',
            'email'     => 'required|valid_email|is_unique[users.email]',
            'password'  => 'required|min_length[8]',
        ];

        // Validation des données entrantes
        if (!$this->validateData($input, $rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status' => false,
                'errors' => $this->validator->getErrors()
            ]);
        }

        $model = new UserModel();

        // Génération de l'OTP (6 chiffres)
        $otp     = (string) rand(100000, 999999);
        $expires = date('Y-m-d H:i:s', strtotime('+10 minutes'));

        $userData = [
            'nom'            => $input['nom'],
            'prenom'         => $input['prenom'],
            'telephone'      => $input['telephone'],
            'email'          => $input['email'],
            'password'       => $input['password'], // Le UserModel gère le hachage
            'ville'          => $input['ville'] ?? null,
            'otp_code'       => $otp,
            'otp_expires_at' => $expires,
            'is_verified'    => 0,
            'is_actif'       => 1,
            'role'           => 'client'
        ];

        if ($model->insert($userData)) {
            // --- ENVOI DE L'EMAIL VIA GMAIL ---
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
                // Si l'insertion a marché mais que le mail bug
                return $this->response->setStatusCode(201)->setJSON([
                    'status'  => true,
                    'message' => 'Compte créé, mais l\'envoi du mail a échoué.',
                    'debug'   => $emailService->printDebugger(['headers']) 
                ]);
            }
        }

        // Si l'insertion échoue, on affiche les erreurs du modèle (ex: validation DB)
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

        if (!$user || !password_verify($password, $user['password'])) {
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

        // Génération du Token JWT
        $key     = getenv('JWT_SECRET') ?: 'ma_cle_par_defaut';
        $payload = [
            'iss'  => 'AfricaFood',
            'iat'  => time(),
            'exp'  => time() + (60 * 60 * 24), // Valide 24 heures
            'uid'  => (int) $user['id'],
            'role' => $user['role']
        ];

        $token = JWT::encode($payload, $key, 'HS256');

        // Nettoyage des données sensibles avant réponse
        unset($user['password'], $user['otp_code'], $user['otp_expires_at']);

        return $this->response->setJSON([
            'status' => true,
            'token'  => $token,
            'user'   => $user
        ]);
    }

    /**
     * POST /api/auth/logout
     */
    public function logout()
    {
        // En JWT (Stateless), le serveur ne détruit pas de session.
        // On renvoie juste un succès pour que le client (Flutter/React) supprime le token localement.
        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Déconnexion réussie.'
        ]);
    }
}