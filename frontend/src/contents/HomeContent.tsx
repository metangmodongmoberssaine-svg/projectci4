import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Importation de l'image unique
import pouletDG from '../assets/Poulet DG.jpg';

import { 
    FaLeaf, FaUtensils, FaRobot, 
    FaArrowRight, FaPlay, FaSearch, 
    FaShieldAlt, FaMap, FaQuoteLeft 
} from 'react-icons/fa';

const HomeContent: React.FC = () => {

    useEffect(() => {
        AOS.init({ 
            duration: 1000, 
            once: false, 
            easing: 'ease-out-back' 
        });
    }, []);

    const steps = [
        { num: '01', icon: <FaSearch />, title: 'Choisissez', desc: 'Explorez les menus de nos meilleurs chefs locaux.', color: 'var(--af-orange)' },
        { num: '02', icon: <FaUtensils />, title: 'Préparation', desc: 'Votre plat est cuisiné à la demande avec soin.', color: 'var(--af-green)' },
        { num: '03', icon: <FaShieldAlt />, title: 'Sécurité', desc: 'Paiement sécurisé par Mobile Money ou carte.', color: 'var(--af-blue)' },
        { num: '04', icon: <FaMap />, title: 'Dégustez', desc: 'Livraison express à votre porte en 30min.', color: 'var(--af-green)' }
    ];

    return (
        <div className="home-wrapper overflow-hidden bg-af-light">
            
            {/* 🚀 HERO SECTION */}
            <section className="container-fluid min-vh-100 d-flex align-items-center position-relative py-5">
                <div className="container">
                    <div className="row align-items-center">
                        
                        <div className="col-lg-7 text-center text-lg-start" data-aos="fade-right">
                            <div className="badge rounded-pill mb-3 px-3 py-2" style={{ backgroundColor: 'rgba(39, 174, 96, 0.1)', color: 'var(--af-green)', fontWeight: 'bold' }}>
                                <FaLeaf className="me-2" /> N°1 Gastronomie Africaine à Douala
                            </div>
                            <h1 className="display-1 fw-bold mb-4" style={{ lineHeight: '1.1', color: 'var(--af-black-deep)' }}>
                                Le goût de l'Afrique, <br />
                                <span style={{ color: 'var(--af-orange)' }}>Livré chez vous.</span>
                            </h1>
                            <p className="lead mb-5 text-muted" style={{ fontSize: '1.25rem', maxWidth: '600px' }}>
                                Savourez notre **Poulet DG national**, préparé avec des plantains mûrs et des épices du terroir. 
                                Frais, authentique et livré en un clin d'œil.
                            </p>
                            
                            <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3 mb-5">
                                <Link to="/ourfood" className="btn btn-lg px-5 py-3 shadow-lg btn-primary">
                                    Commander maintenant <FaArrowRight className="ms-2" />
                                </Link>
                                <button className="btn btn-lg btn-outline-dark px-4 py-3 rounded-pill fw-bold">
                                    <FaPlay className="me-2" size="0.8em" /> Voir la recette
                                </button>
                            </div>

                            <div className="row g-4 pt-4 border-top">
                                <div className="col-4">
                                    <h3 className="fw-bold mb-0 text-af-black">30min</h3>
                                    <small className="text-muted">Moyenne</small>
                                </div>
                                <div className="col-4 border-start border-end">
                                    <h3 className="fw-bold mb-0 text-af-black">2.5k+</h3>
                                    <small className="text-muted">Avis Clients</small>
                                </div>
                                <div className="col-4">
                                    <h3 className="fw-bold mb-0 text-af-black">100%</h3>
                                    <small className="text-muted">Fait Maison</small>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-5 mt-5 mt-lg-0 text-center position-relative" data-aos="fade-left">
                            <div className="visual-container">
                                <div className="blob-bg"></div>
                                {/* Mise en avant du Poulet DG avec un effet de zoom léger au hover */}
                                <div className="dish-frame">
                                    <img 
                                        src={pouletDG} 
                                        alt="Le célèbre Poulet DG" 
                                        className="img-fluid floating-img main-dish-shadow" 
                                        style={{ 
                                            width: '450px', 
                                            height: '450px', 
                                            objectFit: 'cover', 
                                            border: '12px solid white' 
                                        }} 
                                    />
                                    {/* Badge de prix ou promotionnel pour dynamiser */}
                                    <div className="promo-badge shadow-lg">
                                        <span className="d-block small">À partir de</span>
                                        <span className="fw-bold fs-4">3500 FCFA</span>
                                    </div>
                                </div>
                                
                                <div className="ai-badge shadow-lg p-3 rounded-4 bg-white" data-aos="zoom-in" data-aos-delay="500">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-2 rounded-circle text-white" style={{ backgroundColor: 'var(--af-blue)' }}>
                                            <FaRobot size="1.2rem" />
                                        </div>
                                        <div className="text-start">
                                            <div className="fw-bold small text-af-black">Suggestion IA</div>
                                            <div className="text-af-green x-small fw-bold">Populaire</div>
                                        </div>
                                    </div>
                                    <p className="small mb-0 mt-2 text-muted text-start fst-italic">"Le Poulet DG est le favori de la semaine à Douala !"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 💡 SECTION PROCESSUS */}
            <section className="py-5 bg-white shadow-sm">
                <div className="container py-5">
                    <div className="text-center mb-5" data-aos="fade-up">
                        <span className="badge px-3 py-2 mb-2 fw-bold" style={{ backgroundColor: 'rgba(230, 126, 34, 0.1)', color: 'var(--af-orange)' }}>SIMPLE & RAPIDE</span>
                        <h2 className="display-5 fw-bold text-af-black">Votre repas en 4 étapes</h2>
                    </div>
                    <div className="row g-4">
                        {steps.map((step, i) => (
                            <div className="col-md-6 col-lg-3" key={i} data-aos="fade-up" data-aos-delay={i * 100}>
                                <div className="step-card h-100 p-4 border-0 shadow-sm rounded-4 position-relative overflow-hidden bg-af-light" style={{ borderRadius: 'var(--af-border-radius)' }}>
                                    <div className="step-num-bg position-absolute top-0 end-0 opacity-10 fw-bold" style={{ color: 'var(--af-orange)', fontSize: '5rem' }}>{step.num}</div>
                                    <div className="mb-3 fs-3 p-3 rounded-4 d-inline-block bg-white shadow-sm" style={{ color: step.color }}>
                                        {step.icon}
                                    </div>
                                    <h5 className="fw-bold mb-2 text-af-black">{step.title}</h5>
                                    <p className="text-muted small mb-0">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 💬 TESTIMONIALS */}
            <section className="py-5 bg-af-light">
                <div className="container py-5">
                    <div className="row align-items-center">
                        <div className="col-lg-4 mb-5 mb-lg-0" data-aos="fade-right">
                            <h2 className="display-6 fw-bold mb-4 text-af-black">Ce que disent nos <span className="text-af-green">gourmets</span>.</h2>
                            <p className="text-muted lead">Plus de 2000 clients à Douala nous font confiance.</p>
                            <Link to="/reviews" className="btn btn-outline-dark rounded-pill px-4">Lire tous les avis</Link>
                        </div>
                        <div className="col-lg-8">
                            <div className="row g-4">
                                {[1, 2].map((item) => (
                                    <div className="col-md-6" key={item} data-aos="zoom-in" data-aos-delay={item * 200}>
                                        <div className="p-4 rounded-4 bg-white shadow-sm border-0 h-100" style={{ borderRadius: 'var(--af-border-radius)' }}>
                                            <FaQuoteLeft className="text-af-orange fs-2 mb-3 opacity-25" />
                                            <p className="fst-italic text-muted">"Le service est incroyable. Le Poulet DG arrive chaud et le goût est exactement comme à la maison."</p>
                                            <div className="d-flex align-items-center gap-3 mt-4">
                                                <div className="avatar p-2 rounded-circle fw-bold text-white d-flex align-items-center justify-content-center" style={{ backgroundColor: 'var(--af-blue)', width: '45px', height: '45px' }}>JD</div>
                                                <div>
                                                    <h6 className="mb-0 fw-bold text-af-black">Christian T.</h6>
                                                    <small className="text-af-green fw-bold">Client Fidèle • Douala</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .visual-container { position: relative; padding: 20px; }
                .blob-bg {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    width: 120%; height: 120%;
                    background: radial-gradient(circle, rgba(230, 126, 34, 0.15) 0%, transparent 70%);
                    z-index: 0;
                }
                .dish-frame { z-index: 1; position: relative; }
                
                .floating-img {
                    border-radius: 50%;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    animation: float 6s ease-in-out infinite;
                    transition: transform 0.4s ease;
                }
                .floating-img:hover {
                    transform: scale(1.05) rotate(5deg);
                }

                .promo-badge {
                    position: absolute;
                    top: 10%;
                    left: -5%;
                    background: var(--af-orange);
                    color: white;
                    padding: 15px;
                    border-radius: 50%;
                    z-index: 10;
                    transform: rotate(-15deg);
                    border: 4px solid white;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }

                .ai-badge {
                    position: absolute; bottom: 5%; right: -5%;
                    z-index: 5; width: 220px;
                    animation: float 5s ease-in-out infinite reverse;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .x-small { font-size: 0.75rem; }
            `}</style>
        </div>
    );
}

export default HomeContent;