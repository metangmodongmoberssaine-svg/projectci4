import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';
import { 
  MdVerified, 
  MdTimer, 
  MdRestaurantMenu, 
  MdEco, 
  MdSecurity, 
  MdPeopleAlt,
  MdOutlineThumbUp
} from 'react-icons/md';

// Importations des assets
import pouletDG from '../assets/Poulet DG.jpg';
import logoAppli from '../assets/logo-app.png'; // Utilisation du logo comme dans ton exemple

export default function AboutContent() {
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: false,
            mirror: true,
            easing: 'ease-out-back',
        });
    }, []);

    return (
        <div className="about-wrapper bg-af-light overflow-hidden">
            
            {/* --- 🚀 HERO SECTION (Inspirée d'ExchaPay) --- */}
            <section className="py-5 mt-5 text-center position-relative">
                <div className="container py-5" data-aos="zoom-in">
                    <span className="badge rounded-pill px-3 py-2 mb-3" style={{ backgroundColor: 'rgba(39, 174, 96, 0.1)', color: 'var(--af-green)', fontWeight: 'bold' }}>
                        NOTRE HISTOIRE & ENGAGEMENT
                    </span>
                    <h1 className="display-3 fw-bold text-af-black mb-4">
                        Porter la gastronomie <br />
                        <span style={{ color: 'var(--af-orange)' }}>Africaine au sommet</span> 🌍
                    </h1>
                    <p className="lead text-muted mx-auto mb-5" style={{ maxWidth: '800px' }}>
                        AfriFood simplifie l'accès aux saveurs authentiques du Cameroun. Nous connectons le savoir-faire de nos chefs à la modernité de la livraison express.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <Link to="/ourfood" className="btn btn-lg px-5 py-3 shadow-lg btn-primary rounded-pill">
                            Découvrir le menu
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- 🖼️ LOGO & INTRODUCTION --- */}
            <section className="container py-5">
                <div className="row align-items-center g-5">
                    <div className="col-lg-5 text-center" data-aos="fade-right">
                        <div className="position-relative d-inline-block">
                            <div className="position-absolute top-50 start-50 translate-middle rounded-circle" 
                                 style={{width: '120%', height: '120%', backgroundColor: 'var(--af-green)', opacity: '0.05', filter: 'blur(40px)'}}>
                            </div>
                            <img src={logoAppli} alt="AfriFood Logo" className="position-relative img-fluid" style={{ maxHeight: '300px' }} />
                        </div>
                    </div>
                    <div className="col-lg-7" data-aos="fade-left">
                        <h6 className="text-af-orange fw-bold text-uppercase mb-2">À propos d'AfriFood</h6>
                        <h2 className="fw-bold text-af-black mb-3">La révolution culinaire à Douala</h2>
                        <p className="text-muted fs-5 mb-4">
                            Né d'un désir de valoriser notre patrimoine culinaire, AfriFood n'est pas qu'une application de livraison. C'est un écosystème conçu pour offrir une expérience gastronomique digne, saine et rapide.
                        </p>
                        <div className="row g-3">
                            <div className="col-6">
                                <div className="d-flex align-items-center gap-2">
                                    <MdVerified className="text-af-green fs-4" />
                                    <span className="fw-bold">Produits Certifiés</span>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="d-flex align-items-center gap-2">
                                    <MdTimer className="text-af-green fs-4" />
                                    <span className="fw-bold">Livraison -30min</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 💎 NOS VALEURS (Piliers) --- */}
            <section className="py-5" style={{ backgroundColor: '#fdf8f4' }}>
                <div className="container">
                    <div className="text-center mb-5" data-aos="fade-up">
                        <h3 className="fw-bold text-af-black">Nos Piliers d'Excellence</h3>
                        <div className="mx-auto mt-2" style={{ height: '4px', width: '40px', backgroundColor: 'var(--af-orange)', borderRadius: '10px' }}></div>
                    </div>

                    <div className="row g-4">
                        {[
                            { icon: <MdRestaurantMenu />, title: "Authenticité", desc: "Le vrai goût du pays, sans compromis.", delay: 100, color: 'var(--af-orange)' },
                            { icon: <MdEco />, title: "Éco-responsable", desc: "Emballages biodégradables et produits locaux.", delay: 200, color: 'var(--af-green)' },
                            { icon: <MdPeopleAlt />, title: "Social", desc: "Soutien direct aux agriculteurs de nos régions.", delay: 300, color: 'var(--af-blue)' }
                        ].map((item) => (
                            <div className="col-md-4" key={item.title} data-aos="fade-up" data-aos-delay={item.delay}>
                                <div className="p-4 rounded-4 shadow-sm h-100 bg-white text-center border-0 hover-up transition-all">
                                    <div className="fs-1 mb-3" style={{ color: item.color }}>
                                        {item.icon}
                                    </div>
                                    <h5 className="fw-bold text-af-black">{item.title}</h5>
                                    <p className="text-muted mb-0 small">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 🛡️ HYGIÈNE & SÉCURITÉ --- */}
            <section className="py-5 bg-white">
                <div className="container">
                    <div className="row g-5 align-items-center">
                        <div className="col-lg-6" data-aos="fade-right">
                            <div className="p-4 rounded-5 shadow-lg border-start border-5 border-af-green bg-af-light">
                                <h4 className="fw-bold text-af-black mb-4">Qualité & Hygiène Garanties 🛡️</h4>
                                <div className="d-flex flex-column gap-4">
                                    <div className="d-flex align-items-start gap-3">
                                        <div className="p-2 bg-white rounded-circle shadow-sm">
                                            <MdSecurity className="text-af-green fs-3" />
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1">Contrôles Stricts</h6>
                                            <p className="small text-muted mb-0">Chaque cuisine partenaire suit une charte d'hygiène rigoureuse vérifiée par nos experts.</p>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-start gap-3">
                                        <div className="p-2 bg-white rounded-circle shadow-sm">
                                            <MdOutlineThumbUp className="text-af-green fs-3" />
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1">Satisfaction Assurée</h6>
                                            <p className="small text-muted mb-0">Votre repas est préparé à la commande pour garantir une fraîcheur maximale.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6" data-aos="fade-left">
                            <img 
                                src={pouletDG} 
                                alt="Cuisine Propre" 
                                className="img-fluid rounded-5 shadow-lg" 
                                style={{ transform: 'rotate(-2deg)' }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 🎯 MISSION FINALE --- */}
            <section className="py-5 text-white text-center" style={{ backgroundColor: 'var(--af-black-deep)' }}>
                <div className="container py-4" data-aos="fade-up">
                    <h2 className="fw-bold mb-4">Notre Mission 🎯</h2>
                    <p className="lead mx-auto mb-5 opacity-75" style={{maxWidth: '800px'}}>
                        "Nous bâtissons le futur de la restauration en Afrique : une cuisine qui honore nos racines tout en embrassant l'excellence technologique."
                    </p>
                    <div className="row g-3 justify-content-center">
                        {[
                            { title: "Qualité", val: "100%" },
                            { title: "Rapidité", val: "Moy. 25min" },
                            { title: "Sourires", val: "Illimités" }
                        ].map((stat) => (
                            <div className="col-6 col-md-2" key={stat.title}>
                                <div className="p-3 rounded-4 bg-white bg-opacity-10 border border-white border-opacity-10">
                                    <h5 className="fw-bold text-af-orange mb-1">{stat.val}</h5>
                                    <small className="text-uppercase opacity-50" style={{ fontSize: '0.7rem' }}>{stat.title}</small>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <style>{`
                .hover-up {
                    transition: all 0.3s ease;
                }
                .hover-up:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 1rem 3rem rgba(0,0,0,0.1) !important;
                }
                .bg-af-light { background-color: #f8f9fa; }
            `}</style>
        </div>
    );
}