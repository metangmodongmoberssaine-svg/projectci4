import React, { useEffect, useState } from 'react';
import NotificationService from '../../services/NotificationService';
// Utilisation stricte de ton modèle officiel
import { Notification } from '../../models/NotificationModel';
import { 
  MdNotifications, 
  MdNotificationsNone, 
  MdCheck, 
  MdDoneAll, 
  MdNavigateNext, 
  MdNavigateBefore,
  MdRefresh,
  MdInfo,
  MdCheckCircle,
  MdWarning,
  MdError
} from 'react-icons/md';

import AOS from 'aos';
import 'aos/dist/aos.css';

export default function NotificationUser() {
  // États pour stocker les données de ton modèle
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  // Filtres et pagination locale
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage] = useState<number>(10);

  // États système
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic'
    });
  }, []);

  // On recharge les données à chaque action
  useEffect(() => {
    fetchNotifications();
  }, [statusFilter]); // On réagit au changement de filtre global

  const fetchNotifications = async () => {
    setLoading(false); // Évite les flashs agressifs si l'API est rapide
    setAlert(null);
    try {
      const filters = {
        status: statusFilter !== 'all' ? statusFilter : ''
      };
      
      const response = await NotificationService.getMyNotifications(filters);
      if (response.status) {
        setNotifications(response.data);
        setUnreadCount(response.unread);
        
        // On réinitialise la page courante si le volume de données change radicalement
        setTimeout(() => AOS.refresh(), 100);
      }
    } catch (error) {
      setAlert({ type: 'danger', text: 'Impossible de récupérer vos notifications.' });
    } finally {
      setLoading(false);
    }
  };

  // Marquer une notification comme lue
  const handleMarkAsRead = async (id: number) => {
    try {
      const response = await NotificationService.markAsRead(id);
      if (response.status) {
        setNotifications(prev => 
          prev.map(notif => notif.id === id ? { ...notif, is_read: 1 } : notif)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      setAlert({ type: 'danger', text: 'Erreur lors du traitement de la notification.' });
    }
  };

  // Tout marquer comme lu
  const handleMarkAllRead = async () => {
    const currentUnread = notifications.filter(n => n.is_read === 0).length;
    if (currentUnread === 0) return;

    try {
      const response = await NotificationService.markAllAsRead();
      if (response.status) {
        setNotifications(prev => prev.map(notif => ({ ...notif, is_read: 1 })));
        setUnreadCount(0);
        setAlert({ type: 'success', text: 'Toutes vos notifications ont été marquées comme lues.' });
      }
    } catch (error) {
      setAlert({ type: 'danger', text: 'Erreur lors de la mise à jour globale.' });
    }
  };

  // --- LOGIQUE DE PAGINATION CÔTÉ FRONT ---
  // On calcule dynamiquement les tranches de données à afficher
  const totalItems = notifications.length;
  const lastPage = Math.ceil(totalItems / perPage) || 1;
  
  // Ajustement de sécurité pour la page courante
  const safeCurrentPage = currentPage > lastPage ? lastPage : currentPage;

  const indexOfLastItem = safeCurrentPage * perPage;
  const indexOfFirstItem = indexOfLastItem - perPage;
  const currentDisplayedNotifications = notifications.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= lastPage) {
      setCurrentPage(newPage);
    }
  };

  // Icône dynamique selon le type d'alerte de ton modèle
  const renderNotificationIcon = (type: 'info' | 'success' | 'warning' | 'danger') => {
    switch (type) {
      case 'success': return <MdCheckCircle className="text-af-green fs-4" />;
      case 'warning': return <MdWarning className="fs-4" style={{ color: 'var(--af-warning)' }} />;
      case 'danger':  return <MdError className="text-af-red fs-4" />;
      default:        return <MdInfo className="text-af-blue fs-4" />;
    }
  };

  return (
    <div className="container-fluid py-4 bg-af-light min-vh-100 overflow-hidden">
      
      {/* HEADER ACTIONS */}
      <div 
        className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3"
        data-aos="fade-down"
      >
        <div>
          <h1 className="h3 mb-1 fw-bold text-af-black d-flex align-items-center gap-2">
            <MdNotifications className="text-af-orange" /> Vos Notifications
            {unreadCount > 0 && (
              <span className="badge rounded-pill bg-danger fs-6 align-middle">{unreadCount}</span>
            )}
          </h1>
          <p className="text-gray mb-0">Restez informé de l'état de vos demandes et de vos activités AfricaFood.</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            onClick={handleMarkAllRead} 
            className="btn btn-outline-secondary btn-sm fw-bold d-flex align-items-center gap-1"
            disabled={notifications.filter(n => n.is_read === 0).length === 0}
            style={{ borderRadius: 'var(--af-border-radius)' }}
          >
            <MdDoneAll /> Tout marquer comme lu
          </button>
          <button 
            onClick={fetchNotifications} 
            className="btn btn-primary btn-sm d-flex align-items-center gap-1 fw-bold"
          >
            <MdRefresh /> Actualiser
          </button>
        </div>
      </div>

      {/* FILTRES PAR ÉTAT */}
      <div 
        className="card border-0 shadow-sm mb-4" 
        style={{ borderRadius: 'var(--af-border-radius)' }}
        data-aos="fade-up" 
        data-aos-delay="100"
      >
        <div className="card-body p-3">
          <div className="d-flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'Toutes' },
              { value: 'unread', label: 'Non lues' },
              { value: 'read', label: 'Lues' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => { setStatusFilter(tab.value as any); setCurrentPage(1); }}
                className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${
                  statusFilter === tab.value 
                    ? 'btn-primary shadow-sm' 
                    : 'btn-light text-muted'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MESSAGES SYSTEME */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show border-0 shadow-sm mb-4`} style={{ borderRadius: 'var(--af-border-radius)' }} role="alert">
          {alert.text}
          <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
        </div>
      )}

      {/* ZONE LISTE DES NOTIFICATIONS */}
      <div 
        className="card border-0 shadow-sm overflow-hidden"
        style={{ borderRadius: 'var(--af-border-radius)' }}
        data-aos="fade-up" 
        data-aos-delay="200"
      >
        <div className="list-group list-group-flush">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-af-orange" role="status"></div>
              <p className="text-gray small mt-2 mb-0">Chargement de vos notifications...</p>
            </div>
          ) : currentDisplayedNotifications.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <MdNotificationsNone className="fs-1 text-gray mb-2" />
              <p className="mb-0">Aucune notification disponible dans cette section.</p>
            </div>
          ) : (
            currentDisplayedNotifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`list-group-item list-group-item-action p-3 d-flex align-items-start gap-3 transition-all border-bottom border-light-subtle ${
                  notif.is_read === 0 ? 'bg-notif-unread fw-semibold' : ''
                }`}
              >
                {/* Icône dynamique selon le type officiel */}
                <div className="mt-1">
                  {renderNotificationIcon(notif.type)}
                </div>

                {/* Corps de la notification - Mapped sur ton modèle officiel (titre) */}
                <div className="flex-grow-1">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-1">
                    <h5 className="h6 mb-1 text-af-black fw-bold">
                      {notif.titre}
                    </h5>
                    <span className="text-muted small fw-normal">
                      {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-muted small mb-0 fw-normal style-message">
                    {notif.message}
                  </p>
                </div>

                {/* Action d'état individuelle si non lue */}
                {notif.is_read === 0 && (
                  <button 
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="btn btn-link p-1 text-muted border-0 align-self-center hover-green"
                    title="Marquer comme lue"
                  >
                    <MdCheck className="fs-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* COMPOSANT DE PAGINATION ADAPTÉ AUX DONNÉES REÇUES */}
        {lastPage > 1 && (
          <div className="card-footer bg-white border-0 d-flex justify-content-between align-items-center py-3 px-4">
            <span className="small text-muted">
              Page <strong>{safeCurrentPage}</strong> sur <strong>{lastPage}</strong> ({totalItems} notifications)
            </span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-light d-flex align-items-center"
                style={{ borderRadius: '8px' }}
                onClick={() => handlePageChange(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1 || loading}
              >
                <MdNavigateBefore className="fs-5" /> Précédent
              </button>
              <button
                className="btn btn-sm btn-light d-flex align-items-center"
                style={{ borderRadius: '8px' }}
                onClick={() => handlePageChange(safeCurrentPage + 1)}
                disabled={safeCurrentPage === lastPage || loading}
              >
                Suivant <MdNavigateNext className="fs-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STYLES PERSONNALISÉS */}
      <style>{`
        .bg-notif-unread { 
          background-color: rgba(230, 126, 34, 0.02) !important; 
          border-left: 4px solid var(--af-orange) !important;
        }
        .transition-all { transition: all 0.2s ease-in-out; }
        .hover-green:hover { color: var(--af-green) !important; }
        .style-message { 
          white-space: pre-line; 
          line-height: 1.5;
        }
      `}</style>

    </div>
  );
}