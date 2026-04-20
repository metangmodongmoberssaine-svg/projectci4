<?php namespace App\Models;
use CodeIgniter\Model;
 
class TransactionModel extends Model
{
    protected $table         = 'transactions';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $allowedFields = [
        'id_paiement','provider_ref','payload','statut'
    ];
 
    // Enregistrer une réponse du provider
    public function log(int $paiementId, string $statut, ?string $ref, ?string $payload): int
    {
        return $this->insert([
            'id_paiement'  => $paiementId,
            'statut'       => $statut,
            'provider_ref' => $ref,
            'payload'      => $payload,
        ], true);
    }
}
