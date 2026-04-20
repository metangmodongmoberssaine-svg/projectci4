<?php namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\UserModel;
use Firebase\JWT\JWT;

class AuthController extends BaseController
{
    // POST /api/auth/register
    public function register()
    {
        $rules = [
            'nom'       => 'required|min_length[2]',
            'prenom'    => 'required|min_length[2]',
            'telephone' => 'required|is_unique[users.telephone]',
            'email'     => 'required|valid_email|is_unique[users.email]',
            'password'  => 'required|min_length[8]',
        ];

        if (!$this->validate($rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status' => false,
                'errors' => $this->validator->getErrors()
            ]);
        }

        $model = new UserModel();

        // ✅ Récupération propre des données
        $nom       = (string) $this->request->getPost('nom');
        $prenom    = (string) $this->request->getPost('prenom');
        $telephone = (string) $this->request->getPost('telephone');
        $email     = (string) $this->request->getPost('email');
        $password  = (string) $this->request->getPost('password');

        // ✅ Hash du mot de passe (IMPORTANT 🔐)
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $otp     = rand(100000, 999999);
        $expires = date('Y-m-d H:i:s', strtotime('+10 minutes'));

        $userId = $model->insert([
            'nom'            => $nom,
            'prenom'         => $prenom,
            'telephone'      => $telephone,
            'email'          => $email,
            'password'       => $hashedPassword,
            'otp_code'       => $otp,
            'otp_expires_at' => $expires,
        ], true);

        return $this->response->setStatusCode(201)->setJSON([
            'status'  => true,
            'message' => 'Compte créé. Vérifiez votre OTP.',
            'user_id' => (int) $userId,
        ]);
    }

    // POST /api/auth/verify-otp
    public function verifyOtp()
    {
        $model = new UserModel();

        $userId = (int) $this->request->getPost('user_id');
        $otp    = (string) $this->request->getPost('otp');

        $user = $model->find($userId);

        if (!$user || $user['otp_code'] !== $otp) {
            return $this->response->setStatusCode(400)->setJSON([
                'status' => false,
                'message' => 'OTP invalide.'
            ]);
        }

        if (strtotime($user['otp_expires_at']) < time()) {
            return $this->response->setStatusCode(400)->setJSON([
                'status' => false,
                'message' => 'OTP expiré.'
            ]);
        }

        $model->markVerified($user['id']);

        return $this->response->setJSON([
            'status' => true,
            'message' => 'Compte vérifié !'
        ]);
    }

    // POST /api/auth/login
    public function login()
    {
        $model = new UserModel();

        $email    = (string) $this->request->getPost('email');
        $password = (string) $this->request->getPost('password');

        $user = $model->findByEmail($email);

        if (!$user || !password_verify($password, $user['password'])) {
            return $this->response->setStatusCode(401)->setJSON([
                'status' => false,
                'message' => 'Identifiants incorrects.'
            ]);
        }

        if (!$user['is_verified']) {
            return $this->response->setStatusCode(403)->setJSON([
                'status' => false,
                'message' => 'Compte non vérifié. Vérifiez votre OTP.'
            ]);
        }

        if (!$user['is_actif']) {
            return $this->response->setStatusCode(403)->setJSON([
                'status' => false,
                'message' => 'Compte suspendu. Contactez le support.'
            ]);
        }

        $payload = [
            'iss'  => base_url(),
            'iat'  => time(),
            'exp'  => time() + (60 * 60 * 24), // 24h
            'uid'  => (int) $user['id'],
            'role' => $user['role'],
        ];

        $secret = getenv('JWT_SECRET') ?: 'default_secret_key';

        $token = JWT::encode($payload, $secret, 'HS256');

        unset($user['password'], $user['otp_code'], $user['otp_expires_at']);

        return $this->response->setJSON([
            'status' => true,
            'token'  => $token,
            'user'   => $user
        ]);
    }

    // POST /api/auth/logout
    public function logout()
    {
        return $this->response->setJSON([
            'status' => true,
            'message' => 'Déconnecté.'
        ]);
    }
}