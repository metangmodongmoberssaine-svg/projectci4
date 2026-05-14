import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import AuthService from '../services/AuthService';

export default function OtpContent() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // On récupère l'email passé par le state de la navigation
    const emailFromRegister = location.state?.email || "";

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        AOS.init({ duration: 800 });
        
        // Si aucun email n'est trouvé, on redirige vers register par sécurité
        if (!emailFromRegister) {
            navigate('/register');
        }
    }, [emailFromRegister, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await AuthService.verifyOtp(emailFromRegister, otp);
            
            if (response.status) {
                setSuccess("Compte activé avec succès ! Redirection...");
                // Attendre 2 secondes pour que l'utilisateur voit le message de succès
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Code OTP invalide ou expiré.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-5" data-aos="fade-down">
                    <div className="card shadow-lg border-0" style={{ borderRadius: 'var(--af-border-radius)' }}>
                        <div className="card-body p-5 text-center">
                            {/* Icône ou Illustration */}
                            <div className="mb-4" style={{ fontSize: '3rem', color: 'var(--af-primary)' }}>
                                <i className="bi bi-shield-check"></i>
                            </div>

                            <h2 className="mb-3" style={{ color: 'var(--af-primary)', fontWeight: 'bold' }}>
                                Vérification OTP
                            </h2>
                            <p className="text-muted mb-4">
                                Un code a été envoyé à : <br />
                                <strong>{emailFromRegister}</strong>
                            </p>

                            {error && <div className="alert alert-danger" data-aos="shake">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        className="form-control form-control-lg text-center"
                                        placeholder="000000"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        style={{ 
                                            letterSpacing: '8px', 
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold',
                                            borderColor: 'var(--af-primary)'
                                        }}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn w-100 py-3"
                                    disabled={loading || otp.length < 6}
                                    style={{
                                        backgroundColor: 'var(--af-primary)',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        borderRadius: 'var(--af-border-radius)',
                                        transition: '0.3s'
                                    }}
                                >
                                    {loading ? 'Vérification...' : 'Activer mon compte'}
                                </button>
                            </form>

                            <div className="mt-4">
                                <button 
                                    className="btn btn-link text-decoration-none" 
                                    style={{ color: 'var(--af-secondary)' }}
                                    onClick={() => navigate('/register')}
                                >
                                    Retour à l'inscription
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}