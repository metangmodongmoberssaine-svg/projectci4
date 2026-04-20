<?php namespace App\Models;
use CodeIgniter\Model;
 
class UserModel extends Model
{
    protected $table         = 'users';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $allowedFields = [
        'nom','prenom','telephone','email','password',
        'role','ville','photo_profil','otp_code',
        'otp_expires_at','is_verified','is_actif'
    ];
 
    // Hachage automatique du mot de passe avant insertion
    protected $beforeInsert = ['hashPassword'];
    protected $beforeUpdate = ['hashPassword'];
 
    protected function hashPassword(array $data): array
    {
        if (isset($data['data']['password'])) {
            $data['data']['password'] = password_hash(
                $data['data']['password'], PASSWORD_BCRYPT
            );
        }
        return $data;
    }
 
    // Trouver un user par email
    public function findByEmail(string $email): ?array
    {
        return $this->where('email', $email)->first();
    }
 
    // Trouver un user par téléphone
    public function findByPhone(string $phone): ?array
    {
        return $this->where('telephone', $phone)->first();
    }
 
    // Mettre à jour l'OTP d'un user
    public function setOtp(int $userId, string $code, string $expiresAt): bool
    {
        return $this->update($userId, [
            'otp_code'       => $code,
            'otp_expires_at' => $expiresAt,
        ]);
    }
 
    // Marquer le compte comme vérifié et effacer l'OTP
    public function markVerified(int $userId): bool
    {
        return $this->update($userId, [
            'is_verified'    => 1,
            'otp_code'       => null,
            'otp_expires_at' => null,
        ]);
    }
 
    protected $validationRules = [
        'email'     => 'required|valid_email|is_unique[users.email]',
        'telephone' => 'required|is_unique[users.telephone]',
        'password'  => 'required|min_length[8]',
        'nom'       => 'required|min_length[2]',
        'prenom'    => 'required|min_length[2]',
    ];
}
