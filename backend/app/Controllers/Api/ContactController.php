<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\ContactMessageModel;
use App\Models\NotificationModel;
use App\Models\UserModel;
use CodeIgniter\HTTP\ResponseInterface;

class ContactController extends BaseController
{
    protected ContactMessageModel $contactModel;
    protected NotificationModel $notificationModel;

    public function __construct()
    {
        $this->contactModel = new ContactMessageModel();
        $this->notificationModel = new NotificationModel();
    }

    /**
     * PUBLIC : Permet à un internaute (visiteur ou connecté) de laisser un message de contact
     * POST /api/contact/send
     */
    public function sendPublicMessage()
    {
        $data = $this->request->getJSON(true) ?? $this->request->getPost();

        if (!$this->validate($this->contactModel->getValidationRules())) {
            return $this->response->setStatusCode(422)->setJSON([
                'status' => false,
                'errors' => $this->validator->getErrors()
            ]);
        }

        $this->contactModel->insert([
            'name'    => $data['name'],
            'email'   => $data['email'],
            'subject' => $data['subject'],
            'message' => $data['message'],
            'is_read' => 0
        ]);

        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Votre message a été envoyé avec succès. Notre équipe vous recontactera bientôt.'
        ]);
    }

    /**
     * ADMIN : Lister tous les messages reçus (AVEC PAGINATION API)
     * GET /api/admin/contacts?page=1&perPage=10
     */
    public function index()
    {
        $search = $this->request->getVar('search') ?? '';
        $status = $this->request->getVar('status'); // 'read', 'unread', 'replied', 'unreplied'
        
        // Récupération dynamique des paramètres de pagination avec valeurs par défaut
        $page    = (int) ($this->request->getVar('page') ?? 1);
        $perPage = (int) ($this->request->getVar('perPage') ?? 10);

        $query = $this->contactModel;

        // Application des filtres de recherche
        if (!empty($search)) {
            $query = $query->groupStart()
                           ->like('name', $search)
                           ->orLike('email', $search)
                           ->orLike('subject', $search)
                           ->groupEnd();
        }

        // Application des filtres d'état
        if ($status === 'read') $query = $query->where('is_read', 1);
        if ($status === 'unread') $query = $query->where('is_read', 0);
        if ($status === 'replied') $query = $query->where('reply IS NOT NULL');
        if ($status === 'unreplied') $query = $query->where('reply', null);

        // Tri et exécution de la pagination native
        $messages = $query->orderBy('created_at', 'DESC')->paginate($perPage, 'default', $page);
        $pager    = $this->contactModel->pager;

        return $this->response->setJSON([
            'status'     => true,
            'data'       => $messages,
            'pagination' => [
                'currentPage' => $pager->getCurrentPage('default'),
                'perPage'     => $pager->getPerPage('default'),
                'total'       => $pager->getTotal('default'),
                'lastPage'    => $pager->getPageCount('default'),
                'nextPageUrl' => $pager->getNextPageURI('default'),
                'prevPageUrl' => $pager->getPreviousPageURI('default'),
            ]
        ]);
    }

    /**
     * ADMIN : Marquer un message spécifique comme lu ou non lu
     * PATCH /api/admin/contacts/mark-read/[:id]
     */
    public function toggleReadStatus($id)
    {
        $message = $this->contactModel->find($id);
        if (!$message) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Message introuvable.'
            ]);
        }

        $newStatus = $message['is_read'] == 1 ? 0 : 1;
        $this->contactModel->update($id, ['is_read' => $newStatus]);

        return $this->response->setJSON([
            'status'  => true,
            'message' => $newStatus ? 'Message marqué comme lu.' : 'Message marqué comme non lu.'
        ]);
    }

    /**
     * ADMIN : Marquer TOUS les messages comme lus en un seul coup
     * POST ou PATCH /api/admin/contacts/mark-all-read
     */
    public function markAllAsRead()
    {
        // On cible uniquement les messages non lus pour optimiser la requête
        $this->contactModel->where('is_read', 0)->update(null, ['is_read' => 1]);

        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Tous les messages ont été marqués comme lus.'
        ]);
    }

    /**
     * ADMIN : Répondre à un message de contact
     * POST /api/admin/contacts/reply/[:id]
     */
    public function reply($id)
    {
        $contactMessage = $this->contactModel->find($id);
        if (!$contactMessage) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Message introuvable.'
            ]);
        }

        $rules = [
            'reply' => 'required|min_length[5]'
        ];

        if (!$this->validate($rules)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status' => false,
                'errors' => $this->validator->getErrors()
            ]);
        }

        $adminReply = (string) $this->request->getVar('reply');

        // 1. Mise à jour du message en BDD
        $this->contactModel->update($id, [
            'reply'      => $adminReply,
            'is_read'    => 1, 
            'replied_at' => date('Y-m-d H:i:s')
        ]);

        // 2. Envoi du Mail (Inclusion de la question originale comme paramètre)
        $mailSent = $this->sendEmailNotification(
            (string) ($contactMessage['email'] ?? ''), 
            (string) ($contactMessage['subject'] ?? ''), 
            $adminReply,
            (string) ($contactMessage['message'] ?? '')
        );

        // 3. Vérification compte AfricaFood existant pour notification interne
        $userModel = new UserModel();
        $user = $userModel->where('email', $contactMessage['email'])->first();

        $dashboardNotified = false;
        if ($user) {
            $titreNotification = "Réponse à votre message : " . $contactMessage['subject'];
            $this->notificationModel->sendDirect((int)$user['id'], $titreNotification, $adminReply, 'info');
            $dashboardNotified = true;
        }

        return $this->response->setJSON([
            'status'             => true,
            'message'            => 'Réponse enregistrée et envoyée avec succès.',
            'mail_sent'          => $mailSent,
            'dashboard_notified' => $dashboardNotified
        ]);
    }

    /**
     * Helper Privé : Envoi de mail basé sur la configuration de l'application
     */
    private function sendEmailNotification(string $toEmail, string $originalSubject, string $replyMessage, string $originalMessage): bool
    {
        $email = \Config\Services::email();

        $email->setTo($toEmail);
        $email->setSubject("Re: " . $originalSubject);

        // Template HTML contenant le fil de discussion (Question + Réponse)
        $htmlContent = "
            <div style='font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 8px;'>
                <h2 style='color: #27AE60; border-bottom: 2px solid #27AE60; padding-bottom: 10px; margin-top: 0;'>AfricaFood - Support</h2>
                <p>Bonjour,</p>
                <p>Notre équipe a traité votre demande concernant le sujet : <strong style='color: #E67E22;'>{$originalSubject}</strong>.</p>
                
                <h3 style='font-size: 1rem; color: #333; margin-top: 25px; margin-bottom: 5px;'>Notre réponse :</h3>
                <div style='background-color: #F9F9F9; padding: 15px; border-left: 4px solid #27AE60; border-radius: 4px; margin-bottom: 25px; line-height: 1.5;'>
                    " . nl2br(htmlspecialchars($replyMessage)) . "
                </div>

                <hr style='border: 0; border-top: 1px dashed #ddd; margin: 20px 0;' />

                <h3 style='font-size: 0.95rem; color: #777; margin-bottom: 5px;'>Rappel de votre message d'origine :</h3>
                <div style='background-color: #FAFAFA; padding: 12px; border-left: 4px solid #BDC3C7; border-radius: 4px; color: #555; font-size: 0.9rem; line-height: 1.5;'>
                    " . nl2br(htmlspecialchars($originalMessage)) . "
                </div>

                <hr style='border: 0; border-top: 1px solid #eee; margin: 25px 0 15px 0;' />
                <p style='font-size: 0.85rem; color: #999; text-align: center; margin-bottom: 0;'>
                    Merci de votre confiance,<br>
                    <strong>L'équipe AfricaFood</strong>
                </p>
            </div>
        ";

        $email->setMessage($htmlContent);

        return $email->send();
    }
}