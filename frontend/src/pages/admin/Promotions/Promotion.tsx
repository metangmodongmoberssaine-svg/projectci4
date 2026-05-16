import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { 
  MdAdd, 
  MdDelete, 
  MdRefresh, 
  MdSearch, 
  MdLocalOffer,
  MdSave,
  MdDateRange,
  MdToggleOn,
  MdToggleOff,
  MdRestaurant,
  MdEdit
} from 'react-icons/md';
import { PromotionService } from '../../../services/PromotionService';
import { Promotion } from '../../../models/PromotionsModel';
import { RepasService } from '../../../services/RepasService';
import { Repas } from '../../../models/RepasModel';

export default function PromotionContent() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Pour remplir les sélections réelles du formulaire depuis la BD
  const [repas, setRepas] = useState<Repas[]>([]);

  // États du Formulaire / Modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [submitting, setSubmitting] = useState(false);
  
  // 'globale' = Tous les repas, 'repas' = Un repas spécifique
  const [targetType, setTargetType] = useState<'globale' | 'repas'>('globale');
  
  const [formData, setFormData] = useState<Partial<Promotion>>({
    id: undefined,
    type: 'pourcentage',
    new_amount: 0,
    date_debut: '',
    date_fin: '',
    id_repas: null,
    id_categorie: null
  });

  // Initialisation des animations et chargement des dépendances
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-quad',
    });
    
    fetchFormDependencies();
  }, []);

  // Chargement des repas depuis la BD
  const fetchFormDependencies = async () => {
    try {
      const repasRes = await RepasService.getAll();
      if (repasRes && repasRes.status && Array.isArray(repasRes.data)) {
        setRepas(repasRes.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des repas :", error);
    }
  };

  // Chargement des promotions avec filtres
  const loadPromotions = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== "") params.is_actif = statusFilter;
      
      const response = await PromotionService.getAll(params);
      const data = response && response.status && Array.isArray(response.data) ? response.data : [];
      setPromotions(data);
      
      setTimeout(() => AOS.refresh(), 100);
    } catch (error) {
      console.error("Erreur lors du chargement des promotions :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, [statusFilter]);

  // Forçage du type pourcentage si la cible change
  useEffect(() => {
    if (targetType === 'globale') {
      setFormData(prev => ({ ...prev, type: 'pourcentage', id_repas: null }));
    }
  }, [targetType]);

  // --- ACTIONS ---

  const handleOpenAddModal = () => {
    setModalMode('create');
    setTargetType('globale');
    setFormData({
      type: 'pourcentage',
      new_amount: 0,
      date_debut: new Date().toISOString().split('T')[0],
      date_fin: '',
      id_repas: null,
      id_categorie: null
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (promo: Promotion) => {
    setModalMode('edit');
    setTargetType(promo.id_repas ? 'repas' : 'globale');
    setFormData({
      id: promo.id,
      type: 'pourcentage',
      new_amount: promo.new_amount,
      date_debut: promo.date_debut,
      date_fin: promo.date_fin,
      id_repas: promo.id_repas,
      id_categorie: promo.id_categorie
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await PromotionService.toggleStatus(id);
      setPromotions(promotions.map(p => p.id === id ? { ...p, is_actif: p.is_actif === 1 ? 0 : 1 } : p));
    } catch (error) {
      alert("Erreur lors du changement de statut.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet événement promotionnel ?")) {
      try {
        await PromotionService.delete(id);
        setPromotions(promotions.filter(p => p.id !== id));
      } catch (error) {
        alert("Impossible de supprimer cette promotion.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const finalData = { ...formData, type: 'pourcentage' as const };
    if (targetType === 'globale') {
      finalData.id_repas = null;
    }
    finalData.id_categorie = null; 

    const { id, ...cleanData } = finalData;

    try {
      if (modalMode === 'edit' && formData.id) {
        await PromotionService.update(formData.id, cleanData);
      } else {
        await PromotionService.create(cleanData);
      }
      setShowModal(false);
      loadPromotions();
    } catch (error) {
      alert(`Erreur lors de la ${modalMode === 'edit' ? 'modification' : 'création'} de la promotion.`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPromotions = promotions.filter(p => {
    const search = searchTerm.toLowerCase();
    const repasMatch = p.repas_nom?.toLowerCase().includes(search);
    const globalMatch = "tous les repas".includes(search) && !p.id_repas;
    return repasMatch || globalMatch || search === "";
  });

  return (
    <div className="container-fluid p-0 overflow-hidden">
      
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4" data-aos="fade-down">
        <div>
          <h3 className="fw-bold text-af-black mb-1">Événements Promotionnels</h3>
          <p className="text-muted small">Planifiez des baisses de prix en pourcentage pour votre menu</p>
        </div>
        <button 
          className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
          style={{ height: '45px' }}
          onClick={handleOpenAddModal}
        >
          <MdAdd size={22} />
          <span className="fw-bold">Créer un événement</span>
        </button>
      </div>

      {/* BARRE DE FILTRES */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 'var(--af-border-radius)' }} data-aos="fade-up" data-aos-delay="100">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <div className="input-group border rounded-pill px-3 py-1 bg-af-light">
                <span className="input-group-text bg-transparent border-0 text-muted">
                  <MdSearch size={20} />
                </span>
                <input 
                  type="text" 
                  className="form-control bg-transparent border-0 shadow-none" 
                  placeholder="Rechercher par repas..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select 
                className="form-select border rounded-pill bg-af-light px-3"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="1">Actifs (En cours)</option>
                <option value="0">Inactifs</option>
              </select>
            </div>
            <div className="col-md-3 text-end">
              <button className="btn btn-outline-secondary border-0 rounded-circle p-2" onClick={loadPromotions} title="Actualiser">
                <MdRefresh size={24} className="text-af-orange" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 'var(--af-border-radius)', overflow: 'hidden' }} data-aos="fade-up" data-aos-delay="200">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-af-black text-white">
              <tr>
                <th className="py-3 ps-4">Cible de l'offre</th>
                <th className="py-3">Type</th>
                <th className="py-3">Valeur (%)</th>
                <th className="py-3">Période de validité</th>
                <th className="py-3 text-center">Statut</th>
                <th className="py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="spinner-border text-af-orange" role="status"></div>
                  </td>
                </tr>
              ) : filteredPromotions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">Aucune promotion programmée.</td>
                </tr>
              ) : filteredPromotions.map((promo, index) => (
                <tr key={promo.id} data-aos="fade-left" data-aos-delay={index * 50} data-aos-offset="0">
                  <td className="ps-4">
                    <div className="d-flex align-items-center">
                      {promo.id_repas ? (
                        <>
                          <div className="rounded-3 bg-light text-primary d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                            <MdRestaurant size={20} />
                          </div>
                          <div>
                            <span className="fw-bold d-block text-af-black">{promo.repas_nom}</span>
                            <small className="text-muted text-uppercase" style={{ fontSize: '10px' }}>Plat unique</small>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="rounded-3 bg-af-light text-af-orange d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                            <MdLocalOffer size={20} />
                          </div>
                          <div>
                            <span className="fw-bold d-block text-af-orange">Tous les repas</span>
                            <small className="text-muted text-uppercase" style={{ fontSize: '10px' }}>Offre globale</small>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="badge rounded-pill px-3 py-2 bg-light text-success">
                      Baisse en %
                    </span>
                  </td>
                  <td>
                    <span className="fw-bold text-af-black">
                      {promo.new_amount} %
                    </span>
                  </td>
                  <td>
                    <div className="small text-af-black d-flex align-items-center gap-1">
                      <MdDateRange className="text-muted" />
                      <span>Du <b>{promo.date_debut}</b> au <b>{promo.date_fin}</b></span>
                    </div>
                  </td>
                  <td className="text-center">
                    <button className="btn btn-link p-0 border-0 shadow-none" onClick={() => handleToggleStatus(promo.id)}>
                      {promo.is_actif === 1 ? (
                        <MdToggleOn size={36} className="text-af-green" />
                      ) : (
                        <MdToggleOff size={36} className="text-af-gray" />
                      )}
                    </button>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <button className="btn btn-sm btn-light text-primary rounded-pill px-3 shadow-sm" onClick={() => handleOpenEditModal(promo)}>
                        <MdEdit size={16} className="me-1" /> Modifier
                      </button>
                      <button className="btn btn-sm btn-light text-danger rounded-pill px-3 shadow-sm" onClick={() => handleDelete(promo.id)}>
                        <MdDelete size={16} className="me-1" /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold pt-2 px-2 text-af-black">
                  {modalMode === 'edit' ? "Modifier l'événement" : "Planifier un événement"}
                </h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowModal(false)}></button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  
                  {/* CIBLE */}
                  <div className="mb-4">
                    <label className="form-label small fw-bold text-muted">Cible de la promotion</label>
                    <div className="d-flex gap-2 bg-af-light p-1 rounded-3">
                      <button 
                        type="button" 
                        className={`btn btn-sm flex-fill rounded-2 border-0 py-2 ${targetType === 'globale' ? 'bg-white text-af-orange fw-bold shadow-sm' : 'text-muted'}`}
                        onClick={() => setTargetType('globale')}
                      >
                        Tous les repas
                      </button>
                      <button 
                        type="button" 
                        className={`btn btn-sm flex-fill rounded-2 border-0 py-2 ${targetType === 'repas' ? 'bg-white text-af-blue fw-bold shadow-sm' : 'text-muted'}`}
                        onClick={() => setTargetType('repas')}
                      >
                        Un repas spécifique
                      </button>
                    </div>
                  </div>

                  {targetType === 'repas' && (
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Sélectionner le plat</label>
                      <select 
                        className="form-select bg-light border-0 py-2" 
                        required
                        value={formData.id_repas || ""}
                        onChange={(e) => setFormData({ ...formData, id_repas: Number(e.target.value) })}
                      >
                        <option value="">-- Choisir un repas --</option>
                        {repas.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.nom} ({r.prix} FCFA)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* VALEUR POURCENTAGE */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Valeur de la réduction (%)</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">%</span>
                      <input 
                        type="number" 
                        step="any"
                        min="0.01"
                        max="100"
                        className="form-control bg-light border-0 py-2"
                        placeholder="Ex: 15"
                        required
                        value={formData.new_amount || ""}
                        onChange={(e) => setFormData({ ...formData, new_amount: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* DATES */}
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label small fw-bold">Date de début</label>
                      <input 
                        type="date" 
                        className="form-control bg-light border-0 py-2" 
                        required
                        value={formData.date_debut}
                        onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                      />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label small fw-bold">Date de fin</label>
                      <input 
                        type="date" 
                        className="form-control bg-light border-0 py-2" 
                        required
                        value={formData.date_fin}
                        onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                      />
                    </div>
                  </div>

                </div>

                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Annuler</button>
                  <button 
                    type="submit" 
                    className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2 shadow"
                    disabled={submitting}
                  >
                    {submitting ? <span className="spinner-border spinner-border-sm"></span> : <MdSave size={18} />}
                    <span className="fw-bold">
                      {modalMode === 'edit' ? "Enregistrer" : "Lancer l'offre"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}