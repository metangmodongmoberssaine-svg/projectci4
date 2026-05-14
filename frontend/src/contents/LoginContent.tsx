import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import AuthService from '../services/AuthService';

export default function LoginContent() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await AuthService.login(credentials);
            
            // Correction TypeScript : Vérification stricte de la présence des données
            if (response.status && response.token && response.user) {
                
                // Stockage sécurisé
                localStorage.setItem('auth_token', response.token);
                localStorage.setItem('user_data', JSON.stringify(response.user));

                // Logique de redirection selon le rôle définit dans ta migration
                const userRole = response.user.role;

                if (userRole === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/'); // Redirection client vers l'accueil
                }
            } else {
                setError("La réponse du serveur est incomplète.");
            }
        } catch (err: any) {
            // Gestion de l'erreur selon le format de ton intercepteur API
            setError(err.response?.data?.message || "Identifiants incorrects ou compte non vérifié.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-5" data-aos="fade-up">
                    <div className="card shadow-lg border-0" style={{ borderRadius: 'var(--af-border-radius)' }}>
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <h2 style={{ color: 'var(--af-primary)', fontWeight: 'bold' }}>Connexion</h2>
                                <p className="text-muted small">Accédez à votre espace AfricaFood</p>
                            </div>

                            {error && (
                                <div className="alert alert-danger mb-4 animate__animated animate__shakeX" style={{ fontSize: '0.9rem' }}>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold small">Email</label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        className="form-control border-0 px-3" 
                                        style={{ backgroundColor: 'var(--af-light)', paddingTop: '12px', paddingBottom: '12px' }}
                                        onChange={handleChange} 
                                        required 
                                        placeholder="votre@email.com"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold small">Mot de passe</label>
                                    <input 
                                        type="password" 
                                        name="password" 
                                        className="form-control border-0 px-3" 
                                        style={{ backgroundColor: 'var(--af-light)', paddingTop: '12px', paddingBottom: '12px' }}
                                        onChange={handleChange} 
                                        required 
                                        placeholder="********"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn w-100 py-2 mb-3 d-flex align-items-center justify-content-center gap-2" 
                                    disabled={loading}
                                    style={{ 
                                        backgroundColor: 'var(--af-primary)', 
                                        color: 'white',
                                        fontWeight: 'bold',
                                        borderRadius: 'var(--af-border-radius)',
                                        transition: '0.3s'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                            <span>Chargement...</span>
                                        </>
                                    ) : 'Se connecter'}
                                </button>
                            </form>

                            <div className="text-center mt-4">
                                <p className="mb-0 text-muted small">
                                    Pas encore de compte ?{' '}
                                    <Link to="/register" style={{ color: 'var(--af-orange)', fontWeight: '600', textDecoration: 'none' }}>
                                        Créer un compte
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
