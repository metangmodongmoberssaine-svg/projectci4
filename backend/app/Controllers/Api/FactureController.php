<?php namespace App\Controllers\Api;
use App\Controllers\BaseController;
use App\Models\{FactureModel, CommandeModel};
 
class FactureController extends BaseController
{
    private int    $userId;
    private string $userRole;
 
    public function __construct()
    {
        $req            = service('request');
        $this->userId   = (int) $req->userId;
        $this->userRole = $req->userRole ?? 'client';
    }
 
    // GET /api/factures/commande/{commandeId}
    public function byCommande(int $commandeId)
    {
        // Vérifier que la commande appartient au user (sauf admin)
        if ($this->userRole !== 'admin') {
            $commande = (new CommandeModel())->find($commandeId);
            if (!$commande || $commande['id_user'] !== $this->userId) {
                return $this->response->setStatusCode(403)->setJSON([
                    'status'  => false,
                    'message' => 'Non autorisé.',
                ]);
            }
        }
        $facture = (new FactureModel())->getByCommande($commandeId);
        if (!$facture) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Aucune facture pour cette commande.',
            ]);
        }
        return $this->response->setJSON([
            'status' => true,
            'data'   => $facture,
        ]);
    }
 
    // GET /api/factures/{id}/download
    public function download(int $id)
    {
        $facture = (new FactureModel())->find($id);
        if (!$facture) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Facture introuvable.',
            ]);
        }
        // Vérifier que la commande appartient au user (sauf admin)
        if ($this->userRole !== 'admin') {
            $commande = (new CommandeModel())->find($facture['id_commande']);
            if (!$commande || $commande['id_user'] !== $this->userId) {
                return $this->response->setStatusCode(403)->setJSON([
                    'status'  => false,
                    'message' => 'Non autorisé.',
                ]);
            }
        }
        // Si un PDF existe déjà, retourner l'URL
        if ($facture['pdf_url']) {
            return $this->response->setJSON([
                'status'   => true,
                'pdf_url'  => base_url($facture['pdf_url']),
            ]);
        }
        // TODO: générer le PDF dynamiquement (ex. avec dompdf)
        // composer require dompdf/dompdf
        return $this->response->setStatusCode(503)->setJSON([
            'status'  => false,
            'message' => 'Génération PDF non encore disponible.',
        ]);
    }
 
    // GET /api/factures  [Admin]
    public function index()
    {
        $factures = (new FactureModel())
            ->select('factures.*, commande.adresse_livraison,
                      users.nom, users.prenom, users.telephone')
            ->join('commande','commande.id = factures.id_commande')
            ->join('users','users.id = commande.id_user')
            ->orderBy('factures.created_at','DESC')
            ->findAll();
        return $this->response->setJSON([
            'status' => true,
            'data'   => $factures,
        ]);
    }
 
    // POST /api/factures/generer/{commandeId}  [Admin]
    // Génération manuelle si la facture n'a pas été créée automatiquement
    public function generer(int $commandeId)
    {
        $factureModel = new FactureModel();
 
        // Vérifier qu'une facture n'existe pas déjà
        if ($factureModel->getByCommande($commandeId)) {
            return $this->response->setStatusCode(400)->setJSON([
                'status'  => false,
                'message' => 'Une facture existe déjà pour cette commande.',
            ]);
        }
        $commande = (new CommandeModel())->find($commandeId);
        if (!$commande) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Commande introuvable.',
            ]);
        }
        $id = $factureModel->creer($commandeId, $commande['montant_total']);
        return $this->response->setStatusCode(201)->setJSON([
            'status'  => true,
            'message' => 'Facture générée manuellement.',
            'id'      => $id,
        ]);
    }
}
 
