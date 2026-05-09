import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import AuthService from '../services/AuthService';

export default function LoginContent() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loggedIn, setLoggedIn] = useState(false);

    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {
        // Animation plus douce pour la connexion
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
            if (response.status) {
                setLoggedIn(true);
                // On ne redirige pas encore vers un dashboard car il n'existe pas
                console.log("Token stocké :", localStorage.getItem('auth_token'));
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Identifiants incorrects ou compte non vérifié.");
        } finally {
            setLoading(false);
        }
    };

    if (loggedIn) {
        return (
            <div className="container py-5 text-center" data-aos="zoom-in">
                <div className="alert alert-success p-5 shadow">
                    <h2 className="mb-3">🎉 Connexion réussie !</h2>
                    <p>Bravo, vous êtes maintenant connecté à <strong>AfricaFood</strong>.</p>
                    <p className="text-muted small">Le dashboard sera bientôt disponible ici.</p>
                    <button className="btn btn-outline-success mt-3" onClick={() => setLoggedIn(false)}>
                        Retour au login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-5" data-aos="fade-up">
                    <div className="card shadow-lg border-0" style={{ borderRadius: 'var(--af-border-radius)' }}>
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <h2 style={{ color: 'var(--af-primary)', fontWeight: 'bold' }}>Connexion</h2>
                                <p className="text-muted">Heureux de vous revoir !</p>
                            </div>

                            {error && <div className="alert alert-danger mb-4" data-aos="shake">{error}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        className="form-control" 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="votre@email.com"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Mot de passe</label>
                                    <input 
                                        type="password" 
                                        name="password" 
                                        className="form-control" 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="********"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn w-100 py-2 mb-3" 
                                    disabled={loading}
                                    style={{ 
                                        backgroundColor: 'var(--af-primary)', 
                                        color: 'white',
                                        fontWeight: 'bold',
                                        borderRadius: 'var(--af-border-radius)'
                                    }}
                                >
                                    {loading ? 'Connexion...' : 'Se connecter'}
                                </button>
                            </form>

                            <div className="text-center mt-4">
                                <p className="mb-0 text-muted">
                                    Pas encore de compte ?{' '}
                                    <Link to="/register" style={{ color: 'var(--af-secondary)', fontWeight: '600', textDecoration: 'none' }}>
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