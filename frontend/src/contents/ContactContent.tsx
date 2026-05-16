import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ContactService from '../services/ContactService';
import { ContactSendPayload } from '../models/ContactModel';
import { 
  MdEmail, 
  MdPhone, 
  MdLocationOn, 
  MdSend, 
  MdAccessTime, 
  MdChat,
  MdCheckCircle,
  MdError
} from 'react-icons/md';

export default function ContactContent() {
    // États pour les champs du formulaire
    const [formData, setFormData] = useState<ContactSendPayload>({
        name: '',
        email: '',
        subject: 'Service Client', // Valeur par défaut correspondant au premier choix
        message: ''
    });

    // États pour le statut de la requête API
    const [loading, setLoading] = useState<boolean>(false);
    
    // Structure de l'alerte pour gérer le Modal custom
    const [modalAlert, setModalAlert] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    // Gestionnaire de changement des inputs (gère génériquement input, textarea et select)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Soumission du formulaire au backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await ContactService.sendPublicMessage(formData);
            
            if (response.status) {
                setModalAlert({
                    type: 'success',
                    text: response.message || 'Votre message a été envoyé avec succès. Notre équipe vous répondra dans les plus brefs délais.'
                });
                // Réinitialisation complète du formulaire
                setFormData({
                    name: '',
                    email: '',
                    subject: 'Service Client',
                    message: ''
                });
            } else {
                setModalAlert({
                    type: 'danger',
                    text: "Une erreur est survenue lors de l'envoi. Veuillez réessayer."
                });
            }
        } catch (error: any) {
            const backendErrors = error.response?.data?.errors;
            let errorMessage = "Impossible de joindre le serveur pour le moment.";
            
            // Extraction et concaténation des erreurs de validation du backend si présentes
            if (backendErrors) {
                errorMessage = Object.values(backendErrors).join(' ');
            }

            setModalAlert({
                type: 'danger',
                text: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-wrapper bg-af-light overflow-hidden">
            
            {/* --- HERO SECTION --- */}
            <section className="py-5 mt-5 text-center">
                <div className="container py-4" data-aos="fade-down">
                    <h6 className="text-af-orange fw-bold text-uppercase">Contactez-nous</h6>
                    <h1 className="display-4 fw-bold text-af-black">Une question ? On vous <br/><span className="text-af-green">répond avec plaisir</span>.</h1>
                    <p className="lead text-muted mx-auto mt-3" style={{ maxWidth: '700px' }}>
                        Que vous soyez un client affamé, un chef passionné ou un futur partenaire, notre équipe est à votre écoute à Douala.
                    </p>
                </div>
            </section>

            {/* --- MAIN CONTENT SECTION --- */}
            <section className="container pb-5">
                <div className="row g-5">
                    
                    {/* --- INFO CARDS --- */}
                    <div className="col-lg-4" data-aos="fade-right">
                        <div className="d-flex flex-column gap-4">
                            
                            <div className="p-4 bg-white shadow-sm border-0 transition-hover" style={{ borderRadius: 'var(--af-border-radius)' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="p-3 rounded-circle" style={{ backgroundColor: 'rgba(39, 174, 96, 0.1)' }}>
                                        <MdPhone className="text-af-green fs-3" />
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-0 text-af-black">Appelez-nous</h6>
                                        <p className="text-muted small mb-0">+237 6XX XXX XXX</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-white shadow-sm border-0 transition-hover" style={{ borderRadius: 'var(--af-border-radius)' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="p-3 rounded-circle" style={{ backgroundColor: 'rgba(230, 126, 34, 0.1)' }}>
                                        <MdEmail className="text-af-orange fs-3" />
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-0 text-af-black">Email</h6>
                                        <p className="text-muted small mb-0">contact@afrifood.cm</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-white shadow-sm border-0 transition-hover" style={{ borderRadius: 'var(--af-border-radius)' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="p-3 rounded-circle" style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)' }}>
                                        <MdLocationOn className="text-af-blue fs-3" />
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-0 text-af-black">Localisation</h6>
                                        <p className="text-muted small mb-0">Douala, Cameroun</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 text-white shadow-lg border-0" style={{ backgroundColor: 'var(--af-black-deep)', borderRadius: 'var(--af-border-radius)' }}>
                                <h6 className="fw-bold mb-3"><MdAccessTime className="me-2 text-af-orange" /> Horaires</h6>
                                <div className="d-flex justify-content-between small opacity-75 mb-2">
                                    <span>Lun - Sam</span>
                                    <span>08:00 - 22:00</span>
                                </div>
                                <div className="d-flex justify-content-between small opacity-75">
                                    <span>Dimanche</span>
                                    <span>10:00 - 20:00</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- CONTACT FORM --- */}
                    <div className="col-lg-8" data-aos="fade-left">
                        <div className="bg-white p-5 shadow-lg border-0" style={{ borderRadius: 'var(--af-border-radius)' }}>
                            <h3 className="fw-bold text-af-black mb-4">Envoyez un message</h3>

                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Nom complet</label>
                                        <input 
                                            type="text" 
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="form-control form-control-lg bg-af-light border-0 px-4" 
                                            style={{ borderRadius: 'var(--af-border-radius)' }} 
                                            placeholder="Votre nom" 
                                            required 
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Email</label>
                                        <input 
                                            type="email" 
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="form-control form-control-lg bg-af-light border-0 px-4" 
                                            style={{ borderRadius: 'var(--af-border-radius)' }} 
                                            placeholder="votre@email.com" 
                                            required 
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold">Sujet</label>
                                        <select 
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="form-select form-control-lg bg-af-light border-0 px-4" 
                                            style={{ borderRadius: 'var(--af-border-radius)' }}
                                            disabled={loading}
                                        >
                                            <option value="Service Client">Service Client</option>
                                            <option value="Devenir Partenaire">Devenir Partenaire</option>
                                            <option value="Recrutement">Recrutement</option>
                                            <option value="Autre">Autre</option>
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold">Message</label>
                                        <textarea 
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="form-control bg-af-light border-0 px-4" 
                                            style={{ borderRadius: 'var(--af-border-radius)' }} 
                                            rows={5} 
                                            placeholder="Comment pouvons-nous vous aider ?" 
                                            required
                                            disabled={loading}
                                        ></textarea>
                                    </div>
                                    <div className="col-12 mt-4 text-center text-lg-start">
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary btn-lg px-5 py-3 shadow-sm fw-bold d-inline-flex align-items-center gap-2"
                                            disabled={loading}
                                            style={{ backgroundColor: 'var(--af-green)', borderColor: 'var(--af-green)' }}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    Envoi en cours...
                                                </>
                                            ) : (
                                                <>
                                                    Envoyer le message <MdSend />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FAQ MINI SECTION --- */}
            <section className="py-5 bg-white border-top">
                <div className="container text-center">
                    <MdChat className="text-af-orange fs-1 mb-3" />
                    <h4 className="fw-bold text-af-black">Besoin d'une réponse rapide ?</h4>
                    <p className="text-muted">Consultez notre foire aux questions pour gagner du temps.</p>
                    <button className="btn btn-outline-dark rounded-pill px-4 fw-bold">Voir la FAQ</button>
                </div>
            </section>

            {/* --- CUSTOM MODAL (Feedback d'envoi) --- */}
            {modalAlert && (
                <>
                    {/* Backdrop (Fond sombre flouté) */}
                    <div className="modal-backdrop fade show custom-backdrop"></div>
                    
                    {/* Conteneur du Modal */}
                    <div className="modal fade show d-block align-items-center d-flex" tabIndex={-1} role="dialog">
                        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '450px' }}>
                            <div className="modal-content border-0 shadow-lg text-center p-4" style={{ borderRadius: 'var(--af-border-radius)' }}>
                                <div className="modal-body pb-0">
                                    {modalAlert.type === 'success' ? (
                                        <div className="scale-up-animation mb-3">
                                            <MdCheckCircle className="text-af-green" style={{ fontSize: '5rem' }} />
                                        </div>
                                    ) : (
                                        <div className="scale-up-animation mb-3">
                                            <MdError className="text-danger" style={{ fontSize: '5rem' }} />
                                        </div>
                                    )}
                                    
                                    <h4 className={`fw-bold mb-2 ${modalAlert.type === 'success' ? 'text-af-black' : 'text-danger'}`}>
                                        {modalAlert.type === 'success' ? 'Félicitations !' : 'Oups...'}
                                    </h4>
                                    
                                    <p className="text-muted small px-2">
                                        {modalAlert.text}
                                    </p>
                                </div>
                                <div className="modal-footer border-0 justify-content-center pt-3">
                                    <button 
                                        type="button" 
                                        className="btn w-100 py-2.5 fw-bold rounded-pill shadow-sm"
                                        style={{ 
                                            backgroundColor: modalAlert.type === 'success' ? 'var(--af-green)' : '#dc3545',
                                            color: '#fff',
                                            border: 'none'
                                        }}
                                        onClick={() => setModalAlert(null)}
                                    >
                                        {modalAlert.type === 'success' ? 'Super, merci !' : 'Réessayer'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* --- STYLES INJECTÉS OPTIMISÉS --- */}
            <style>{`
                .transition-hover { transition: all 0.3s ease; cursor: default; }
                .transition-hover:hover { transform: translateY(-5px); }
                .form-control:focus, .form-select:focus {
                    background-color: #fff !important;
                    box-shadow: 0 0 0 0.25rem rgba(39, 174, 96, 0.15);
                    border: 1px solid var(--af-green) !important;
                }
                .custom-backdrop {
                    background-color: rgba(0, 0, 0, 0.4) !important;
                    backdrop-filter: blur(4px);
                    z-index: 1050;
                }
                .modal {
                    z-index: 1055;
                }
                .scale-up-animation {
                    animation: scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
                }
                @keyframes scaleUp {
                    0% { transform: scale(0.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}