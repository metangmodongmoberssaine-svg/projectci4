<?php namespace App\Models;

use CodeIgniter\Model;

class NotificationModel extends Model
{
    protected $table         = 'notifications';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $allowedFields = [
        'id_user', 'titre', 'message', 'type', 'is_read', 'is_broadcast'
    ];

    // Récupérer les notifs (Broadcast + Spécifiques à l'user)
    public function getByUser(int $userId): array
    {
        return $this->groupStart()
                ->where('id_user', $userId)
                ->orWhere('is_broadcast', 1)
            ->groupEnd()
            ->orderBy('is_read', 'ASC')
            ->orderBy('created_at', 'DESC')
            ->findAll();
    }

    // Marquer une ou toutes les notifications comme lues
    public function markAsRead(int $userId, int $notifId = null): void
    {
        $query = $this->where('id_user', $userId);
        if ($notifId) {
            $query->where('id', $notifId);
        }
        $query->set('is_read', 1)->update();
    }

    // Envoyer à TOUT LE MONDE
    public function broadcast(string $titre, string $message, string $type = 'info'): bool
    {
        return $this->insert([
            'id_user'      => null,
            'titre'        => $titre,
            'message'      => $message,
            'type'         => $type,
            'is_broadcast' => 1,
        ]) !== false;
    }

    // Envoyer à UN UTILISATEUR précis
    public function sendDirect(int $userId, string $titre, string $message, string $type = 'info'): bool
    {
        return $this->insert([
            'id_user'      => $userId,
            'titre'        => $titre,
            'message'      => $message,
            'type'         => $type,
            'is_broadcast' => 0,
        ]) !== false;
    }

    // Compter les non lues (Directes + Broadcast non lues pourrait être complexe, 
    // ici on reste sur les directes pour la simplicité)
    public function countUnread(int $userId): int
    {
        return $this->where('id_user', $userId)
                    ->where('is_read', 0)
                    ->countAllResults();
    }
}