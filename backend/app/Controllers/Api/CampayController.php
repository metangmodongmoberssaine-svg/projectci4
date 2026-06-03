<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Services\CampayService;
use App\Models\PaiementModel;
use App\Models\TransactionModel;
use CodeIgniter\HTTP\ResponseInterface;

class CampayController extends BaseController
{
    protected $campayService;
    protected $paiementModel;
    protected $transactionModel;

    public function __construct()
    {
        $this->campayService    = new CampayService();
        $this->paiementModel    = new PaiementModel();
        $this->transactionModel = new TransactionModel();
    }

    /**
     * Initier un paiement standard (Collect)
     * Enregistre d'abord le paiement en attente, lance la collecte et trace la transaction.
     * POST /api/payment/initiate
     */
   public function initiate()
{
    log_message('debug', '[CAMPAY-INIT] Début de la requête initiate.');

    // 1. Validation des données
    $rules = [
        'id_commande' => 'required|integer',
        'id_user'     => 'required|integer',
        'amount'      => 'required|numeric',
        'phone'       => 'required',
        'methode'     => 'required|in_list[mtn_money,orange_money,afriland]'
    ];

    if (!$this->validate($rules)) {
        log_message('error', '[CAMPAY-INIT] Validation échouée: ' . json_encode($this->validator->getErrors()));
        return $this->response->setJSON([
            'success' => false,
            'errors'  => $this->validator->getErrors()
        ])->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST);
    }

    $idCommande = (int)$this->request->getVar('id_commande');
    $idUser     = (int)$this->request->getVar('id_user');
    $amount     = $this->request->getVar('amount');
    $phone      = $this->request->getVar('phone');
    $methode    = $this->request->getVar('methode');
    $description = $this->request->getVar('description') ?? 'Paiement AfricaFood';

    log_message('info', "[CAMPAY-INIT] Params: Cmd:{$idCommande}, User:{$idUser}, Amt:{$amount}, Tel:{$phone}");

    // 2. Générer référence
    $externalReference = $this->campayService->generateReference('PAY');
    log_message('debug', "[CAMPAY-INIT] Référence générée: {$externalReference}");

    // 3. Enregistrer en base
    $idPaiement = $this->paiementModel->insert([
        'id_commande' => $idCommande,
        'id_user'     => $idUser,
        'montant'     => $amount,
        'methode'     => $methode,
        'statut'      => 'en_attente',
        'reference'   => $externalReference
    ], true);

    if (!$idPaiement) {
        log_message('critical', '[CAMPAY-INIT] Échec insertion BDD paiement.');
        return $this->response->setJSON([
            'success' => false,
            'message' => 'Impossible de générer l\'enregistrement de paiement local.'
        ])->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR);
    }

    log_message('info', "[CAMPAY-INIT] Paiement BDD créé avec ID: {$idPaiement}");

    // 4. Préparer données API
    $data = [
        'amount'      => $amount,
        'phone'       => $phone,
        'description' => $description,
        'reference'   => $externalReference
    ];

    $this->transactionModel->log($idPaiement, 'initie', null, json_encode(['request_data' => $data]));

    // 5. Appel Campay
    log_message('info', '[CAMPAY-INIT] Envoi requête à Campay...');
    $result = $this->campayService->initializePayment($data);

    // LOG CRITIQUE : Voir ce que Campay renvoie réellement
    log_message('info', '[CAMPAY-INIT] Réponse brute Campay: ' . json_encode($result));

    if (isset($result['success']) && $result['success']) {
        $providerRef = $result['transaction']['reference'] ?? null;
        $this->transactionModel->log($idPaiement, 'initie', $providerRef, json_encode($result));
        log_message('info', "[CAMPAY-INIT] Succès total pour ID: {$idPaiement}");
        
        return $this->response->setJSON($result)->setStatusCode(ResponseInterface::HTTP_OK);
    }

    // Si erreur
    log_message('error', "[CAMPAY-INIT] Échec API Campay pour ID {$idPaiement}. Détails: " . ($result['message'] ?? 'Inconnu'));
    $this->paiementModel->echouer($idPaiement);
    $this->transactionModel->log($idPaiement, 'echoue', null, json_encode($result));

    return $this->response->setJSON([
        'success' => false,
        'message' => $result['message'] ?? 'Erreur inconnue lors de l\'initialisation',
        'debug'   => $result // Utile pour le développement
    ])->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST);
}
    /**
     * Effectuer une collecte brute (Historise l'appel brut si nécessaire)
     * POST /api/payment/collect
     */
    public function collectBrute()
    {
        $amount      = $this->request->getVar('amount');
        $phoneNumber = $this->request->getVar('phone');
        $description = $this->request->getVar('description') ?? 'Collecte brute';

        if (empty($amount) || empty($phoneNumber)) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Le montant et le numéro de téléphone sont requis.'
            ])->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST);
        }

        $result = $this->campayService->collect($amount, $phoneNumber, $description);

        if (isset($result['reference'])) {
            return $this->response->setJSON([
                'success' => true,
                'data'    => $result
            ])->setStatusCode(ResponseInterface::HTTP_OK);
        }

        return $this->response->setJSON([
            'success' => false,
            'message' => $result['message'] ?? 'Échec de la collecte'
        ])->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST);
    }

    /**
     * Effectuer un retrait (Payout vers le téléphone admin)
     * POST /api/payment/withdraw
     */
    public function withdrawAdmin()
    {
        $amount      = $this->request->getVar('amount');
        $description = $this->request->getVar('description') ?? 'Transfert vers Admin';

        if (empty($amount)) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Le montant est requis pour le retrait.'
            ])->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST);
        }

        $result = $this->campayService->withdraw($amount, $description);

        if (isset($result['reference'])) {
            return $this->response->setJSON([
                'success' => true,
                'data'    => $result
            ])->setStatusCode(ResponseInterface::HTTP_OK);
        }

        return $this->response->setJSON([
            'success' => false,
            'message' => $result['message'] ?? 'Échec du retrait'
        ])->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST);
    }

    /**
     * Vérifier le statut d'une transaction manuellement et synchroniser l'état
     * GET /api/payment/status/(:any)
     */
    public function status($reference = null)
    {
        if (empty($reference)) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'La référence de transaction est requise.'
            ])->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST);
        }

        $result = $this->campayService->verifyPayment($reference);

        if ($result['success']) {
            $result['status_interne'] = $this->campayService->mapStatus($result['status']);
            
            // Optionnel : Tu peux appliquer la même logique que le webhook ici si tu veux mettre à jour
            return $this->response->setJSON($result)->setStatusCode(ResponseInterface::HTTP_OK);
        }

        return $this->response->setJSON([
            'success' => false,
            'message' => $result['message']
        ])->setStatusCode(ResponseInterface::HTTP_NOT_FOUND);
    }

    /**
     * Webhook de Campay (Callback automatique asynchrone envoyé par Campay)
     * Reçoit le statut final de la transaction et met à jour les tables paiement et transactions.
     * POST /api/payment/webhook
     */
    public function webhook()
    {
        $json = $this->request->getJSON(true);
        $data = !empty($json) ? $json : $this->request->getPost();

        log_message('info', '[CAMPAY-WEBHOOK] Données reçues : ' . json_encode($data));

        if (!empty($data) && isset($data['reference'])) {
            $campayReference = $data['reference'];               // Référence unique chez Campay
            $status          = $data['status'] ?? 'FAILED';     // Statut retourné par Campay
            $externalRef     = $data['external_reference'] ?? null; // Notre PAY-XXXX reference locale

            // 1. Retrouver l'enregistrement correspondant dans notre table `paiement`
            if ($externalRef) {
                $paiement = $this->paiementModel->getByReference($externalRef);

                if ($paiement) {
                    $idPaiement = $paiement['id'];

                    // 2. Traiter le statut selon la réponse de Campay
                    if (strtoupper($status) === 'SUCCESSFUL') {
                        // Utilisation de la méthode confirmer() du modèle (statut => 'reussi')
                        $this->paiementModel->confirmer($idPaiement, $campayReference);
                        
                        // Tracer le log historique technique (statut => 'confirme')
                        $this->transactionModel->log($idPaiement, 'confirme', $campayReference, json_encode($data));
                    } else {
                        // Utilisation de la méthode echouer() du modèle (statut => 'echoue')
                        $this->paiementModel->echouer($idPaiement);

                        // Tracer le log historique technique (statut => 'echoue')
                        $this->transactionModel->log($idPaiement, 'echoue', $campayReference, json_encode($data));
                    }

                    log_message('info', "[CAMPAY-WEBHOOK] Base de données synchronisée. Paiement ID: {$idPaiement}, Statut: {$status}");

                    return $this->response->setJSON([
                        'status'  => 'success',
                        'message' => 'Webhook traité et base de données mise à jour'
                    ])->setStatusCode(ResponseInterface::HTTP_OK);
                }

                log_message('error', "[CAMPAY-WEBHOOK] Référence externe {$externalRef} introuvable en BDD.");
            } else {
                log_message('error', "[CAMPAY-WEBHOOK] Le payload ne contient pas d'external_reference.");
            }
        }

        return $this->response->setJSON([
            'status'  => 'error',
            'message' => 'Données de webhook invalides ou introuvables'
        ])->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST);
    }
}