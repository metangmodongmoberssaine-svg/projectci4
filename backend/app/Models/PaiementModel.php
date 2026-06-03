<?php 

namespace App\Models;

use CodeIgniter\Model;

class PaiementModel extends Model
{
    protected $table         = 'paiement';
    protected $primaryKey    = 'id';
    protected $returnType    = 'array'; // Assure le retour sous forme de tableau
    protected $useTimestamps = true;
    protected $allowedFields = [
        'id_commande', 'id_user', 'montant', 'methode', 'statut', 'reference'
    ];

    // Paiement d'une commande précise
    public function getByCommande(int $commandeId): ?array
    {
        return $this->where('id_commande', $commandeId)->first();
    }

    // Récupérer un paiement par sa référence unique (Très important pour le Webhook/Status)
    public function getByReference(string $reference): ?array
    {
        return $this->where('reference', $reference)->first();
    }

    // Mettre à jour statut + référence après réponse du provider
    public function confirmer(int $id, string $reference): bool
    {
        return $this->update($id, [
            'statut'    => 'reussi',
            'reference' => $reference,
        ]);
    }

    public function echouer(int $id): bool
    {
        return $this->update($id, ['statut' => 'echoue']);
    }
}