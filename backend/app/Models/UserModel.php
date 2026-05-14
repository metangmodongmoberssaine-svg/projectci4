<?php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table         = 'users';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    protected $allowedFields = [
        'nom', 
        'prenom', 
        'telephone', 
        'email', 
        'password', 
        'role', 
        'ville', 
        'photo_profil', 
        'otp_code', 
        'otp_expires_at', 
        'is_verified', 
        'is_actif'
    ];

    // Callbacks pour le hachage automatique
    protected $beforeInsert = ['hashPassword'];
    protected $beforeUpdate = ['hashPassword'];

    protected function hashPassword(array $data): array
    {
        if (isset($data['data']['password']) && !empty($data['data']['password'])) {
            $data['data']['password'] = password_hash(
                $data['data']['password'], PASSWORD_BCRYPT
            );
        }
        return $data;
    }

    // --- Requêtes personnalisées ---

    public function findByEmail(string $email): ?array
    {
        return $this->where('email', $email)->first();
    }

    public function findByPhone(string $phone): ?array
    {
        return $this->where('telephone', $phone)->first();
    }

    public function setOtp(int $userId, string $code, string $expiresAt): bool
    {
        return $this->update($userId, [
            'otp_code'       => $code,
            'otp_expires_at' => $expiresAt,
        ]);
    }

    public function markVerified(int $userId): bool
    {
        return $this->update($userId, [
            'is_verified'    => 1,
            'otp_code'       => null,
            'otp_expires_at' => null,
        ]);
    }

    // --- Validation ---
    protected $validationRules = [
        'email'     => 'required|valid_email|is_unique[users.email,id,{id}]',
        'telephone' => 'required|is_unique[users.telephone,id,{id}]',
        'password'  => 'required|min_length[8]',
        'nom'       => 'required|min_length[2]',
        'prenom'    => 'required|min_length[2]',
        'ville'     => 'permit_empty|min_length[2]' // La ville peut être vide au départ
    ];
}