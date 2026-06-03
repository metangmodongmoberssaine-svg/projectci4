<?php

namespace App\Services;

use Config\Services;

class CampayService
{
   protected $baseUrl;
    protected $token;
    protected $adminPhone;

    public function __construct()
    {
        $this->baseUrl    = rtrim(env('CAMPAY_HOST', 'https://demo.campay.net/api'), '/');
        $this->token      = env('CAMPAY_TOKEN');
        $this->adminPhone = env('CAMPAY_ADMIN_PHONE');

        if (empty($this->token)) {
            log_message('error', '[CAMPAY] Erreur critique : CAMPAY_TOKEN est vide dans le fichier .env');
        }
    }

    /**
     * Helper pour les headers (Utilise le token directement)
     */
    protected function getHeaders(): array
    {
        return [
            'Authorization' => "Token {$this->token}",
            'Content-Type'  => 'application/json',
            'Accept'        => 'application/json'
        ];
    }

    public function initializePayment(array $data): array
    {
        $externalReference = $data['reference'] ?? $this->generateReference();
        
        try {
            $client = Services::curlrequest();
            $response = $client->post("{$this->baseUrl}/collect/", [
                'headers' => $this->getHeaders(),
                'verify'  => false,
                'json'    => [
                    'amount'             => (string) $data['amount'],
                    'currency'           => 'XAF',
                    'from'               => $data['phone'],
                    'description'        => $data['description'] ?? 'Paiement',
                    'external_reference' => $externalReference,
                ],
                'http_errors' => false
            ]);

            $result = json_decode($response->getBody(), true);

            if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
                return ['success' => true, 'transaction' => $result];
            }

            return ['success' => false, 'message' => $result['message'] ?? 'Erreur API'];

        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    /**
     * Vérifier le statut d'un paiement (Format structuré)
     */
    public function verifyPayment(string $reference): array
    {
        try {
            $result = $this->checkStatus($reference);

            if (!isset($result['error']) && isset($result['status'])) {
                return [
                    'success'     => true,
                    'status'      => $result['status'],
                    'transaction' => $result,
                ];
            }

            return [
                'success' => false,
                'message' => $result['message'] ?? 'Transaction non trouvée',
            ];
        } catch (\Exception $e) {
            log_message('error', "[CAMPAY] Exception lors de la vérification de {$reference} : " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erreur de vérification du paiement',
            ];
        }
    }

    /**
     * Valider la signature du webhook (Campay n'utilise pas de signature)
     */
    public function validateWebhookSignature(string $payload, string $signature): bool
    {
        return true;
    }

    /**
     * Générer une référence unique
     */
    public function generateReference(string $prefix = 'PAY'): string
    {
        return $prefix . '-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(4)));
    }

    /**
     * Mapper le statut Campay vers notre statut interne
     */
    public function mapStatus(string $campayStatus): string
    {
        $mapping = [
            'SUCCESSFUL' => 'paye',
            'PENDING'    => 'en_attente',
            'FAILED'     => 'erreur',
            'CANCELLED'  => 'annule',
            'EXPIRED'    => 'annule',
        ];

        return $mapping[strtoupper($campayStatus)] ?? 'en_attente';
    }

    /**
     * Collecter de l'argent (Mobile Money -> Balance Campay)
     * Méthode originale conservée pour compatibilité
     */
    public function collect($amount, $phoneNumber, $description)
    {
        // Génération d'un UUID v4 natif sans dépendance externe
        $externalReference = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );

        log_message('info', "[CAMPAY-COLLECT] Nouvelle collecte. Montant: {$amount}, Tel: {$phoneNumber}, Ref: {$externalReference}");

        try {
            $client = Services::curlrequest();
            $response = $client->post("{$this->baseUrl}/collect/", [
                'headers' => [
                    'Authorization' => "Token {$this->token}",
                    'Content-Type'  => 'application/json',
                    'Accept'        => 'application/json'
                ],
                'verify' => false,
                'json'   => [
                    'amount'             => (string) $amount,
                    'currency'           => 'XAF',
                    'from'               => $phoneNumber,
                    'description'        => $description,
                    'external_reference' => $externalReference,
                ],
                'http_errors' => false
            ]);

            $responseData = json_decode($response->getBody(), true);

            if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
                log_message('info', '[CAMPAY-COLLECT] Succès', $responseData);
            } else {
                log_message('error', '[CAMPAY-COLLECT] Erreur. Status: ' . $response->getStatusCode(), $responseData);
            }

            return $responseData;

        } catch (\Exception $e) {
            log_message('critical', '[CAMPAY-COLLECT] Exception : ' . $e->getMessage());
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    /**
     * Retrait / Transfert (Payout)
     */
    public function withdraw($amount, $description = "Transfert vers Admin")
    {
        $externalReference = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );

        log_message('info', "[CAMPAY-WITHDRAW] Tentative de retrait. Montant: {$amount}, To: {$this->adminPhone}");

        try {
            $client = Services::curlrequest();
            $response = $client->post("{$this->baseUrl}/withdraw/", [
                'timeout' => 60, // Équivalent de ->timeout(60)
                'headers' => [
                    'Authorization' => "Token {$this->token}",
                    'Content-Type'  => 'application/json',
                    'Accept'        => 'application/json',
                ],
                'verify' => false,
                'json'   => [
                    'amount'             => (string) $amount,
                    'to'                 => (string) $this->adminPhone,
                    'currency'           => 'XAF',
                    'description'        => $description,
                    'external_reference' => $externalReference,
                ],
                'http_errors' => false
            ]);

            $data = json_decode($response->getBody(), true);

            if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
                log_message('info', '[CAMPAY-WITHDRAW] Succès', [
                    'reference' => $data['reference'] ?? 'N/A',
                ]);
                return $data;
            }

            log_message('error', '[CAMPAY-WITHDRAW] Échec. Status: ' . $response->getStatusCode(), $data);
            return $data;

        } catch (\Exception $e) {
            log_message('critical', '[CAMPAY-WITHDRAW] Exception : ' . $e->getMessage());
            
            return [
                'success'      => false,
                'message'      => "Erreur de connexion au serveur Campay",
                'error_detail' => $e->getMessage(),
            ];
        }
    }

    /**
     * Vérifier le statut brut d'une transaction
     */
    public function checkStatus($reference)
    {
        log_message('info', "[CAMPAY-STATUS] Vérification de la référence: {$reference}");

        try {
            $client = Services::curlrequest();
            $response = $client->get("{$this->baseUrl}/transaction/{$reference}/", [
                'headers' => [
                    'Authorization' => "Token {$this->token}",
                    'Accept'        => 'application/json'
                ],
                'verify'      => false,
                'http_errors' => false
            ]);

            $result = json_decode($response->getBody(), true);
            log_message('info', '[CAMPAY-STATUS] Réponse reçue', $result);
            
            return $result;

        } catch (\Exception $e) {
            log_message('error', "[CAMPAY-STATUS] Exception : " . $e->getMessage());
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }
}