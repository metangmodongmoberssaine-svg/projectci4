import React, { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Header() {
    
    useEffect(() => {
        AOS.init({ duration: 800 });
    }, []);

    // Style pour les liens actifs (pour savoir sur quelle page on est)
    const activeStyle = ({ isActive }: { isActive: boolean }) => ({
        color: isActive ? 'var(--af-primary)' : 'var(--af-black)',
        fontWeight: isActive ? 'bold' : '500',
        borderBottom: isActive ? '2px solid var(--af-primary)' : 'none'
    });

    return (
        <nav className="navbar navbar-expand-lg sticky-top shadow-sm bg-white py-3" data-aos="fade-down">
            <div className="container">
                {/* Logo AfricaFood */}
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <span style={{ 
                        color: 'var(--af-primary)', 
                        fontSize: '1.5rem', 
                        fontWeight: '800',
                        letterSpacing: '1px'
                    }}>
                        AFRICA<span style={{ color: 'var(--af-secondary)' }}>FOOD</span>
                    </span>
                </Link>

                {/* Bouton Menu Mobile */}
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Liens de navigation */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav mx-auto">
                        <li className="nav-item px-2">
                            <NavLink className="nav-link" to="/" style={activeStyle}>Accueil</NavLink>
                        </li>
                        <li className="nav-item px-2">
                            <NavLink className="nav-link" to="/ourfood" style={activeStyle}>Nos Plats</NavLink>
                        </li>
                        <li className="nav-item px-2">
                            <NavLink className="nav-link" to="/about" style={activeStyle}>À Propos</NavLink>
                        </li>
                        <li className="nav-item px-2">
                            <NavLink className="nav-link" to="/contact" style={activeStyle}>Contact</NavLink>
                        </li>
                    </ul>

                    {/* Boutons d'action (Login / Register) */}
                    <div className="d-flex align-items-center gap-3">
                        <Link to="/login" className="text-decoration-none" style={{ color: 'var(--af-black)', fontWeight: '600' }}>
                            Connexion
                        </Link>
                        <Link 
                            to="/register" 
                            className="btn px-4 py-2" 
                            style={{ 
                                backgroundColor: 'var(--af-primary)', 
                                color: 'white',
                                borderRadius: 'var(--af-border-radius)',
                                fontWeight: 'bold',
                                transition: '0.3s'
                            }}
                        >
                            S'inscrire
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
