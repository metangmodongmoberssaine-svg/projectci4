<?php namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\PaiementModel;
use App\Models\TransactionModel;
use App\Models\FactureModel;
use App\Models\CommandeModel;

class PaiementController extends BaseController
{
    private int $userId;

    public function __construct()
    {
        // ⚠️ sécurisation récupération user
        $this->userId = (int) (service('request')->userId ?? 0);
    }

    // POST /api/paiement/initier
    public function initier()
    {
        $commandeId = (int) $this->request->getPost('id_commande');
        $methode    = (string) $this->request->getPost('methode');

        if ($commandeId <= 0 || $methode === '') {
            return $this->response->setStatusCode(400)->setJSON([
                'status' => false,
                'message' => 'Données invalides'
            ]);
        }

        $commande = (new CommandeModel())->find($commandeId);

        if (!$commande) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => false,
                'message' => 'Commande introuvable.'
            ]);
        }

        $montant = (float) $commande['montant_total'];

        $paiementId = (new PaiementModel())->insert([
            'id_commande' => $commandeId,
            'id_user'     => $this->userId,
            'montant'     => $montant,
            'methode'     => $methode,
            'statut'      => 'en_attente',
        ], true);

        return $this->response->setJSON([
            'status'      => true,
            'paiement_id' => (int) $paiementId,
            'message'     => 'Paiement initié. Validez sur votre téléphone.',
        ]);
    }

    // POST /api/paiement/callback
    public function callback()
    {
        $payload = json_decode($this->request->getBody(), true);

        if (!is_array($payload)) {
            return $this->response->setStatusCode(400)->setJSON([
                'status' => false,
                'message' => 'Payload invalide'
            ]);
        }

        $paiementId = (int) ($payload['paiement_id'] ?? 0);
        $statut     = (string) ($payload['statut'] ?? 'echoue');
        $ref        = (string) ($payload['reference'] ?? '');

        $paiementModel = new PaiementModel();
        $paiement      = $paiementModel->find($paiementId);

        if (!$paiement) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => false,
                'message' => 'Paiement introuvable'
            ]);
        }

        // ✅ Logger transaction
        (new TransactionModel())->log(
            $paiementId,
            $statut,
            $ref,
            json_encode($payload)
        );

        if ($statut === 'reussi') {
            $paiementModel->confirmer($paiementId, $ref);

            (new CommandeModel())->changerStatut(
                (int) $paiement['id_commande'],
                'en_preparation'
            );

            // ✅ Génération facture
            (new FactureModel())->creer(
                (int) $paiement['id_commande'],
                (float) $paiement['montant']
            );

        } else {
            $paiementModel->echouer($paiementId);
        }

        return $this->response->setJSON([
            'status' => true
        ]);
    }

    // GET /api/paiement/{commandeId}
    public function status(int $commandeId)
    {
        if ($commandeId <= 0) {
            return $this->response->setStatusCode(400)->setJSON([
                'status' => false,
                'message' => 'ID invalide'
            ]);
        }

        $paiement = (new PaiementModel())->getByCommande($commandeId);

        return $this->response->setJSON([
            'status' => true,
            'data'   => $paiement
        ]);
    }
}