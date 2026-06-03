<?php 

namespace App\Models;

use CodeIgniter\Model;

class TransactionModel extends Model
{
    protected $table         = 'transactions';
    protected $primaryKey    = 'id';
    protected $returnType    = 'array';
    protected $useTimestamps = true;
    protected $allowedFields = [
        'id_paiement', 'provider_ref', 'payload', 'statut'
    ];

    /**
     * Enregistrer une réponse du provider
     * Retourne l'ID de la transaction créée (int) ou false en cas d'échec
     */
    public function log(int $paiementId, string $statut, ?string $ref, ?string $payload)
    {
        return $this->insert([
            'id_paiement'  => $paiementId,
            'statut'       => $statut,
            'provider_ref' => $ref,
            'payload'      => $payload,
        ], true); // true permet de retourner l'ID auto-incrémenté inséré
    }
}