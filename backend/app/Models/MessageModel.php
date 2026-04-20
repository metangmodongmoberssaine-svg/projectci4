<?php namespace App\Models;
use CodeIgniter\Model;
 
class MessageModel extends Model
{
    protected $table         = 'messages';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $allowedFields = [
        'id_conversation','id_expediteur','contenu','type_expediteur','is_read'
    ];
 
    // Tous les messages d'une conversation
    public function getByConversation(int $convId): array
    {
        return $this->select('messages.*, users.nom, users.prenom, users.photo_profil')
            ->join('users','users.id = messages.id_expediteur')
            ->where('messages.id_conversation', $convId)
            ->orderBy('messages.created_at','ASC')
            ->findAll();
    }
 
    // Marquer les messages d'un agent comme lus (côté client)
    public function markReadByClient(int $convId): void
    {
        $this->where('id_conversation', $convId)
            ->where('type_expediteur','agent')
            ->set('is_read', 1)->update();
    }
 
    // Compter messages non lus dans une conversation
    public function countUnread(int $convId, string $type): int
    {
        return $this->where('id_conversation', $convId)
            ->where('type_expediteur !=', $type)
            ->where('is_read', 0)->countAllResults();
    }
}
 
