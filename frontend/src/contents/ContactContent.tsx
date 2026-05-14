import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { 
  MdEmail, 
  MdPhone, 
  MdLocationOn, 
  MdSend, 
  MdAccessTime, 
  MdChat 
} from 'react-icons/md';

export default function ContactContent() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Logique d'envoi ici
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

            <section className="container pb-5">
                <div className="row g-5">
                    
                    {/* --- INFO CARDS --- */}
                    <div className="col-lg-4" data-aos="fade-right">
                        <div className="d-flex flex-column gap-4">
                            
                            <div className="p-4 bg-white rounded-4 shadow-sm border-0 transition-hover" style={{ borderRadius: 'var(--af-border-radius)' }}>
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

                            <div className="p-4 bg-white rounded-4 shadow-sm border-0 transition-hover" style={{ borderRadius: 'var(--af-border-radius)' }}>
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

                            <div className="p-4 bg-white rounded-4 shadow-sm border-0 transition-hover" style={{ borderRadius: 'var(--af-border-radius)' }}>
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
                                        <input type="text" className="form-control form-control-lg bg-af-light border-0 px-4" style={{ borderRadius: 'var(--af-border-radius)' }} placeholder="Votre nom" required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Email</label>
                                        <input type="email" className="form-control form-control-lg bg-af-light border-0 px-4" style={{ borderRadius: 'var(--af-border-radius)' }} placeholder="votre@email.com" required />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold">Sujet</label>
                                        <select className="form-select form-control-lg bg-af-light border-0 px-4" style={{ borderRadius: 'var(--af-border-radius)' }}>
                                            <option>Service Client</option>
                                            <option>Devenir Partenaire</option>
                                            <option>Recrutement</option>
                                            <option>Autre</option>
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold">Message</label>
                                        <textarea className="form-control bg-af-light border-0 px-4" style={{ borderRadius: 'var(--af-border-radius)' }} rows={5} placeholder="Comment pouvons-nous vous aider ?" required></textarea>
                                    </div>
                                    <div className="col-12 mt-4 text-center text-lg-start">
                                        <button type="submit" className="btn btn-primary btn-lg px-5 py-3 shadow-sm fw-bold">
                                            Envoyer le message <MdSend className="ms-2" />
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

            <style>{`
                .transition-hover { transition: transform 0.3s ease; cursor: default; }
                .transition-hover:hover { transform: translateY(-5px); }
                .form-control:focus {
                    background-color: #fff !important;
                    box-shadow: 0 0 0 0.25rem rgba(39, 174, 96, 0.15);
                    border: 1px solid var(--af-green) !important;
                }
            `}</style>
        </div>
    );
}