import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaWhatsapp, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="pt-5 pb-3" style={{ backgroundColor: 'var(--af-black)', color: 'var(--af-white)' }}>
            <div className="container">
                <div className="row gy-4">
                    
                    {/* 🦁 Section Marque & Description */}
                    <div className="col-lg-4 col-md-6">
                        <Link className="text-decoration-none mb-3 d-block" to="/">
                            <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>
                                <span style={{ color: 'var(--af-orange)' }}>AFRICA</span>
                                <span style={{ color: 'var(--af-green)' }}>FOOD</span>
                            </span>
                        </Link>
                        <p className="text-gray" style={{ color: '#BDC3C7', lineHeight: '1.6' }}>
                            Découvrez le meilleur de la gastronomie africaine livrée chez vous. 
                            Fraîcheur, tradition et rapidité au service de vos papilles.
                        </p>
                        <div className="d-flex gap-3 mt-4">
                            {/* ✅ Correction : Utilisation des props size et color directement */}
                            <a href="#"><FaFacebook color="var(--af-orange)" size="1.2rem" /></a>
                            <a href="#"><FaInstagram color="var(--af-orange)" size="1.2rem" /></a>
                            <a href="#"><FaTwitter color="var(--af-orange)" size="1.2rem" /></a>
                            <a href="#"><FaWhatsapp color="var(--af-orange)" size="1.2rem" /></a>
                        </div>
                    </div>

                    {/* 🔗 Liens Rapides */}
                    <div className="col-lg-2 col-md-6">
                        <h5 className="mb-4" style={{ fontWeight: '700', borderLeft: '4px solid var(--af-green)', paddingLeft: '10px' }}>
                            Navigation
                        </h5>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link to="/" className="text-decoration-none" style={{ color: '#BDC3C7' }}>Accueil</Link></li>
                            <li className="mb-2"><Link to="/ourfood" className="text-decoration-none" style={{ color: '#BDC3C7' }}>Nos Plats</Link></li>
                            <li className="mb-2"><Link to="/about" className="text-decoration-none" style={{ color: '#BDC3C7' }}>À Propos</Link></li>
                            <li className="mb-2"><Link to="/contact" className="text-decoration-none" style={{ color: '#BDC3C7' }}>Contact</Link></li>
                        </ul>
                    </div>

                    {/* 📞 Contact & Support */}
                    <div className="col-lg-3 col-md-6">
                        <h5 className="mb-4" style={{ fontWeight: '700', borderLeft: '4px solid var(--af-orange)', paddingLeft: '10px' }}>
                            Contact
                        </h5>
                        <ul className="list-unstyled" style={{ color: '#BDC3C7' }}>
                            <li className="mb-3 d-flex align-items-center gap-2">
                                <FaMapMarkerAlt color="var(--af-orange)" /> Douala, Cameroun
                            </li>
                            <li className="mb-3 d-flex align-items-center gap-2">
                                <FaPhoneAlt color="var(--af-orange)" /> +237 6xx xxx xxx
                            </li>
                            <li className="mb-3 d-flex align-items-center gap-2">
                                <FaEnvelope color="var(--af-orange)" /> contact@africafood.com
                            </li>
                        </ul>
                    </div>

                    {/* ✉️ Newsletter */}
                    <div className="col-lg-3 col-md-6">
                        <h5 className="mb-4" style={{ fontWeight: '700', borderLeft: '4px solid var(--af-blue)', paddingLeft: '10px' }}>
                            Newsletter
                        </h5>
                        <p style={{ fontSize: '0.9rem', color: '#BDC3C7' }}>Inscrivez-vous pour recevoir nos promotions.</p>
                        <div className="input-group mb-3">
                            <input 
                                type="text" 
                                className="form-control border-0" 
                                placeholder="Votre email" 
                                style={{ borderRadius: 'var(--af-border-radius) 0 0 var(--af-border-radius)' }}
                            />
                            <button 
                                className="btn" 
                                style={{ 
                                    backgroundColor: 'var(--af-green)', 
                                    color: 'white',
                                    borderRadius: '0 var(--af-border-radius) var(--af-border-radius) 0'
                                }}
                            >
                                Ok
                            </button>
                        </div>
                    </div>
                </div>

                <hr className="my-4" style={{ backgroundColor: '#444', opacity: '0.5' }} />

                <div className="row">
                    <div className="col-md-6 text-center text-md-start">
                        <p className="mb-0" style={{ fontSize: '0.85rem', color: '#7F8C8D' }}>
                            © {currentYear} <strong>AfricaFood</strong>. Tous droits réservés.
                        </p>
                    </div>
                   
                </div>
            </div>
        </footer>
    );
}