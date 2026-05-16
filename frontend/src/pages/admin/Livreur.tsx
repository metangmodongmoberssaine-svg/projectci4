import React, { useState, useEffect } from 'react';
import LivreurService from '../../services/LivreurService';
import { User } from '../../models/UserModel';
import { 
    FaUserPlus, FaSearch, FaMotorcycle, FaTrash, 
    FaPowerOff, FaEnvelope, FaPhone, FaCheckCircle, FaExclamationCircle,
    FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { IoMdRefresh } from 'react-icons/io';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Livreur() {
    const [livreurs, setLivreurs] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [feedback, setFeedback] = useState<{ type: 'success' | 'danger', msg: string } | null>(null);

    // --- États pour la Pagination ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const [formData, setFormData] = useState({
        nom: '', prenom: '', email: '', telephone: ''
    });

    useEffect(() => {
        AOS.init({ 
            duration: 800,
            once: true,
            easing: 'ease-out-quad'
        });
        fetchLivreurs(1, searchTerm);
    }, []);

    // Version corrigée pour exploiter proprement le pager du backend
    const fetchLivreurs = async (page = 1, search = '') => {
        setLoading(true);
        try {
            const res = await LivreurService.getAllLivreurs(page, search);
            
            // Sécurité : Fallback sur tableau vide si data est null/undefined
            const dataResult = res.data || [];
            setLivreurs(dataResult);
            
            // Synchronisation de la pagination avec le pager de CodeIgniter
            if (res.pager) {
                setCurrentPage(page);
                setTotalResults(res.pager.total ?? res.total ?? dataResult.length);
                setTotalPages(res.pager.pageCount ?? 1);
            } else {
                // Fallback si le backend n'a pas renvoyé le pager attendu
                setCurrentPage(page);
                setTotalResults(res.total ?? dataResult.length);
                setTotalPages(1);
            }
            
            setTimeout(() => AOS.refresh(), 100);
        } catch (err) {
            showFeedback('Erreur lors du chargement des livreurs', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const showFeedback = (msg: string, type: 'success' | 'danger') => {
        setFeedback({ msg, type });
        setTimeout(() => setFeedback(null), 5000);
    };

    const handleCreateLivreur = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await LivreurService.createLivreur(formData);
            if (res.status) {
                showFeedback(`Succès ! Accès envoyés à ${formData.email}`, 'success');
                setFormData({ nom: '', prenom: '', email: '', telephone: '' });
                fetchLivreurs(1, searchTerm);
            }
        } catch (err: any) {
            showFeedback('Erreur : Email ou téléphone déjà utilisé.', 'danger');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            await LivreurService.toggleStatus(id, !currentStatus);
            showFeedback('Statut mis à jour avec succès', 'success');
            fetchLivreurs(currentPage, searchTerm);
        } catch (err) { 
            showFeedback('Erreur lors de la mise à jour du statut', 'danger'); 
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce livreur ? Cette action est irréversible.")) return;
        try {
            await LivreurService.deleteLivreur(id);
            showFeedback('Livreur retiré de la flotte', 'success');
            fetchLivreurs(currentPage, searchTerm);
        } catch (err) { 
            showFeedback('Erreur lors de la suppression', 'danger'); 
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchLivreurs(newPage, searchTerm);
        }
    };

    return (
        <div className="container-fluid p-0 overflow-hidden">
            {/* Feedback Toast */}
            {feedback && (
                <div className="position-fixed top-0 start-50 translate-middle-x mt-4 p-3 shadow-lg text-white d-flex align-items-center gap-2"
                    style={{ 
                        zIndex: 9999, 
                        borderRadius: '12px', 
                        backgroundColor: feedback.type === 'success' ? '#2ecc71' : '#e74c3c',
                        minWidth: '300px'
                    }}
                    data-aos="fade-down">
                    {feedback.type === 'success' ? <FaCheckCircle size={20} /> : <FaExclamationCircle size={20} />}
                    <span className="fw-bold">{feedback.msg}</span>
                </div>
            )}

            {/* HEADER & FORMULAIRE D'AJOUT */}
            <div className="d-flex justify-content-between align-items-center mb-4" data-aos="fade-down">
                <div>
                    <h3 className="fw-bold text-af-black mb-1">Gestion des Livreurs</h3>
                    <p className="text-muted small">Administrez votre flotte et suivez vos agents de livraison</p>
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }} data-aos="fade-up" data-aos-delay="100">
                <div className="card-body p-4">
                    <form onSubmit={handleCreateLivreur} className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-muted">Nom de famille</label>
                            <input type="text" className="form-control bg-af-light border-0 py-2 shadow-none" placeholder="Nom" required
                                value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold text-muted">Prénom</label>
                            <input type="text" className="form-control bg-af-light border-0 py-2 shadow-none" placeholder="Prénom" required
                                value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-muted">Email Professionnel</label>
                            <input type="email" className="form-control bg-af-light border-0 py-2 shadow-none" placeholder="livreur@africafood.com" required
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold text-muted">Téléphone</label>
                            <input type="text" className="form-control bg-af-light border-0 py-2 shadow-none" placeholder="+237..." required
                                value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} />
                        </div>
                        <div className="col-md-2">
                            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm" disabled={submitting}>
                                {submitting ? <span className="spinner-border spinner-border-sm"></span> : <><FaUserPlus /> Ajouter</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* LISTE ET FILTRES */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px', overflow: 'hidden' }} data-aos="fade-up" data-aos-delay="200">
                <div className="card-body p-0">
                    <div className="p-3 border-bottom d-flex justify-content-between align-items-center gap-3 bg-white">
                        <div className="input-group border rounded-pill px-3 py-1 bg-af-light flex-grow-1" style={{ maxWidth: '400px' }}>
                            <span className="input-group-text bg-transparent border-0 text-muted">
                                <FaSearch size={16} />
                            </span>
                            <input 
                                type="text" 
                                className="form-control bg-transparent border-0 shadow-none" 
                                placeholder="Rechercher un livreur..." 
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); fetchLivreurs(1, e.target.value); }}
                            />
                        </div>
                        <button onClick={() => fetchLivreurs(currentPage, searchTerm)} className="btn btn-outline-secondary border-0 rounded-circle p-2" title="Actualiser">
                            <IoMdRefresh size={22} className={`text-af-orange ${loading ? 'fa-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-af-black text-white">
                                <tr>
                                    <th className="py-3 ps-4">Livreur</th>
                                    <th className="py-3">Contacts & Identifiants</th>
                                    <th className="py-3 text-center">État du Compte</th>
                                    <th className="py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && livreurs.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center py-5"><div className="spinner-border text-af-orange" role="status"></div></td></tr>
                                ) : livreurs.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center py-5 text-muted">Aucun agent de livraison trouvé.</td></tr>
                                ) : livreurs.map((l, index) => (
                                    <tr key={l.id} data-aos="fade-left" data-aos-delay={index * 50} data-aos-offset="0">
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="rounded-3 bg-af-light text-af-blue d-flex align-items-center justify-content-center border shadow-sm" style={{ width: '45px', height: '45px' }}>
                                                    <FaMotorcycle size={20} />
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-af-black">{l.nom} {l.prenom}</div>
                                                    <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>Agent #AF-{l.id}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="small text-af-black mb-1 d-flex align-items-center gap-2">
                                                <FaEnvelope className="text-muted" size={12}/> {l.email}
                                            </div>
                                            <div className="small text-af-black d-flex align-items-center gap-2">
                                                <FaPhone className="text-muted" size={12}/> {l.telephone}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className={`badge rounded-pill px-3 py-2 ${l.is_actif ? 'bg-light text-success' : 'bg-light text-danger'}`} style={{ fontSize: '0.75rem' }}>
                                                {l.is_actif ? '● OPÉRATIONNEL' : '● BLOQUÉ'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-2">
                                                <button 
                                                    onClick={() => toggleStatus(l.id!, l.is_actif)} 
                                                    className={`btn btn-sm ${l.is_actif ? 'btn-light text-danger' : 'btn-light text-success'} rounded-pill px-3 shadow-sm`}
                                                    title={l.is_actif ? "Désactiver" : "Activer"}
                                                >
                                                    <FaPowerOff className="me-1" /> {l.is_actif ? 'Suspendre' : 'Activer'}
                                                </button>
                                                <button onClick={() => handleDelete(l.id!)} className="btn btn-sm btn-light text-danger rounded-pill px-3 shadow-sm">
                                                    <FaTrash size={14} className="me-1" /> Supprimer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* --- MENU DE PAGINATION --- */}
                    {livreurs.length > 0 && (
                        <div className="p-3 border-top d-flex justify-content-between align-items-center bg-white flex-wrap gap-2">
                            <div className="text-muted small">
                                Affichage de la page <span className="fw-bold">{currentPage}</span> sur <span className="fw-bold">{totalPages}</span> ({totalResults} livreurs au total)
                            </div>
                            
                            <nav aria-label="Navigation de la liste des livreurs">
                                <ul className="pagination pagination-sm mb-0 gap-1">
                                    {/* Bouton Précédent */}
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button 
                                            className="page-link rounded-circle border-0 d-flex align-items-center justify-content-center" 
                                            style={{ width: '32px', height: '32px' }}
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <FaChevronLeft size={12} />
                                        </button>
                                    </li>

                                    {/* Génération dynamique des numéros de pages */}
                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNum = index + 1;
                                        return (
                                            <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                                <button 
                                                    className="page-link rounded-circle border-0 d-flex align-items-center justify-content-center fw-bold"
                                                    style={{ 
                                                        width: '32px', 
                                                        height: '32px',
                                                        backgroundColor: currentPage === pageNum ? '#E67E22' : 'transparent',
                                                        color: currentPage === pageNum ? '#fff' : '#2C3E50'
                                                    }}
                                                    onClick={() => handlePageChange(pageNum)}
                                                >
                                                    {pageNum}
                                                </button>
                                            </li>
                                        );
                                    })}

                                    {/* Bouton Suivant */}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button 
                                            className="page-link rounded-circle border-0 d-flex align-items-center justify-content-center" 
                                            style={{ width: '32px', height: '32px' }}
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <FaChevronRight size={12} />
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}