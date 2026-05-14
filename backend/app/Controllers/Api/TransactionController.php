<?php namespace App\Controllers\Api;
use App\Controllers\BaseController;
use App\Models\{TransactionModel, PaiementModel};
 
class TransactionController extends BaseController
{
    // GET /api/transactions
    // Paramètre optionnel : ?statut=echoue|reussi|initie|rembourse
    public function index()
    {
        $model  = new TransactionModel();
        $statut = $this->request->getGet('statut');
 
        $query = $model
            ->select('transactions.*, paiement.methode, paiement.montant,
                      users.nom, users.prenom, users.telephone')
            ->join('paiement','paiement.id = transactions.id_paiement')
            ->join('users','users.id = paiement.id_user')
            ->orderBy('transactions.created_at','DESC');
 
        if ($statut) {
            $query->where('transactions.statut', $statut);
        }
 
        $transactions = $query->findAll();
        return $this->response->setJSON([
            'status' => true,
            'total'  => count($transactions),
            'data'   => $transactions,
        ]);
    }
 
    // GET /api/transactions/{id}
    public function show(int $id)
    {
        $transaction = (new TransactionModel())
            ->select('transactions.*, paiement.methode, paiement.montant,
                      paiement.reference as paiement_reference,
                      users.nom, users.prenom, users.telephone,
                      commande.adresse_livraison, commande.status as commande_status')
            ->join('paiement','paiement.id = transactions.id_paiement')
            ->join('users','users.id = paiement.id_user')
            ->join('commande','commande.id = paiement.id_commande')
            ->find($id);
 
        if (!$transaction) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Transaction introuvable.',
            ]);
        }
 
        // Décoder le payload JSON pour lisibilité
        if (!empty($transaction['payload'])) {
            $transaction['payload'] = json_decode($transaction['payload'], true);
        }
 
        return $this->response->setJSON([
            'status' => true,
            'data'   => $transaction,
        ]);
    }
 
    // GET /api/transactions/paiement/{paiementId}
    // Toutes les tentatives pour un paiement donné (utile pour les litiges)
    public function byPaiement(int $paiementId)
    {
        $paiement = (new PaiementModel())->find($paiementId);
        if (!$paiement) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Paiement introuvable.',
            ]);
        }
        $transactions = (new TransactionModel())
            ->where('id_paiement', $paiementId)
            ->orderBy('created_at','ASC')
            ->findAll();
 
        // Décoder les payloads
        foreach ($transactions as &$t) {
            if (!empty($t['payload'])) {
                $t['payload'] = json_decode($t['payload'], true);
            }
        }
        return $this->response->setJSON([
            'status'   => true,
            'paiement' => $paiement,
            'data'     => $transactions,
        ]);
    }
}
 
