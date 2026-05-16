<?php 

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\PanierModel;
use App\Models\PanierRepasModel;
use App\Models\RepasModel;

class PanierController extends BaseController
{
    private int $userId = 0;

    /**
     * Initialisation sécurisée du contrôleur.
     * Extraction robuste de l'userId injecté par le filtre d'authentification (JWT).
     */
    public function initController(\CodeIgniter\HTTP\RequestInterface $request, \CodeIgniter\HTTP\ResponseInterface $response, \Psr\Log\LoggerInterface $logger)
    {
        parent::initController($request, $response, $logger);
        
        log_message('info', '[PanierController::initController] Début de l\'interception de la requête.');
        log_message('info', '[PanierController::initController] Méthode HTTP : ' . $this->request->getMethod());
        log_message('info', '[PanierController::initController] URI appelée : ' . $this->request->getUri()->getPath());

        // 1. Tentative via l'en-tête personnalisé
        $idHeader = $this->request->getHeader('X-User-Id');
        
        if ($idHeader) {
            $this->userId = (int) $idHeader->getValue();
            log_message('info', '[PanierController::initController] User ID trouvé via X-User-Id : ' . $this->userId);
        } else {
            // 2. Stratégies de repli successives sur l'objet Request ou le Service
            $fromProperty = $this->request->userId ?? null;
            $fromService  = service('request')->userId ?? null;
            $fromUserObj  = isset($this->request->user) ? ($this->request->user->id ?? $this->request->user->uid ?? null) : null;

            $this->userId = (int) ($fromProperty ?? $fromService ?? $fromUserObj ?? 0);
            log_message('info', '[PanierController::initController] User ID extrait via les stratégies de repli : ' . $this->userId);
        }

        if ($this->userId === 0) {
            log_message('warning', '[PanierController::initController] Attention : Aucun User ID valide détecté à l\'initialisation.');
        }
    }

    // GET /api/panier
    public function index()
    {
        log_message('info', '[PanierController::index] Appel de la méthode index par l\'utilisateur #' . $this->userId);

        if ($this->userId === 0) {
            log_message('error', '[PanierController::index] Échec : Utilisateur non authentifié.');
            return $this->response->setStatusCode(401)->setJSON([
                'status'  => false,
                'message' => 'Utilisateur non authentifié ou session expirée.'
            ]);
        }

        $panierModel = new PanierModel();
        $panierRepasModel = new PanierRepasModel();

        $panier = $panierModel->getOrCreate($this->userId);
        log_message('info', '[PanierController::index] ID du panier récupéré/créé : ' . ($panier['id'] ?? 'Inconnu'));

        $page    = (int) ($this->request->getVar('page') ?? 1);
        $perPage = (int) ($this->request->getVar('per_page') ?? 5);

        if ($page < 1) $page = 1;
        if ($perPage < 1 || $perPage > 50) $perPage = 5;

        log_message('info', "[PanierController::index] Pagination demandée - Page: $page, Par page: $perPage");

        $itemsPaginés = $panierRepasModel->select('panier_repas.*, repas.nom, repas.photo, repas.status')
                                         ->join('repas', 'repas.id = panier_repas.id_repas')
                                         ->where('panier_repas.id_panier', $panier['id'])
                                         ->paginate($perPage, 'default', $page);

        $pager = $panierRepasModel->pager;

        $tousLesItems = $panierRepasModel->where('id_panier', $panier['id'])->findAll();
        $totalGeneral = array_sum(array_map(
            fn($i) => (float)$i['prix_unitaire'] * (int)$i['quantite'], $tousLesItems
        ));

        log_message('info', '[PanierController::index] Total du panier calculé : ' . $totalGeneral . ' FCFA. Nombre d\'éléments : ' . count($tousLesItems));

        return $this->response->setJSON([
            'status' => true,
            'data'   => [
                'id'         => $panier['id'],
                'id_user'    => $panier['id_user'],
                'items'      => $itemsPaginés, 
                'total'      => $totalGeneral, 
                'pagination' => [
                    'current_page' => $pager->getCurrentPage('default'),
                    'per_page'     => $pager->getPerPage('default'),
                    'total_items'  => $pager->getTotal('default'),
                    'total_pages'  => $pager->getPageCount('default'),
                    'has_more'     => $pager->hasMore('default'),
                ]
            ]
        ]);
    }

    // POST /api/panier/add
    public function add()
    {
        log_message('info', '[PanierController::add] Appel de la méthode add par l\'utilisateur #' . $this->userId);

        if ($this->userId === 0) {
            log_message('error', '[PanierController::add] Échec : Action non autorisée (User ID = 0).');
            return $this->response->setStatusCode(401)->setJSON([
                'status'  => false,
                'message' => 'Action non autorisée.'
            ]);
        }

        $input = $this->request->getJSON(true) ?? $this->request->getVar() ?? [];
        log_message('info', '[PanierController::add] Payload brut reçu : ' . json_encode($input));

        $rules = [
            'id_repas' => 'required|is_natural_no_zero',
            'quantite' => 'permit_empty|is_natural_no_zero'
        ];

        if (!$this->validateData($input, $rules)) {
            log_message('warning', '[PanierController::add] Échec de la validation des données : ' . json_encode($this->validator->getErrors()));
            return $this->response->setStatusCode(422)->setJSON([
                'status' => false,
                'errors' => $this->validator->getErrors()
            ]);
        }

        $repasId = (int) $input['id_repas'];
        $qty     = (int) ($input['quantite'] ?? 1);

        $repas = (new RepasModel())->find($repasId);
        if (!$repas || $repas['status'] === 'indisponible') {
            log_message('warning', "[PanierController::add] Repas #$repasId introuvable ou marqué comme indisponible.");
            return $this->response->setStatusCode(400)->setJSON([
                'status'  => false,
                'message' => 'Ce repas est indisponible pour le moment.'
            ]);
        }

        $panier = (new PanierModel())->getOrCreate($this->userId);
        (new PanierRepasModel())->addOrUpdate($panier['id'], $repasId, $qty, (float)$repas['prix']);

        log_message('info', "[PanierController::add] Succès : Repas #$repasId ajouté au panier #" . $panier['id'] . " (Quantité: $qty)");

        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Repas ajouté au panier avec succès.'
        ]);
    }

    // PUT /api/panier/item/{id}
    public function update(int $itemId)
    {
        log_message('info', "[PanierController::update] Appel de la méthode update pour la ligne du panier (itemId) #$itemId par l'utilisateur #" . $this->userId);

        if ($this->userId === 0) {
            log_message('error', '[PanierController::update] Échec : Action non autorisée (User ID = 0).');
            return $this->response->setStatusCode(401)->setJSON([
                'status'  => false,
                'message' => 'Action non autorisée.'
            ]);
        }

        // Blindage de la récupération JSON pour les requêtes PUT/PATCH sur environnement varié
        $rawBody = $this->request->getBody();
        log_message('info', '[PanierController::update] Corps brut de la requête reçu (Raw Body) : ' . $rawBody);

        $input = json_decode($rawBody, true) ?? $this->request->getRawInput() ?? [];
        log_message('info', '[PanierController::update] Payload décodé final : ' . json_encode($input));
        
        $qty = (int) ($input['quantite'] ?? 0);
        log_message('info', "[PanierController::update] Quantité extraite : $qty");

        if ($qty < 1) {
            log_message('warning', '[PanierController::update] Échec : La quantité fournie est inférieure à 1.');
            return $this->response->setStatusCode(400)->setJSON([
                'status'  => false,
                'message' => 'La quantité doit être d\'au moins 1.'
            ]);
        }

        $panierRepasModel = new PanierRepasModel();
        $item = $panierRepasModel->find($itemId);

        if (!$item) {
            log_message('error', "[PanierController::update] Échec : Élément de liaison panier_repas #$itemId introuvable en BD.");
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Élément introuvable dans le panier.'
            ]);
        }

        log_message('info', '[PanierController::update] Élément trouvé en BD : ' . json_encode($item));

        // Vérification de sécurité : l'item appartient bien au panier du user connecté
        $panier = (new PanierModel())->find($item['id_panier']);
        if (!$panier || (int)$panier['id_user'] !== $this->userId) {
            log_message('error', '[PanierController::update] Erreur de sécurité : Tentative de fraude détectée. Le panier n\'appartient pas à l\'utilisateur #' . $this->userId);
            return $this->response->setStatusCode(403)->setJSON([
                'status'  => false,
                'message' => 'Vous n\'avez pas accès à cet élément.'
            ]);
        }

        $panierRepasModel->update($itemId, ['quantite' => $qty]);
        log_message('info', "[PanierController::update] Succès : Ligne du panier #$itemId mise à jour avec la quantité $qty.");

        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Quantité mise à jour.'
        ]);
    }

    // DELETE /api/panier/item/{id}
    public function remove(int $itemId)
    {
        log_message('info', "[PanierController::remove] Appel de la méthode remove pour la ligne #$itemId par l'utilisateur #" . $this->userId);

        if ($this->userId === 0) {
            log_message('error', '[PanierController::remove] Échec : Action non autorisée.');
            return $this->response->setStatusCode(401)->setJSON([
                'status'  => false,
                'message' => 'Action non autorisée.'
            ]);
        }

        $panierRepasModel = new PanierRepasModel();
        $item = $panierRepasModel->find($itemId);

        if (!$item) {
            log_message('error', "[PanierController::remove] Échec : Ligne #$itemId introuvable.");
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Élément introuvable.'
            ]);
        }

        // Vérification de sécurité
        $panier = (new PanierModel())->find($item['id_panier']);
        if (!$panier || (int)$panier['id_user'] !== $this->userId) {
            log_message('error', "[PanierController::remove] Interdit : Le panier #" . ($item['id_panier'] ?? 'inconnu') . " n'appartient pas au user connecté.");
            return $this->response->setStatusCode(403)->setJSON([
                'status'  => false,
                'message' => 'Action non autorisée.'
            ]);
        }

        $panierRepasModel->delete($itemId);
        log_message('info', "[PanierController::remove] Succès : Ligne #$itemId supprimée de la BD.");

        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Repas retiré du panier.'
        ]);
    }

    // DELETE /api/panier/clear
    public function clear()
    {
        log_message('info', '[PanierController::clear] Vidage du panier demandé par l\'utilisateur #' . $this->userId);

        if ($this->userId === 0) {
            log_message('error', '[PanierController::clear] Échec : Action non autorisée.');
            return $this->response->setStatusCode(401)->setJSON([
                'status'  => false,
                'message' => 'Action non autorisée.'
            ]);
        }

        $panier = (new PanierModel())->getOrCreate($this->userId);
        (new PanierRepasModel())->clearPanier($panier['id']);

        log_message('info', '[PanierController::clear] Succès : Panier complet #' . $panier['id'] . ' vidé de tout élément.');

        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Le panier a été entièrement vidé.'
        ]);
    }
}