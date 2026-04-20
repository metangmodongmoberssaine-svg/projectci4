<?php namespace App\Models;
use CodeIgniter\Model;
 
class NotificationModel extends Model
{
    protected $table         = 'notifications';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $allowedFields = [
        'id_user','titre','message','type','is_read','is_broadcast'
    ];
 
    // Notifications d'un user (non lues en premier)
    public function getByUser(int $userId): array
    {
        return $this->where('id_user', $userId)
            ->orWhere('is_broadcast', 1)
            ->orderBy('is_read','ASC')
            ->orderBy('created_at','DESC')
            ->findAll();
    }
 
    // Marquer toutes les notifications d'un user comme lues
    public function markAllRead(int $userId): void
    {
        $this->where('id_user', $userId)->set('is_read', 1)->update();
    }
 
    // Envoyer une notification broadcast à tous
    public function broadcast(string $titre, string $message, string $type = 'info'): void
    {
        $this->insert([
            'id_user'      => null,
            'titre'        => $titre,
            'message'      => $message,
            'type'         => $type,
            'is_broadcast' => 1,
        ]);
    }
 
    // Compter les non lues d'un user
    public function countUnread(int $userId): int
    {
        return $this->where('id_user', $userId)
            ->where('is_read', 0)->countAllResults();
    }
}
