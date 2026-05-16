<?php

namespace App\Models;
use CodeIgniter\Model;
 
class AdresseModel extends Model
{
    protected $table         = 'adresses';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    
    // Ajout de latitude et longitude dans les champs autorisés
    protected $allowedFields = [
        'id_user', 'libelle', 'adresse', 'ville', 'latitude', 'longitude', 'is_default'
    ];
 
    // Toutes les adresses d'un user
    public function getByUser(int $userId): array
    {
        return $this->where('id_user', $userId)->findAll();
    }
 
    // Définir une adresse comme défaut (remet les autres à 0)
    public function setDefault(int $adresseId, int $userId): void
    {
        $this->where('id_user', $userId)->set('is_default', 0)->update();
        $this->update($adresseId, ['is_default' => 1]);
    }
 
    // Adresse par défaut d'un user
    public function getDefault(int $userId): ?array
    {
        return $this->where('id_user', $userId)
            ->where('is_default', 1)->first();
    }
}