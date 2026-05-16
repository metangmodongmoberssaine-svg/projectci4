import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import AuthService, { RegisterData } from '../services/AuthService';

export default function RegisterContent() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const [formData, setFormData] = useState<RegisterData>({
        nom: '',
        prenom: '',
        telephone: '',
        email: '',
        password: '',
        ville: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await AuthService.register(formData);
            if (response.status) {
                navigate('/otp', { state: { email: formData.email } });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Une erreur est survenue lors de l'inscription.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="auth-wrapper" style={{
            background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center'
        }}>
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5" data-aos="zoom-in">
                        <div className="card shadow-lg border-0" style={{ 
                            borderRadius: 'var(--af-border-radius)',
                            overflow: 'hidden',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <h2 style={{ color: 'var(--af-primary)', fontWeight: '800', textTransform: 'uppercase' }}>
                                        AfricaFood
                                    </h2>
                                    <p className="text-muted">Créez votre compte en quelques secondes</p>
                                </div>

                                {error && (
                                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        <div>{error}</div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3" data-aos="fade-right" data-aos-delay="200">
                                            <label className="form-label fw-bold small">NOM</label>
                                            <input type="text" name="nom" className="form-control form-control-lg border-0 bg-light" onChange={handleChange} required style={{ fontSize: '0.9rem' }} />
                                        </div>
                                        <div className="col-md-6 mb-3" data-aos="fade-left" data-aos-delay="300">
                                            <label className="form-label fw-bold small">PRÉNOM</label>
                                            <input type="text" name="prenom" className="form-control form-control-lg border-0 bg-light" onChange={handleChange} required style={{ fontSize: '0.9rem' }} />
                                        </div>
                                    </div>

                                    <div className="mb-3" data-aos="fade-up" data-aos-delay="400">
                                        <label className="form-label fw-bold small">TÉLÉPHONE</label>
                                        <div className="input-group">
                                            <span className="input-group-text border-0 bg-light"><i className="bi bi-telephone text-muted"></i></span>
                                            <input type="tel" name="telephone" className="form-control form-control-lg border-0 bg-light" onChange={handleChange} required style={{ fontSize: '0.9rem' }} />
                                        </div>
                                    </div>

                                    <div className="mb-3" data-aos="fade-up" data-aos-delay="500">
                                        <label className="form-label fw-bold small">EMAIL</label>
                                        <div className="input-group">
                                            <span className="input-group-text border-0 bg-light"><i className="bi bi-envelope text-muted"></i></span>
                                            <input type="email" name="email" className="form-control form-control-lg border-0 bg-light" onChange={handleChange} required style={{ fontSize: '0.9rem' }} />
                                        </div>
                                    </div>

                                    <div className="mb-4" data-aos="fade-up" data-aos-delay="600">
                                        <label className="form-label fw-bold small">MOT DE PASSE</label>
                                        <div className="input-group">
                                            <span className="input-group-text border-0 bg-light"><i className="bi bi-lock text-muted"></i></span>
                                            <input type="password" name="password" className="form-control form-control-lg border-0 bg-light" onChange={handleChange} required style={{ fontSize: '0.9rem' }} />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="btn w-100 py-3 shadow-sm" 
                                        disabled={loading}
                                        style={{ 
                                            backgroundColor: 'var(--af-primary)', 
                                            color: 'white',
                                            fontWeight: 'bold',
                                            borderRadius: 'var(--af-border-radius)',
                                            border: 'none',
                                            transition: 'transform 0.2s ease-in-out'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                        ) : "COMMENCER L'AVENTURE"}
                                    </button>
                                </form>

                                <div className="text-center mt-4">
                                    <p className="small text-muted">
                                        Déjà un compte ? <a href="/login" style={{ color: 'var(--af-secondary)', fontWeight: 'bold', textDecoration: 'none' }}>Connectez-vous</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
