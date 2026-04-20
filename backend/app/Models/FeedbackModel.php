<?php namespace App\Models;
use CodeIgniter\Model;
 
class FeedbackModel extends Model
{
    protected $table         = 'feedback';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $allowedFields = ['id_user','note','commentaire'];
 
    // Note moyenne globale de la plateforme
    public function moyenneGlobale(): float
    {
        $result = $this->selectAvg('note','moyenne')->first();
        return round((float)($result['moyenne'] ?? 0), 1);
    }
 
    // Tous les feedbacks avec infos user (pour l'admin)
    public function getAllWithUser(): array
    {
        return $this->select('feedback.*, users.nom, users.prenom')
            ->join('users','users.id = feedback.id_user')
            ->orderBy('feedback.created_at','DESC')
            ->findAll();
    }
 
    protected $validationRules = [
        'note' => 'required|integer|greater_than[0]|less_than[6]',
    ];
}
