<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Services\CampayService;
use App\Models\{
    CommandeModel,
    CommandeRepasModel,
    PanierModel,
    PanierRepasModel,
    PromotionModel,
    RepasModel,
    UserModel
};
use Exception;

class CommandeController extends BaseController
{
    private int $userId;
    private CampayService $campayService;

    public function __construct()
    {
        $request = service('request');
        $this->userId = 0;

        // Récupération sécurisée de l'ID utilisateur
        if ($request->hasHeader('X-User-Id')) {
            $this->userId = (int) $request->header('X-User-Id')->getValue();
        } else {
            $this->userId = (int) ($request->getVar('userId') ?? 0);
        }

        if ($this->userId === 0) {
            $authHeader = $request->getServer('HTTP_AUTHORIZATION') ?? $request->header('Authorization')?->getValue();
            if (!empty($authHeader) && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                $token = $matches[1];
                try {
                    $tokenParts = explode('.', $token);
                    if (isset($tokenParts[1])) {
                        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1])), true);
                        $this->userId = (int) ($payload['id'] ?? $payload['userId'] ?? $payload['uid'] ?? 0);
                    }
                } catch (Exception $e) {
                    log_message('error', "[CommandeController] Erreur décodage token : " . $e->getMessage());
                }
            }
        }

        $this->campayService = new CampayService();
    }

    public function index()
    {
        if (empty($this->userId)) {
            return $this->response->setStatusCode(401)->setJSON(['status' => false, 'message' => 'Non authentifié.']);
        }

        $commandeModel = new CommandeModel();
        $page = (int) $this->request->getVar('page') ?: 1;
        $perPage = (int) $this->request->getVar('per_page') ?: 10;
        $offset = ($page - 1) * $perPage;

        $commandes = $commandeModel->where('id_user', $this->userId)->orderBy('created_at', 'DESC')->findAll($perPage, $offset);
        $totalItems = $commandeModel->where('id_user', $this->userId)->countAllResults();

        return $this->response->setJSON([
            'status' => true,
            'data' => $commandes,
            'pagination' => ['current_page' => $page, 'per_page' => $perPage, 'total_items' => $totalItems, 'total_pages' => (int) ceil($totalItems / $perPage) ?: 1]
        ]);
    }

    public function show(int $id)
    {
        if (empty($this->userId)) return $this->response->setStatusCode(401)->setJSON(['status' => false, 'message' => 'Non autorisé.']);
        
        $commande = (new CommandeModel())->getDetail($id);
        if (!$commande || $commande['id_user'] !== $this->userId) {
            return $this->response->setStatusCode(404)->setJSON(['status' => false, 'message' => 'Commande introuvable.']);
        }
        return $this->response->setJSON(['status' => true, 'data' => $commande]);
    }

    public function create()
    {
        if (empty($this->userId)) return $this->response->setStatusCode(401)->setJSON(['status' => false, 'message' => 'Non authentifié.']);

        try {
            $panier = (new PanierModel())->getWithItems($this->userId);
            if (empty($panier['items'])) return $this->response->setStatusCode(400)->setJSON(['status' => false, 'message' => 'Panier vide.']);

            $adresse = $this->request->getVar('adresse');
            if (empty($adresse)) return $this->response->setStatusCode(400)->setJSON(['status' => false, 'message' => 'Adresse requise.']);

            $user = (new UserModel())->find($this->userId);
            $userPhone = $user['telephone'] ?? $user['phone'] ?? null;
            if (!$userPhone) return $this->response->setStatusCode(400)->setJSON(['status' => false, 'message' => 'Numéro de téléphone manquant.']);

            // Formatage strict pour Campay (237...)
            $userPhone = preg_replace('/[^0-9]/', '', $userPhone); // Nettoie le numéro
            if (strlen($userPhone) === 9) $userPhone = '237' . $userPhone;

            // Calcul promos
            $total = $panier['total'];
            $remise = 0; $promoId = null;
            if ($code = $this->request->getVar('code_promo')) {
                $promo = (new PromotionModel())->findValidCode($code);
                if ($promo) {
                    $remise = (new PromotionModel())->calculerRemise($promo, $total);
                    $promoId = $promo['id'];
                }
            }
            $montantFinal = $total - $remise;

            // 1. TRANSACTION SQL
            $db = \Config\Database::connect();
            $db->transStart();
            $referenceUnique = $this->campayService->generateReference('CMD');
            
            $commandeModel = new CommandeModel();
            $commandeModel->insert([
                'id_user' => $this->userId, 'id_promotion' => $promoId, 'adresse_livraison' => $adresse,
                'montant_total' => $montantFinal, 'montant_remise' => $remise, 'reference_paiement' => $referenceUnique, 'status' => 'en_attente'
            ]);
            $commandeId = $commandeModel->getInsertID();

            foreach ($panier['items'] as $item) {
                (new CommandeRepasModel())->insert(['id_commande' => $commandeId, 'id_repas' => $item['id_repas'], 'quantite' => $item['quantite'], 'prix_snapshot' => $item['prix_unitaire']]);
                (new RepasModel())->decrementStock($item['id_repas'], $item['quantite']);
            }
            (new PanierRepasModel())->clearPanier($panier['id']);
            $db->transComplete();

            if ($db->transStatus() === false) throw new Exception("Erreur base de données.");

            // 2. APPEL API AVEC TRACE
            $campayResult = $this->campayService->initializePayment([
                'phone' => $userPhone, 
                'amount' => $montantFinal, 
                'reference' => $referenceUnique, 
                'description' => "Commande #{$commandeId}"
            ]);

            // Log de la réponse brute pour debug
            log_message('debug', "[CAMPAY-RESPONSE] Pour commande $commandeId : " . json_encode($campayResult));

            if (isset($campayResult['success']) && $campayResult['success']) {
                return $this->response->setStatusCode(201)->setJSON(['status' => true, 'message' => 'Commande validée.', 'commande_id' => $commandeId]);
            } else {
                // Log l'erreur exacte renvoyée par l'API
                log_message('error', "[CAMPAY-FAILURE] Erreur pour commande $commandeId : " . ($campayResult['message'] ?? 'Inconnu'));
                return $this->response->setStatusCode(400)->setJSON(['status' => false, 'message' => $campayResult['message'] ?? 'Erreur lors du paiement.']);
            }

        } catch (Exception $e) {
            log_message('error', "[CRITICAL 500] " . $e->getMessage());
            return $this->response->setStatusCode(500)->setJSON(['status' => false, 'message' => 'Erreur serveur.']);
        }
    }

    public function changerStatut(int $id)
    {
        (new CommandeModel())->changerStatut($id, $this->request->getVar('status'));
        return $this->response->setJSON(['status' => true, 'message' => 'Statut mis à jour.']);
    }

    public function annuler(int $id)
    {
        if (empty($this->userId)) return $this->response->setStatusCode(401)->setJSON(['status' => false]);
        $commande = (new CommandeModel())->find($id);
        if (!$commande || $commande['id_user'] !== $this->userId || $commande['status'] !== 'en_attente') {
            return $this->response->setStatusCode(400)->setJSON(['status' => false, 'message' => 'Action impossible.']);
        }
        (new CommandeModel())->changerStatut($id, 'annulee');
        return $this->response->setJSON(['status' => true, 'message' => 'Commande annulée.']);
    }
}