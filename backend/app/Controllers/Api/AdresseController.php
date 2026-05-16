<?php 

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\AdresseModel;

class AdresseController extends BaseController
{
    private int $userId = 0;

    /**
     * Initialisation du contrôleur avec traçabilité complète
     */
    public function initController(\CodeIgniter\HTTP\RequestInterface $request, \CodeIgniter\HTTP\ResponseInterface $response, \Psr\Log\LoggerInterface $logger)
    {
        parent::initController($request, $response, $logger);
        
        log_message('info', '[ADRESSE_CTRL] Début initController.');

        // 1. Loguer TOUS les en-têtes reçus pour inspection visuelle
        $allHeaders = [];
        foreach ($this->request->headers() as $name => $header) {
            $allHeaders[$name] = $header->getValueLine();
        }
        log_message('debug', '[ADRESSE_CTRL] Headers reçus par le contrôleur : ' . json_encode($allHeaders));

        // 2. Vérification de l'objet temporaire partagé par le Filtre
        if (isset($this->request->user)) {
            log_message('info', '[ADRESSE_CTRL] Propriété $request->user détectée. Contenu : ' . json_encode($this->request->user));
        } else {
            log_message('warning', '[ADRESSE_CTRL] Aucune propriété $request->user trouvée sur l\'objet Request.');
        }

        // 3. Extraction via l'en-tête personnalisé
        $header = $this->request->getHeader('X-User-Id');
        
        if ($header) {
            $this->userId = (int) $header->getValue();
            log_message('info', '[ADRESSE_CTRL] UserId extrait avec succès du header X-User-Id. Valeur : ' . $this->userId);
        } else {
            log_message('notice', '[ADRESSE_CTRL] Header X-User-Id introuvable. Tentative via les fallbacks...');
            
            // Fallback 1: Propriété manuelle directe
            $fb1 = $this->request->userId ?? null;
            // Fallback 2: Via l'instance globale du service
            $fb2 = service('request')->userId ?? null;
            // Fallback 3: Vérification de l'objet utilisateur décodé s'il s'y trouve
            $fb3 = isset($this->request->user) ? ($this->request->user->id ?? $this->request->user->uid ?? null) : null;

            log_message('debug', sprintf('[ADRESSE_CTRL] États fallbacks - Request Property: %s | Service Property: %s | Decoded Object Clés: %s', 
                json_encode($fb1), json_encode($fb2), json_encode($fb3)));

            $this->userId = (int) ($fb1 ?? $fb2 ?? $fb3 ?? 0);
        }

        log_message('info', '[ADRESSE_CTRL] Fin initController. ID Utilisateur Final Retenu : ' . $this->userId);
    }

    // GET /api/adresses
    public function index()
    {
        log_message('info', '[ADRESSE_CTRL] Appel de la méthode index(). UserId actuel : ' . $this->userId);

        if ($this->userId === 0) {
            log_message('error', '[ADRESSE_CTRL] Rejet index() : Échec d\'identification (userId est à 0). Renvoi 401.');
            return $this->response->setStatusCode(401)->setJSON([
                'status'  => false,
                'message' => 'Utilisateur non authentifié ou session expirée.',
            ]);
        }

        $model = new AdresseModel();

        $page    = (int) ($this->request->getVar('page') ?? 1);
        $perPage = (int) ($this->request->getVar('per_page') ?? 10);

        if ($page < 1) $page = 1;
        if ($perPage < 1 || $perPage > 50) $perPage = 10;

        log_message('debug', "[ADRESSE_CTRL] Requête SQL en préparation. id_user = {$this->userId}, Page = {$page}, PerPage = {$perPage}");

        try {
            $adresses = $model->where('id_user', $this->userId)->paginate($perPage, 'default', $page);
            $pager = $model->pager;

            log_message('info', '[ADRESSE_CTRL] Requête index() exécutée avec succès. Nombre de lignes récupérées : ' . count($adresses));

            return $this->response->setJSON([
                'status'     => true,
                'data'       => $adresses,
                'pagination' => [
                    'current_page' => $pager->getCurrentPage('default'),
                    'per_page'     => $pager->getPerPage('default'),
                    'total_items'  => $pager->getTotal('default'),
                    'total_pages'  => $pager->getPageCount('default'),
                    'has_more'     => $pager->hasMore('default'),
                ]
            ]);
        } catch (\Exception $e) {
            log_message('critical', '[ADRESSE_CTRL] Erreur base de données dans index() : ' . $e->getMessage());
            return $this->response->setStatusCode(500)->setJSON([
                'status'  => false,
                'message' => 'Une erreur interne est survenue lors de la récupération des données.',
            ]);
        }
    }

    // POST /api/adresses
    public function store()
    {
        log_message('info', '[ADRESSE_CTRL] Appel de la méthode store(). UserId actuel : ' . $this->userId);

        if ($this->userId === 0) {
            log_message('error', '[ADRESSE_CTRL] Rejet store() : Échec d\'identification. Renvoi 401.');
            return $this->response->setStatusCode(401)->setJSON([
                'status'  => false,
                'message' => 'Action non autorisée.',
            ]);
        }

        $input = $this->request->getJSON(true);
        if (empty($input)) {
            $input = $this->request->getVar() ?? [];
        }

        log_message('debug', '[ADRESSE_CTRL] Données reçues pour création : ' . json_encode($input));

        $rules = [
            'libelle'   => 'required|min_length[2]|max_length[100]',
            'adresse'   => 'required|min_length[5]',
            'ville'     => 'required|min_length[2]',
            'latitude'  => 'permit_empty|numeric', 
            'longitude' => 'permit_empty|numeric',
        ];

        if (!$this->validateData($input, $rules)) {
            log_message('notice', '[ADRESSE_CTRL] Échec de validation formulaire : ' . json_encode($this->validator->getErrors()));
            return $this->response->setStatusCode(422)->setJSON([
                'status' => false,
                'errors' => $this->validator->getErrors(),
            ]);
        }

        $model = new AdresseModel();
        
        $data = [
            'id_user'   => $this->userId,
            'libelle'   => $input['libelle'] ?? null,
            'adresse'   => $input['adresse'] ?? null,
            'ville'     => $input['ville'] ?? 'Douala',
            'latitude'  => (!empty($input['latitude'])) ? (float) $input['latitude'] : null, 
            'longitude' => (!empty($input['longitude'])) ? (float) $input['longitude'] : null,
            'is_default'=> 0
        ];

        $existantes = $model->where('id_user', $this->userId)->findAll();
        if (empty($existantes)) {
            log_message('info', '[ADRESSE_CTRL] Première adresse pour cet utilisateur, passage en adresse par défaut.');
            $data['is_default'] = 1;
        }

        $id = $model->insert($data, true);
        log_message('info', '[ADRESSE_CTRL] Adresse insérée avec succès. ID généré : ' . $id);

        return $this->response->setStatusCode(201)->setJSON([
            'status'  => true,
            'message' => 'Adresse ajoutée avec succès.',
            'id'      => $id,
        ]);
    }

    // PUT /api/adresses/{id}
    public function update(int $id)
    {
        log_message('info', "[ADRESSE_CTRL] Appel de la méthode update() pour ID: {$id}. UserId actuel : " . $this->userId);

        if ($this->userId === 0) {
            return $this->response->setStatusCode(401)->setJSON([
                'status'  => false,
                'message' => 'Action non autorisée.',
            ]);
        }

        $model   = new AdresseModel();
        $adresse = $model->find($id);

        if (!$adresse || (int)$adresse['id_user'] !== $this->userId) {
            log_message('warning', sprintf('[ADRESSE_CTRL] Tentative interdite ou ressource manquante. Adresse ID %d appartient à User ID %s (Demandeur ID: %d)', 
                $id, $adresse ? $adresse['id_user'] : 'NULL', $this->userId));
                
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Adresse introuvable.',
            ]);
        }

        $input = $this->request->getJSON(true);
        if (empty($input)) {
            $input = $this->request->getRawInput() ?? [];
        }

        $rules = [
            'libelle'   => 'permit_empty|min_length[2]|max_length[100]',
            'adresse'   => 'permit_empty|min_length[5]',
            'ville'     => 'permit_empty|min_length[2]',
            'latitude'  => 'permit_empty|numeric',
            'longitude' => 'permit_empty|numeric',
        ];

        if (!$this->validateData($input, $rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status' => false,
                'errors' => $this->validator->getErrors(),
            ]);
        }

        $data = [];
        if (isset($input['libelle']))   $data['libelle']   = $input['libelle'];
        if (isset($input['adresse']))   $data['adresse']   = $input['adresse'];
        if (isset($input['ville']))     $data['ville']     = $input['ville'];
        if (array_key_exists('latitude', $input))  $data['latitude']  = !empty($input['latitude']) ? (float)$input['latitude'] : null;
        if (array_key_exists('longitude', $input)) $data['longitude'] = !empty($input['longitude']) ? (float)$input['longitude'] : null;

        if (!empty($data)) {
            $model->update($id, $data);
            log_message('info', "[ADRESSE_CTRL] ID {$id} mis à jour avec les données : " . json_encode($data));
        }

        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Adresse mise à jour avec succès.',
        ]);
    }

    // DELETE /api/adresses/{id}
    public function delete(int $id)
    {
        log_message('info', "[ADRESSE_CTRL] Appel de la méthode delete() pour ID: {$id}.");

        if ($this->userId === 0) {
            return $this->response->setStatusCode(401)->setJSON([
                'status'  => false,
                'message' => 'Action non autorisée.',
            ]);
        }

        $model   = new AdresseModel();
        $adresse = $model->find($id);

        if (!$adresse || (int)$adresse['id_user'] !== $this->userId) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Adresse introuvable.',
            ]);
        }

        if ($adresse['is_default']) {
            $autres = $model->where('id_user', $this->userId)->findAll();
            if (count($autres) > 1) {
                log_message('notice', "[ADRESSE_CTRL] Blocage suppression ID {$id} : l'adresse est configurée par défaut.");
                return $this->response->setStatusCode(400)->setJSON([
                    'status'  => false,
                    'message' => 'Définissez une autre adresse par défaut avant de supprimer celle-ci.',
                ]);
            }
        }

        $model->delete($id);
        log_message('info', "[ADRESSE_CTRL] ID {$id} supprimé définitivement.");
        
        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Adresse supprimée avec succès.',
        ]);
    }

    // PATCH /api/adresses/{id}/default
    public function setDefault(int $id)
    {
        log_message('info', "[ADRESSE_CTRL] Appel de la méthode setDefault() pour ID: {$id}.");

        if ($this->userId === 0) {
            return $this->response->setStatusCode(401)->setJSON([
                'status'  => false,
                'message' => 'Action non autorisée.',
            ]);
        }

        $model   = new AdresseModel();
        $adresse = $model->find($id);

        if (!$adresse || (int)$adresse['id_user'] !== $this->userId) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Adresse introuvable.',
            ]);
        }

        $model->setDefault($id, $this->userId);
        log_message('info', "[ADRESSE_CTRL] ID {$id} est désormais l'adresse principale de l'utilisateur {$this->userId}.");
        
        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Adresse définie comme adresse par défaut.',
        ]);
    }
}