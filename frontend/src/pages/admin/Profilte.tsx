import React, { useState } from 'react';
import AuthService from '../../services/AuthService';

export default function Profile() {
    const [user, setUser] = useState(AuthService.getCurrentUser());
    const [loading, setLoading] = useState(false);

    // États pour les formulaires
    const [profileData, setProfileData] = useState({
        nom: user?.nom || '',
        prenom: user?.prenom || '',
        telephone: user?.telephone || '',
        email: user?.email || '',
        ville: user?.ville || ''
    });

    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });

    // Mise à jour des infos de base
    // Typage de 'e' en React.FormEvent
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await AuthService.updateProfile(profileData);
            if (res.status) {
                alert('Profil mis à jour avec succès !');
                await AuthService.getProfile();
                setUser(AuthService.getCurrentUser());
            }
        } catch (err: any) { // Typage de 'err' pour éviter le type 'unknown'
            alert('Erreur lors de la mise à jour du profil.');
        } finally {
            setLoading(false);
        }
    };

    // Mise à jour du mot de passe
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            return alert('Les nouveaux mots de passe ne correspondent pas.');
        }

        setLoading(true);
        try {
            const res = await AuthService.changePassword(passwordData);
            if (res.status) {
                alert('Mot de passe modifié avec succès !');
                setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Erreur technique lors du changement de mot de passe.';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <h2 className="text-af-black mb-4">Mon Profil <span className="text-af-orange">AfricaFood</span></h2>

            <div className="row g-4">
                {/* Section Informations Personnelles */}
                <div className="col-md-7">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: 'var(--af-border-radius)' }}>
                        <div className="card-body p-4">
                            <h5 className="card-title mb-4 text-af-green">Informations personnelles</h5>
                            <form onSubmit={handleUpdateProfile}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label small text-af-gray">Nom</label>
                                        <input 
                                            type="text" className="form-control" 
                                            value={profileData.nom} 
                                            onChange={(e) => setProfileData({...profileData, nom: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small text-af-gray">Prénom</label>
                                        <input 
                                            type="text" className="form-control" 
                                            value={profileData.prenom}
                                            onChange={(e) => setProfileData({...profileData, prenom: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label small text-af-gray">Email</label>
                                        <input type="email" className="form-control bg-light" value={profileData.email} disabled />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small text-af-gray">Téléphone</label>
                                        <input 
                                            type="text" className="form-control" 
                                            value={profileData.telephone}
                                            onChange={(e) => setProfileData({...profileData, telephone: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small text-af-gray">Ville</label>
                                        <input 
                                            type="text" className="form-control" 
                                            value={profileData.ville}
                                            onChange={(e) => setProfileData({...profileData, ville: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary mt-4 w-100" disabled={loading}>
                                    {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Section Sécurité / Mot de passe */}
                <div className="col-md-5">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: 'var(--af-border-radius)' }}>
                        <div className="card-body p-4">
                            <h5 className="card-title mb-4 text-af-red">Sécurité du compte</h5>
                            <form onSubmit={handleChangePassword}>
                                <div className="mb-3">
                                    <label className="form-label small text-af-gray">Ancien mot de passe</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        // Correction : 'size' sur un input doit être un nombre, mais il est inutile ici car on utilise Bootstrap 'form-control'. On le retire.
                                        value={passwordData.old_password}
                                        onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                                        required
                                    />
                                </div>
                                <hr className="text-af-light" />
                                <div className="mb-3">
                                    <label className="form-label small text-af-gray">Nouveau mot de passe</label>
                                    <input 
                                        type="password" className="form-control" 
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small text-af-gray">Confirmer le nouveau mot de passe</label>
                                    <input 
                                        type="password" className="form-control" 
                                        value={passwordData.confirm_password}
                                        onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-outline-danger w-100 mt-2" disabled={loading}>
                                    Mettre à jour le mot de passe
                                </button>
                            </form>
                        </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-af-light text-center" style={{ borderRadius: 'var(--af-border-radius)' }}>
                        <small className="text-af-gray d-block mb-1">Statut du compte</small>
                        <span className={`badge ${user?.is_verified ? 'bg-af-green' : 'bg-af-orange'}`}>
                            {user?.is_verified ? '✓ Compte Vérifié' : 'Compte non vérifié'}
                        </span>
                        <div className="mt-2 small text-af-blue">Rôle : <strong>{user?.role?.toUpperCase()}</strong></div>
                    </div>
                </div>
            </div>
        </div>
    );
}