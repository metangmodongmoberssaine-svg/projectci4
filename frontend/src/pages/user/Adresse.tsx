import React, { useEffect, useState } from 'react';
import AdresseService from '../../services/AdresseService';
import { Adresse as AdresseType } from '../../models/AdresseModel';

export default function Adresse() {
    // États pour la liste et la pagination
    const [adresses, setAdresses] = useState<AdresseType[]>([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        hasMore: false
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

    // États pour le formulaire
    const [formData, setFormData] = useState({
        libelle: '',
        adresse: '',
        ville: 'Douala',
        latitude: null as number | null,
        longitude: null as number | null
    });
    const [geoLoading, setGeoLoading] = useState(false);

    // Charger les adresses au montage et au changement de page
    useEffect(() => {
        fetchAdresses(pagination.currentPage);
    }, [pagination.currentPage]);

    const fetchAdresses = async (page: number) => {
        setLoading(true);
        try {
            const res = await AdresseService.getAdresses(page, 5); // 5 adresses par page
            if (res.status) {
                setAdresses(res.data);
                setPagination({
                    currentPage: res.pagination.current_page,
                    totalPages: res.pagination.total_pages,
                    hasMore: res.pagination.has_more
                });
            }
        } catch (err) {
            showAlert('danger', 'Impossible de charger vos adresses.');
        } finally {
            setLoading(false);
        }
    };

    // Gestion de la géolocalisation native du navigateur
    const handleGeolocation = () => {
        if (!navigator.geolocation) {
            showAlert('danger', 'La géolocalisation n’est pas supportée par votre navigateur.');
            return;
        }

        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }));
                showAlert('success', '📍 Position GPS récupérée avec succès !');
                setGeoLoading(false);
            },
            (error) => {
                console.error(error);
                showAlert('danger', 'Autorisation refusée ou signal GPS introuvable.');
                setGeoLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Soumission du formulaire d'ajout
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await AdresseService.createAdresse({
                libelle: formData.libelle,
                adresse: formData.adresse,
                ville: formData.ville,
                latitude: formData.latitude,
                longitude: formData.longitude,
                is_default: 0 // Le backend gère la mise à 1 si c'est la première adresse
            });
            if (res.status) {
                showAlert('success', 'Adresse ajoutée avec succès.');
                setFormData({ libelle: '', adresse: '', ville: 'Douala', latitude: null, longitude: null });
                fetchAdresses(1); // Revenir à la page 1 pour voir l'adresse
            }
        } catch (err: any) {
            showAlert('danger', 'Erreur lors de l’ajout. Vérifiez vos informations.');
        }
    };

    // Définir une adresse par défaut
    const handleSetDefault = async (id: number) => {
        try {
            const res = await AdresseService.setDefaultAdresse(id);
            if (res.status) {
                showAlert('success', 'Adresse par défaut mise à jour.');
                fetchAdresses(pagination.currentPage);
            }
        } catch (err) {
            showAlert('danger', 'Erreur lors de la modification.');
        }
    };

    // Supprimer une adresse
    const handleDelete = async (id: number) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cette adresse ?')) return;
        try {
            const res = await AdresseService.deleteAdresse(id);
            if (res.status) {
                showAlert('success', 'Adresse supprimée.');
                fetchAdresses(1);
            }
        } catch (err: any) {
            showAlert('danger', 'Impossible de supprimer cette adresse (ex: Adresse par défaut).');
        }
    };

    // Utilitaire d'affichage des alertes
    const showAlert = (type: 'success' | 'danger', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    return (
        <div style={styles.container}>
            <h2 style={{ color: 'var(--af-black)', marginBottom: '20px' }}>📍 Gestion de vos adresses</h2>

            {message && (
                <div style={{ ...styles.alert, backgroundColor: message.type === 'success' ? 'var(--af-green)' : 'var(--af-red)' }}>
                    {message.text}
                </div>
            )}

            <div style={styles.grid}>
                {/* FORMULAIRE D'AJOUT */}
                <div style={styles.card}>
                    <h3 style={{ color: 'var(--af-orange)', marginBottom: '15px' }}>Ajouter une adresse</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Nom de l'emplacement (Libellé)</label>
                            <input 
                                type="text" 
                                placeholder="Ex: Maison, Bureau, Chez Maman..." 
                                style={styles.input}
                                value={formData.libelle}
                                onChange={(e) => setFormData({...formData, libelle: e.target.value})}
                                required 
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Adresse exacte (Indications à Douala)</label>
                            <textarea 
                                placeholder="Ex: Bonamoussadi, face entrée camp de Gaulle, portail vert" 
                                style={{ ...styles.input, height: '80px', resize: 'none' }}
                                value={formData.adresse}
                                onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                                required 
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Ville</label>
                            <input 
                                type="text" 
                                style={styles.input}
                                value={formData.ville}
                                onChange={(e) => setFormData({...formData, ville: e.target.value})}
                                required 
                            />
                        </div>

                        {/* BOUTON GÉOLOCALISATION */}
                        <div style={{ marginBottom: '20px' }}>
                            <button 
                                type="button" 
                                onClick={handleGeolocation} 
                                style={{ ...styles.btn, backgroundColor: 'var(--af-blue)' }}
                                disabled={geoLoading}
                            >
                                {geoLoading ? 'Recherche du signal GPS...' : '📍 Utiliser ma position actuelle'}
                            </button>
                            {formData.latitude && (
                                <p style={styles.geoBadge}>
                                    Coordonnées prêtes : {formData.latitude.toFixed(4)}, {formData.longitude?.toFixed(4)}
                                </p>
                            )}
                        </div>

                        <button type="submit" style={{ ...styles.btn, backgroundColor: 'var(--af-orange)' }}>
                            Enregistrer l'adresse
                        </button>
                    </form>
                </div>

                {/* LISTE DES ADRESSES EXISTANTES */}
                <div style={styles.card}>
                    <h3 style={{ color: 'var(--af-black)', marginBottom: '15px' }}>Vos adresses enregistrées</h3>
                    
                    {loading ? (
                        <p>Chargement de vos adresses...</p>
                    ) : adresses.length === 0 ? (
                        <p style={{ color: 'var(--af-gray)' }}>Aucune adresse enregistrée pour le moment.</p>
                    ) : (
                        <div>
                            {adresses.map((item) => (
                                <div key={item.id} style={{
                                    ...styles.adresseItem,
                                    borderLeft: item.is_default ? '5px solid var(--af-green)' : '5px solid var(--af-gray)'
                                }}>
                                    <div>
                                        <strong>{item.libelle}</strong> {item.is_default === 1 && <span style={styles.badgeDefault}>Par défaut</span>}
                                        <p style={{ margin: '5px 0', fontSize: '14px', color: 'var(--af-black)' }}>{item.adresse}, {item.ville}</p>
                                        {item.latitude && (
                                            <small style={{ color: 'var(--af-blue)' }}>📍 Géolocalisation enregistrée</small>
                                        )}
                                    </div>
                                    
                                    <div style={styles.actionBlock}>
                                        {item.is_default === 0 && (
                                            <button onClick={() => handleSetDefault(item.id!)} style={styles.btnAction}>
                                                Définir par défaut
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(item.id!)} style={{ ...styles.btnAction, color: 'var(--af-red)' }}>
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* CONTROLES PAGINATION */}
                            <div style={styles.paginationBlock}>
                                <button 
                                    disabled={pagination.currentPage === 1}
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                    style={styles.btnPage}
                                >
                                    Précédent
                                </button>
                                <span style={{ alignSelf: 'center' }}>Page {pagination.currentPage} sur {pagination.totalPages}</span>
                                <button 
                                    disabled={!pagination.hasMore}
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                    style={styles.btnPage}
                                >
                                    Suivant
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Styles inline utilisant la charte graphique AfricaFood
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: '20px',
        backgroundColor: 'var(--af-light)',
        minHeight: '100vh'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        alignItems: 'start' // FIX : Remplacement de alignment par alignItems
    },
    card: {
        backgroundColor: 'var(--af-white)',
        padding: '20px',
        borderRadius: 'var(--af-border-radius)',
        boxShadow: 'var(--af-shadow)'
    },
    formGroup: {
        marginBottom: '15px'
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: 'var(--af-black)',
        fontSize: '14px'
    },
    input: {
        width: '100%',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #BDC3C7',
        boxSizing: 'border-box'
    },
    btn: {
        width: '100%',
        padding: '12px',
        color: 'var(--af-white)',
        border: 'none',
        borderRadius: 'var(--af-border-radius)',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.3s ease'
    },
    geoBadge: {
        fontSize: '12px',
        color: 'var(--af-green)',
        marginTop: '5px',
        fontWeight: 'bold'
    },
    adresseItem: {
        backgroundColor: '#FCFDFD',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    },
    badgeDefault: {
        backgroundColor: 'var(--af-green)',
        color: 'var(--af-white)',
        fontSize: '11px',
        padding: '3px 8px',
        borderRadius: '20px',
        marginLeft: '10px',
        fontWeight: 'bold'
    },
    actionBlock: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    btnAction: {
        background: 'none',
        border: 'none',
        color: 'var(--af-blue)',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        textAlign: 'right'
    },
    alert: {
        padding: '12px',
        color: 'var(--af-white)',
        borderRadius: '8px',
        marginBottom: '20px',
        fontWeight: 'bold'
    },
    paginationBlock: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '25px'
    },
    btnPage: {
        padding: '8px 15px',
        borderRadius: '6px',
        border: '1px solid #BDC3C7',
        backgroundColor: 'var(--af-white)',
        cursor: 'pointer'
    }
};