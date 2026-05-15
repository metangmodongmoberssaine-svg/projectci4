import React, { useState, useEffect } from 'react';
import NotificationService from '../../services/NotificationService'; 
import AOS from 'aos';
import 'aos/dist/aos.css';

// Importation des icônes React Icons
import { FaPaperPlane, FaUserCircle, FaBullhorn, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';

export default function Notification() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

    const [notifData, setNotifData] = useState({
        titre: '',
        message: '',
        target: 'all', 
        type: 'info'
    });

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    const showFeedback = (text: string, type: 'success' | 'danger') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await NotificationService.sendNotification(notifData);
            if (res.status) {
                showFeedback('Notification envoyée avec succès !', 'success');
                setNotifData({ ...notifData, titre: '', message: '' }); 
            }
        } catch (err: any) {
            showFeedback('Échec de l\'envoi de la notification.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            {/* Feedback Toast */}
            {message && (
                <div 
                    className="shadow border-0 position-fixed top-0 start-50 translate-middle-x mt-4 p-3 text-white" 
                    style={{ 
                        zIndex: 1050, 
                        borderRadius: 'var(--af-border-radius)', 
                        minWidth: '320px',
                        backgroundColor: message.type === 'success' ? 'var(--af-green)' : 'var(--af-red)'
                    }}
                    data-aos="zoom-in"
                >
                    <div className="d-flex align-items-center justify-content-center fw-bold gap-2">
                        {message.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />} 
                        {message.text}
                    </div>
                </div>
            )}

            {/* Section Texte Propre (Introduction) */}
            <div className="row justify-content-center mb-5">
                <div className="col-md-8 text-center" data-aos="fade-down">
                    <div className="display-6 fw-bold text-af-black mb-3">
                        Gestion des <span className="text-af-orange">Communications</span>
                    </div>
                    <p className="lead text-muted">
                        Utilisez cet outil pour maintenir vos clients informés. Que ce soit pour une 
                        <strong> promotion flash</strong>, une <strong>maintenance système</strong> ou un 
                        <strong> message personnalisé</strong>, vos notifications sont délivrées instantanément sur l'application AfricaFood.
                    </p>
                    <hr className="w-25 mx-auto" style={{ borderTop: '3px solid var(--af-orange)' }} />
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-md-9" data-aos="fade-up">
                    <div className="card border-0 shadow-lg" style={{ borderRadius: '25px', overflow: 'hidden' }}>
                        
                        <div className="p-4 d-flex align-items-center justify-content-center gap-3" style={{ backgroundColor: 'var(--af-black-deep)' }}>
                            <IoNotificationsOutline size={30} className="text-af-orange" />
                            <h3 className="text-white mb-0 fw-bold">Nouvelle Campagne</h3>
                        </div>

                        <div className="card-body p-4 p-md-5 bg-af-light">
                            <form onSubmit={handleSubmit}>
                                <div className="row g-4">
                                    
                                    {/* Destinataire */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold text-af-black d-flex align-items-center gap-2">
                                            <FaBullhorn className="text-af-orange" /> Audience cible
                                        </label>
                                        <select 
                                            className="form-select border-0 py-3 shadow-sm"
                                            style={{ borderRadius: 'var(--af-border-radius)' }}
                                            value={notifData.target === 'all' ? 'all' : 'custom'}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setNotifData({...notifData, target: val === 'all' ? 'all' : ''});
                                            }}
                                        >
                                            <option value="all">Tous les utilisateurs (Broadcast)</option>
                                            <option value="custom">Utilisateur spécifique (ID)</option>
                                        </select>
                                    </div>

                                    {/* Type visuel */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold text-af-black d-flex align-items-center gap-2">
                                            <FaInfoCircle className="text-af-blue" /> Nature de l'alerte
                                        </label>
                                        <select 
                                            className="form-select border-0 py-3 shadow-sm"
                                            style={{ borderRadius: 'var(--af-border-radius)' }}
                                            value={notifData.type}
                                            onChange={(e) => setNotifData({...notifData, type: e.target.value})}
                                        >
                                            <option value="info">Information Standard</option>
                                            <option value="success">Promotion / Succès</option>
                                            <option value="warning">Avertissement Important</option>
                                            <option value="danger">Urgence / Critique</option>
                                        </select>
                                    </div>

                                    {/* Champ ID dynamique */}
                                    {notifData.target !== 'all' && (
                                        <div className="col-12" data-aos="slide-down">
                                            <label className="form-label fw-bold text-af-orange d-flex align-items-center gap-2">
                                                <FaUserCircle /> Identifiant numérique du client
                                            </label>
                                            <input 
                                                type="number" 
                                                className="form-control border-0 py-3 shadow-sm" 
                                                placeholder="Entrez l'ID (ex: 42)"
                                                required
                                                value={notifData.target}
                                                onChange={(e) => setNotifData({...notifData, target: e.target.value})}
                                                style={{ borderRadius: 'var(--af-border-radius)' }}
                                            />
                                        </div>
                                    )}

                                    {/* Titre */}
                                    <div className="col-12">
                                        <label className="form-label fw-bold text-af-green">Titre de la notification</label>
                                        <input 
                                            type="text" 
                                            className="form-control form-control-lg border-0 shadow-sm py-3" 
                                            placeholder="Titre accrocheur..."
                                            value={notifData.titre}
                                            onChange={(e) => setNotifData({...notifData, titre: e.target.value})}
                                            required
                                            style={{ borderRadius: 'var(--af-border-radius)', fontSize: '1.1rem' }}
                                        />
                                    </div>

                                    {/* Contenu */}
                                    <div className="col-12">
                                        <label className="form-label fw-bold text-af-green">Corps du message</label>
                                        <textarea 
                                            className="form-control border-0 shadow-sm p-3" 
                                            rows={5} 
                                            placeholder="Rédigez le contenu détaillé de votre message ici..."
                                            value={notifData.message}
                                            onChange={(e) => setNotifData({...notifData, message: e.target.value})}
                                            required
                                            style={{ borderRadius: 'var(--af-border-radius)' }}
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Bouton Action */}
                                <button 
                                    type="submit" 
                                    className="btn btn-primary btn-lg w-100 mt-5 shadow py-3 fw-bold text-white d-flex align-items-center justify-content-center gap-3"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm"></span>
                                    ) : (
                                        <FaPaperPlane size={18} />
                                    )}
                                    {loading ? 'Envoi en cours...' : 'Diffuser maintenant'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}