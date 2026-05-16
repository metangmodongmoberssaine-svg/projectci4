import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdRefresh, 
  MdSearch, 
  MdCategory,
  MdSave
} from 'react-icons/md';
import CategorieService from '../../../services/CategorieService';
import { Categorie } from '../../../models/CategorieModel';

export default function CategoriesContent() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // États pour la gestion du formulaire (Ajout/Modification)
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Categorie>>({
    libelle: '',
    description: ''
  });

  // Initialisation AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-quad',
    });
  }, []);

  // Chargement des données
  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await CategorieService.getAll();
      const data = Array.isArray(response) ? response : (response as any).categories || [];
      setCategories(data);
      // Rafraîchir AOS après le rendu des données
      setTimeout(() => AOS.refresh(), 100);
    } catch (error) {
      console.error("Erreur chargement catégories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // --- LOGIQUE ACTIONS ---

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentCategory({ libelle: '', description: '' });
    setShowModal(true);
  };

  const handleOpenEditModal = (cat: Categorie) => {
    setIsEditing(true);
    setCurrentCategory(cat);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      try {
        await CategorieService.delete(id);
        setCategories(categories.filter(c => c.id !== id));
      } catch (error) {
        alert("Impossible de supprimer cette catégorie.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing && currentCategory.id) {
        await CategorieService.update(currentCategory.id, currentCategory);
      } else {
        await CategorieService.create(currentCategory);
      }
      setShowModal(false);
      loadCategories();
    } catch (error) {
      alert("Erreur lors de l'enregistrement des données.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.libelle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid p-0 overflow-hidden">
      
      {/* HEADER */}
      <div 
        className="d-flex justify-content-between align-items-center mb-4"
        data-aos="fade-down"
      >
        <div>
          <h3 className="fw-bold text-af-black mb-1">Gestion des Catégories</h3>
          <p className="text-muted small">Organisez les produits de la plateforme AfricaFood</p>
        </div>
        <button 
          className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
          style={{ height: '45px', borderRadius: '12px' }}
          onClick={handleOpenAddModal}
        >
          <MdAdd size={22} />
          <span className="fw-bold">Nouvelle Catégorie</span>
        </button>
      </div>

      {/* BARRE D'ACTIONS */}
      <div 
        className="card border-0 shadow-sm mb-4" 
        style={{ borderRadius: 'var(--af-border-radius)' }}
        data-aos="fade-up"
        data-aos-delay="100"
      >
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="input-group border rounded-pill px-3 py-1 bg-af-light">
                <span className="input-group-text bg-transparent border-0 text-muted">
                  <MdSearch size={20} />
                </span>
                <input 
                  type="text" 
                  className="form-control bg-transparent border-0 shadow-none" 
                  placeholder="Rechercher une catégorie..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <button 
                className="btn btn-outline-secondary border-0 rounded-circle p-2" 
                onClick={loadCategories}
                title="Actualiser"
              >
                <MdRefresh size={24} className="text-af-orange" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLEAU */}
      <div 
        className="card border-0 shadow-sm" 
        style={{ borderRadius: 'var(--af-border-radius)', overflow: 'hidden' }}
        data-aos="fade-up"
        data-aos-delay="200"
      >
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-af-black text-white">
              <tr>
                <th className="py-3 ps-4" style={{ width: '80px' }}>ID</th>
                <th className="py-3">Libellé</th>
                <th className="py-3">Description</th>
                <th className="py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-5">
                    <div className="spinner-border text-af-orange" role="status"></div>
                  </td>
                </tr>
              ) : filteredCategories.map((cat, index) => (
                <tr 
                  key={cat.id}
                  data-aos="fade-left"
                  data-aos-delay={index * 50}
                  data-aos-offset="0"
                >
                  <td className="ps-4 fw-bold text-muted">#{cat.id}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="rounded-3 bg-af-light d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', color: 'var(--af-orange)' }}>
                        <MdCategory size={20} />
                      </div>
                      <span className="fw-bold text-af-black">{cat.libelle}</span>
                    </div>
                  </td>
                  <td>
                    <small className="text-muted">
                      {cat.description || "Aucune description fournie."}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <button className="btn btn-sm btn-light text-primary rounded-pill px-3 shadow-sm" onClick={() => handleOpenEditModal(cat)}>
                        <MdEdit size={16} className="me-1" /> Modifier
                      </button>
                      <button className="btn btn-sm btn-light text-danger rounded-pill px-3 shadow-sm" onClick={() => cat.id && handleDelete(cat.id)}>
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

      {/* MODAL AJOUT/MODIF */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div 
              className="modal-content border-0 shadow-lg" 
              style={{ borderRadius: '20px' }}
              data-aos="zoom-in"
              data-aos-duration="400"
            >
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold pt-2 px-2">
                  {isEditing ? "Modifier la catégorie" : "Nouvelle catégorie"}
                </h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Libellé</label>
                    <input 
                      type="text" 
                      className="form-control bg-light border-0 py-2" 
                      required
                      value={currentCategory.libelle || ''}
                      onChange={(e) => setCurrentCategory({...currentCategory, libelle: e.target.value})}
                      placeholder="Ex: Plats de résistance"
                    />
                  </div>
                  <div className="mb-0">
                    <label className="form-label small fw-bold">Description (Optionnel)</label>
                    <textarea 
                      className="form-control bg-light border-0 py-2" 
                      rows={3}
                      value={currentCategory.description || ''}
                      onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})}
                      placeholder="Décrivez brièvement cette catégorie..."
                    ></textarea>
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
                    <span className="fw-bold">Enregistrer</span>
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