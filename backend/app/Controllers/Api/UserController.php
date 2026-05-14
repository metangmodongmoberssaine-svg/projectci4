<?php namespace App\Controllers\Api;
use App\Controllers\BaseController;
use App\Models\UserModel;
 
class UserController extends BaseController
{
    private int $userId;
 
    public function __construct()
    {
        $this->userId = (int) service('request')->userId;
    }
 
    // GET /api/user/profil
    public function profil()
    {
        $user = (new UserModel())->find($this->userId);
        // Masquer les champs sensibles
        unset($user['password'], $user['otp_code'], $user['otp_expires_at']);
        return $this->response->setJSON([
            'status' => true,
            'data'   => $user,
        ]);
    }
 
    // PUT /api/user/profil
    public function updateProfil()
    {
        $rules = [
            'nom'       => 'if_exist|min_length[2]',
            'prenom'    => 'if_exist|min_length[2]',
            'telephone' => 'if_exist|is_unique[users.telephone,id,'.$this->userId.']',
            'ville'     => 'if_exist|min_length[2]',
        ];
        if (!$this->validate($rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status' => false,
                'errors' => $this->validator->getErrors(),
            ]);
        }
        $data = $this->request->getRawInput();
        // Empêcher la modification de champs sensibles via cette route
        unset($data['password'], $data['role'], $data['is_verified'], $data['is_actif']);
 
        // Gestion upload photo de profil
        $photo = $this->request->getFile('photo_profil');
        if ($photo && $photo->isValid()) {
            $photo->move(WRITEPATH.'uploads/profils');
            $data['photo_profil'] = 'uploads/profils/'.$photo->getName();
        }
        (new UserModel())->update($this->userId, $data);
        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Profil mis à jour.',
        ]);
    }
 
    // PUT /api/user/password
    public function updatePassword()
    {
        $rules = [
            'ancien_password'   => 'required',
            'nouveau_password'  => 'required|min_length[8]',
            'confirmation'      => 'required|matches[nouveau_password]',
        ];
        if (!$this->validate($rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status' => false,
                'errors' => $this->validator->getErrors(),
            ]);
        }
        $model = new UserModel();
        $user  = $model->find($this->userId);
        if (!password_verify($this->request->getVar('ancien_password'), $user['password'])) {
            return $this->response->setStatusCode(400)->setJSON([
                'status'  => false,
                'message' => 'Ancien mot de passe incorrect.',
            ]);
        }
        // Le beforeUpdate du model hashera automatiquement le nouveau mot de passe
        $model->update($this->userId, [
            'password' => $this->request->getVar('nouveau_password'),
        ]);
        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Mot de passe mis à jour.',
        ]);
    }
 
    // GET /api/users  [Admin]
    public function index()
    {
        $role  = $this->request->getGet('role');
        $model = new UserModel();
        if ($role) {
            $model->where('role', $role);
        }
        $users = $model->select(
            'id,nom,prenom,telephone,email,role,ville,is_verified,is_actif,created_at'
        )->orderBy('created_at','DESC')->findAll();
        return $this->response->setJSON([
            'status' => true,
            'total'  => count($users),
            'data'   => $users,
        ]);
    }
 
    // PATCH /api/users/{id}/toggle  [Admin]
    public function toggleActif(int $id)
    {
        $model = new UserModel();
        $user  = $model->find($id);
        if (!$user) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Utilisateur introuvable.',
            ]);
        }
        $newStatut = $user['is_actif'] ? 0 : 1;
        $model->update($id, ['is_actif' => $newStatut]);
        return $this->response->setJSON([
            'status'   => true,
            'is_actif' => $newStatut,
            'message'  => $newStatut ? 'Compte activé.' : 'Compte suspendu.',
        ]);
    }
 
    // PATCH /api/users/{id}/role  [Admin]
    public function changerRole(int $id)
    {
        $role   = $this->request->getVar('role');
        $roles  = ['client','admin','livreur','cuisinier'];
        if (!in_array($role, $roles)) {
            return $this->response->setStatusCode(400)->setJSON([
                'status'  => false,
                'message' => 'Rôle invalide. Valeurs : '.implode(', ',$roles),
            ]);
        }
        (new UserModel())->update($id, ['role' => $role]);
        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Rôle mis à jour.',
        ]);
    }
}
 
