<?php namespace App\Models;
use CodeIgniter\Model;
 
class AvisModel extends Model
{
    protected $table         = 'avis';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $allowedFields = ['id_user','id_repas','note','commentaire'];
 
    // Tous les avis d'un repas avec infos user
    public function getByRepas(int $repasId): array
    {
        return $this->select('avis.*, users.nom, users.prenom, users.photo_profil')
            ->join('users','users.id = avis.id_user')
            ->where('avis.id_repas', $repasId)
            ->orderBy('avis.created_at','DESC')
            ->findAll();
    }
 
    // Note moyenne d'un repas
    public function moyenneRepas(int $repasId): float
    {
        $result = $this->selectAvg('note','moyenne')
            ->where('id_repas', $repasId)->first();
        return round((float)($result['moyenne'] ?? 0), 1);
    }
 
    // Vérifier si un user a déjà noté ce repas
    public function dejaNote(int $userId, int $repasId): bool
    {
        return $this->where('id_user', $userId)
            ->where('id_repas', $repasId)->countAllResults() > 0;
    }
 
    protected $validationRules = [
        'note' => 'required|integer|greater_than[0]|less_than[6]',
    ];
}
