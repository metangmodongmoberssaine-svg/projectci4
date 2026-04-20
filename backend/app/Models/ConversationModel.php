<?php namespace App\Models;
use CodeIgniter\Model;
 
class ConversationModel extends Model
{
    protected $table         = 'conversations';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $allowedFields = ['id_user','id_agent','sujet','statut'];
 
    // Conversations d'un client
    public function getByUser(int $userId): array
    {
        return $this->where('id_user', $userId)
            ->orderBy('created_at','DESC')->findAll();
    }
 
    // Toutes conversations ouvertes (pour l'admin/agent)
    public function getOuvertes(): array
    {
        return $this->select('conversations.*, users.nom, users.prenom, users.telephone')
            ->join('users','users.id = conversations.id_user')
            ->whereIn('conversations.statut',['ouverte','en_cours'])
            ->orderBy('conversations.created_at','ASC')
            ->findAll();
    }
 
    // Assigner un agent à une conversation
    public function assignerAgent(int $convId, int $agentId): bool
    {
        return $this->update($convId, [
            'id_agent' => $agentId,
            'statut'   => 'en_cours',
        ]);
    }
}
