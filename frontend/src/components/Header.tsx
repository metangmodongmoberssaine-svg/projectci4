import React, { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import logoApp from '../assets/logo-app.png'; 

export default function Header() {
    
    useEffect(() => {
        AOS.init({ duration: 800 });
    }, []);

    const activeStyle = ({ isActive }: { isActive: boolean }) => ({
        color: isActive ? 'var(--af-orange)' : 'var(--af-black)',
        fontWeight: isActive ? '700' : '500',
        borderBottom: isActive ? '3px solid var(--af-orange)' : '3px solid transparent',
        transition: 'all 0.3s ease'
    });

    return (
        <nav className="navbar navbar-expand-lg sticky-top shadow-sm bg-white py-2" data-aos="fade-down">
            <div className="container">
                {/* Logo AfricaFood */}
                <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
                    <img 
                        src={logoApp} 
                        alt="AfricaFood Logo" 
                        style={{ 
                            height: '50px', 
                            width: 'auto',
                            objectFit: 'contain'
                        }} 
                    />
                    <span style={{ 
                        fontSize: '1.4rem', 
                        fontWeight: '800',
                        letterSpacing: '-0.5px',
                        lineHeight: '1'
                    }}>
                        <span style={{ color: 'var(--af-orange)' }}>AFRICA</span>
                        <span style={{ color: 'var(--af-green)' }}>FOOD</span>
                    </span>
                </Link>

                <button 
                    className="navbar-toggler border-0" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav"
                    style={{ color: 'var(--af-orange)' }}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav mx-auto">
                        <li className="nav-item px-3">
                            <NavLink className="nav-link" to="/" style={activeStyle}>Accueil</NavLink>
                        </li>
                        <li className="nav-item px-3">
                            <NavLink className="nav-link" to="/ourfood" style={activeStyle}>Nos Plats</NavLink>
                        </li>
                        <li className="nav-item px-3">
                            <NavLink className="nav-link" to="/about" style={activeStyle}>À Propos</NavLink>
                        </li>
                        <li className="nav-item px-3">
                            <NavLink className="nav-link" to="/contact" style={activeStyle}>Contact</NavLink>
                        </li>
                    </ul>

                    <div className="d-flex align-items-center gap-4">
                        <Link 
                            to="/login" 
                            className="text-decoration-none transition-all" 
                            style={{ 
                                color: 'var(--af-black)', 
                                fontWeight: '600',
                                fontSize: '0.95rem' 
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--af-orange)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--af-black)'}
                        >
                            Connexion
                        </Link>
                        
                        <Link 
                            to="/register" 
                            className="btn px-4 py-2 text-white shadow-sm" 
                            style={{ 
                                backgroundColor: 'var(--af-orange)', 
                                borderRadius: 'var(--af-border-radius)',
                                fontWeight: '700',
                                border: 'none',
                                transition: '0.3s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--af-orange-dark)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--af-orange)'}
                        >
                            S'inscrire
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
