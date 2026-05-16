import React, { useEffect, useState } from 'react';
import ContactService from '../../services/ContactService';
import { ContactMessage, PaginationMeta, ContactFilters } from '../../models/ContactModel';
import { 
  MdEmail, 
  MdSearch, 
  MdFilterList, 
  MdCheckCircle, 
  MdRadioButtonUnchecked, 
  MdReply, 
  MdNavigateNext, 
  MdNavigateBefore,
  MdRefresh
} from 'react-icons/md';

// Importation de AOS et de ses styles de base
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function ContactMessageAdmin() {
  // États pour les données
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  
  // États pour la recherche et les filtres
  const [filters, setFilters] = useState<ContactFilters>({
    page: 1,
    perPage: 10,
    search: '',
    status: ''
  });

  // États de chargement et d'alertes
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // États pour la modale de réponse
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [sendingReply, setSendingReply] = useState<boolean>(false);

  // Initialisation unique de AOS au premier rendu
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic'
    });
  }, []);

  // Charger les messages au montage du composant et à chaque changement de filtre/page
  useEffect(() => {
    fetchMessages();
  }, [filters.page, filters.status]);

  const fetchMessages = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const response = await ContactService.getMessages(filters);
      if (response.status) {
        setMessages(response.data);
        setPagination(response.pagination);
        // Rafraîchir les calculs de position AOS après injection des données
        setTimeout(() => AOS.refresh(), 100);
      }
    } catch (error) {
      setAlert({ type: 'danger', text: 'Impossible de récupérer les messages de contact.' });
    } finally {
      setLoading(false);
    }
  };

  // Déclencher la recherche textuelle
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchMessages();
  };

  // Changer le statut de lecture (Lu / Non lu)
  const handleToggleRead = async (id: number) => {
    try {
      const response = await ContactService.toggleReadStatus(id);
      if (response.status) {
        setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, is_read: msg.is_read === 1 ? 0 : 1 } : msg));
      }
    } catch (error) {
      setAlert({ type: 'danger', text: 'Erreur lors de la modification du statut.' });
    }
  };

  // Tout marquer comme lu
  const handleMarkAllRead = async () => {
    if (!window.confirm('Voulez-vous marquer tous les messages comme lus ?')) return;
    try {
      const response = await ContactService.markAllAsRead();
      if (response.status) {
        setMessages(prev => prev.map(msg => ({ ...msg, is_read: 1 })));
        setAlert({ type: 'success', text: response.message });
      }
    } catch (error) {
      setAlert({ type: 'danger', text: 'Erreur lors du traitement global.' });
    }
  };

  // Ouvrir la modale de réponse
  const openReplyModal = (message: ContactMessage) => {
    setSelectedMessage(message);
    setReplyText(message.reply || '');
  };

  // Envoyer la réponse
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage) return;
    setSendingReply(true);

    try {
      const response = await ContactService.replyToMessage(selectedMessage.id, { reply: replyText });
      if (response.status) {
        setAlert({
          type: 'success',
          text: `Réponse envoyée ! E-mail : ${response.mail_sent ? '✅' : '❌'} | Dashboard : ${response.dashboard_notified ? '✅' : '❌'}`
        });
        
        // Mettre à jour l'élément modifié dans le tableau local
        setMessages(prev => prev.map(msg => msg.id === selectedMessage.id ? { 
          ...msg, 
          reply: replyText, 
          is_read: 1, 
          replied_at: new Date().toISOString() 
        } : msg));
        
        // Fermer la modale et réinitialiser le champ
        setSelectedMessage(null);
        setReplyText('');
      }
    } catch (error: any) {
      setAlert({ type: 'danger', text: "Erreur lors de l'envoi de la réponse." });
    } finally {
      setSendingReply(false);
    }
  };

  // Changer de page
  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.lastPage) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="container-fluid py-4 bg-af-light min-vh-100 overflow-hidden">
      
      {/* HEADER ACTION */}
      <div 
        className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3"
        data-aos="fade-down"
      >
        <div>
          <h1 className="h3 mb-1 fw-bold text-af-black">Messages de Contact</h1>
          <p className="text-muted mb-0">Gérez les retours des utilisateurs et répondez à leurs demandes.</p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={handleMarkAllRead} className="btn btn-outline-secondary btn-sm rounded-3 fw-bold">
            Tout marquer comme lu
          </button>
          <button onClick={fetchMessages} className="btn btn-primary btn-sm rounded-3 d-flex align-items-center gap-1 fw-bold">
            <MdRefresh /> Actualiser
          </button>
        </div>
      </div>

      {/* SYSTÈME DE FILTRES ET RECHERCHE */}
      <div 
        className="card border-0 shadow-sm rounded-4 mb-4" 
        data-aos="fade-up" 
        data-aos-delay="100"
      >
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            
            {/* Onglets Filtres de statut */}
            <div className="col-xl-7 col-lg-12">
              <div className="d-flex flex-wrap gap-2">
                {[
                  { value: '', label: 'Tous' },
                  { value: 'unread', label: 'Non lus' },
                  { value: 'read', label: 'Lus' },
                  { value: 'unreplied', label: 'En attente' },
                  { value: 'replied', label: 'Répondus' },
                ].map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setFilters(prev => ({ ...prev, status: tab.value as any, page: 1 }))}
                    className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${
                      filters.status === tab.value 
                        ? 'btn-primary shadow-sm' 
                        : 'btn-light text-muted'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Formulaire de recherche textuelle */}
            <div className="col-xl-5 col-lg-12">
              <form onSubmit={handleSearchSubmit} className="input-group input-group-sm">
                <span className="input-group-text bg-light border-0 ps-3 rounded-start-pill text-muted">
                  <MdSearch className="fs-5" />
                </span>
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou sujet..."
                  className="form-control bg-light border-0 px-2"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
                <button type="submit" className="btn btn-primary rounded-end-pill px-4 fw-bold">
                  Filtrer
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* ALERTES RETOUR API */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show rounded-3 shadow-sm`} role="alert">
          {alert.text}
          <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
        </div>
      )}

      {/* TABLEAU DES MESSAGES */}
      <div 
        className="card border-0 shadow-sm rounded-4 overflow-hidden" 
        data-aos="fade-up" 
        data-aos-delay="200"
      >
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-uppercase small fw-bold text-muted">
              <tr>
                <th className="ps-4" style={{ width: '60px' }}>Lu</th>
                <th>Expéditeur</th>
                <th>Sujet & Message</th>
                <th>Statut Réponse</th>
                <th>Date de réception</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="text-muted small mt-2 mb-0">Chargement des messages...</p>
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    Aucun message de contact trouvé.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg.id} className={msg.is_read === 0 ? 'fw-bold bg-light-opacity' : ''}>
                    {/* Colonne Statut Lu/Non Lu */}
                    <td className="ps-4">
                      <button 
                        onClick={() => handleToggleRead(msg.id)}
                        className="btn btn-link p-0 text-muted border-0"
                        title={msg.is_read === 1 ? 'Marquer comme non lu' : 'Marquer comme lu'}
                      >
                        {msg.is_read === 1 ? (
                          <MdCheckCircle className="text-af-green fs-4" />
                        ) : (
                          <MdRadioButtonUnchecked className="text-muted fs-4" />
                        )}
                      </button>
                    </td>

                    {/* Expéditeur */}
                    <td>
                      <div className="d-flex flex-column">
                        <span className="text-af-black">{msg.name}</span>
                        <span className="text-muted small fw-normal d-flex align-items-center gap-1">
                          <MdEmail /> {msg.email}
                        </span>
                      </div>
                    </td>

                    {/* Sujet & Corps du message */}
                    <td style={{ maxWidth: '300px' }}>
                      <div className="text-truncate text-af-black mb-0">{msg.subject}</div>
                      <div className="text-muted small text-truncate fw-normal">{msg.message}</div>
                    </td>

                    {/* Statut de réponse */}
                    <td>
                      {msg.reply ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5">
                          Répondu
                        </span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-2.5">
                          En attente
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="text-muted small">
                      {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>

                    {/* Actions */}
                    <td className="text-end pe-4">
                      <button 
                        onClick={() => openReplyModal(msg)}
                        className={`btn btn-sm rounded-3 d-inline-flex align-items-center gap-1 ${
                          msg.reply ? 'btn-outline-primary' : 'btn-primary'
                        }`}
                      >
                        <MdReply /> {msg.reply ? 'Voir/Modifier' : 'Répondre'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* BLOC PAGINATION NATIVE */}
        {pagination && pagination.lastPage > 1 && (
          <div className="card-footer bg-white border-0 d-flex justify-content-between align-items-center py-3 px-4">
            <span className="small text-muted">
              Page <strong>{pagination.currentPage}</strong> sur <strong>{pagination.lastPage}</strong> ({pagination.total} messages total)
            </span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-light rounded-3 d-flex align-items-center"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1 || loading}
              >
                <MdNavigateBefore className="fs-5" /> Précédent
              </button>
              <button
                className="btn btn-sm btn-light rounded-3 d-flex align-items-center"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.lastPage || loading}
              >
                Suivant <MdNavigateNext className="fs-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOOTSTRAP MODAL POUR RÉPONDRE */}
      {selectedMessage && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow rounded-4" data-aos="zoom-in" data-aos-duration="400">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-af-black">Répondre à {selectedMessage.name}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedMessage(null)}></button>
              </div>
              <form onSubmit={handleSendReply}>
                <div className="modal-body py-3">
                  
                  {/* Message initial du client */}
                  <div className="p-3 bg-light rounded-3 mb-3 small">
                    <p className="mb-1 text-muted"><strong>Sujet :</strong> {selectedMessage.subject}</p>
                    <p className="mb-0 text-dark-deep"><strong>Message :</strong> {selectedMessage.message}</p>
                  </div>

                  {/* Champ d'édition de la réponse */}
                  <div className="mb-2">
                    <label className="form-label small fw-bold text-af-black">Votre message de support</label>
                    <textarea
                      className="form-control border-af-light px-3 py-2"
                      rows={6}
                      style={{ borderRadius: '12px' }}
                      placeholder="Saisissez votre réponse ici..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <span className="text-muted small font-italic block">
                    * L'envoi déclenchera un e-mail HTML soigné et une notification Dashboard (si l'utilisateur possède un compte).
                  </span>

                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button type="button" className="btn btn-sm btn-light rounded-3 px-3" onClick={() => setSelectedMessage(null)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary rounded-3 px-4 d-flex align-items-center gap-1" disabled={sendingReply}>
                    {sendingReply ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        Envoi...
                      </>
                    ) : (
                      <>
                        <MdReply /> Envoyer la réponse
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* STYLE SUR MESURE FOCUS & EFFETS */}
      <style>{`
        .bg-light-opacity { background-color: rgba(230, 126, 34, 0.03) !important; }
        .transition-all { transition: all 0.2s ease-in-out; }
        .form-control:focus {
          background-color: #fff !important;
          box-shadow: 0 0 0 0.25rem rgba(39, 174, 96, 0.15);
          border: 1px solid var(--af-green) !important;
        }
      `}</style>

    </div>
  );
}