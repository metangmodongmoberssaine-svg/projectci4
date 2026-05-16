import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Repas as IRepas } from "../../../models/RepasModel";
import { RepasService } from "../../../services/RepasService";
import CategorieService from "../../../services/CategorieService";

// Importations des sous-composants dédiés
import AddRepas from "./AddRepas";
import EditRepas from "./EditRepas";

interface CategorieSimple {
  id: number;
  libelle: string;
}

export default function Repas() {
  // Source de données unique : contient TOUS les repas sans distinction
  const [repasList, setRepasList] = useState<IRepas[]>([]);
  const [categories, setCategories] = useState<CategorieSimple[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // États de filtrage indépendants
  const [selectedCategorie, setSelectedCategorie] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>(""); // "" = Tous

  // États de visibilité pour les sous-composants dédiés
  const [showAddView, setShowAddView] = useState<boolean>(false);
  const [repasToEdit, setRepasToEdit] = useState<IRepas | null>(null);

  // État de suppression
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [repasToDelete, setRepasToDelete] = useState<IRepas | null>(null);

  const URL_BACKEND = import.meta.env.VITE_BACKEND_URL_IMAGE;

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    fetchCategories();
    fetchRepas(); // On charge TOUS les repas au démarrage
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await CategorieService.getAll();
      const extracted = Array.isArray(res) ? res : (res as any).categories || [];
      setCategories(extracted);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRepas = async () => {
    setLoading(true);
    try {
      const res = await RepasService.getAll();
      if (res.status && res.data) {
        console.log("[LOG] Repas récupérés de l'API :", res.data);
        setRepasList(res.data);
        setTimeout(() => { AOS.refresh(); }, 100);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategorie(e.target.value);
    setTimeout(() => { AOS.refresh(); }, 50);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("[LOG] Statut sélectionné dans le filtre <select> :", e.target.value);
    setSelectedStatus(e.target.value);
    setTimeout(() => { AOS.refresh(); }, 50);
  };

  const handleRefreshList = () => {
    fetchRepas();
    setShowAddView(false);
    setRepasToEdit(null);
  };

  const handleConfirmDelete = async () => {
    if (!repasToDelete?.id) return;
    try {
      const res = await RepasService.delete(repasToDelete.id);
      if (res.status) {
        setRepasList((prev) => prev.filter((r) => r.id !== repasToDelete.id));
        setShowDeleteModal(false);
        setRepasToDelete(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- TRAITEMENT COMBINÉ DES FILTRES AVEC LOGS INTÉGRÉS ---
  const filteredRepasList = repasList.filter((repas) => {
    // 1. Filtrage par Catégorie
    if (selectedCategorie !== "") {
      if (String(repas.id_categorie) !== selectedCategorie) {
        return false;
      }
    }

    // 2. Filtrage par Statut
    if (selectedStatus !== "") {
      // Transformation propre pour comparaison historique
      const repasStatusClean = repas.status !== undefined && repas.status !== null ? String(repas.status).toLowerCase().trim() : "";
      const selectedStatusClean = selectedStatus.toLowerCase().trim();
      
      // LOGS INDIVIDUELS : Pour voir ce que l'application compare réellement pour chaque plat
      console.log(`[FILTRE STATUT] Nom du plat: "${repas.nom}" | Brute:`, repas.status, `| Nettoyée: "${repasStatusClean}" vs Filtre attendu: "${selectedStatusClean}"`);

      if (repasStatusClean !== selectedStatusClean) {
        return false;
      }
    }

    return true; 
  });

  console.log("[LOG] Nombre de repas après filtrage :", filteredRepasList.length);

  return (
    <div className="bg-af-light" style={{ padding: "24px", minHeight: "100vh", fontFamily: "sans-serif" }}>
      
      {/* --- EN-TÊTE --- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div data-aos="fade-right">
          <h2 className="text-af-black" style={{ margin: 0, fontWeight: 700 }}>Gestion de la Carte (Repas)</h2>
          <p style={{ color: "var(--af-gray)", margin: "4px 0 0 0" }}>Gérez les spécialités culinaires d'AfricaFood</p>
        </div>
        <button
          className="btn-primary"
          data-aos="fade-left"
          style={{ padding: "10px 20px", color: "var(--af-white)", border: "none", cursor: "pointer", fontWeight: 600 }}
          onClick={() => setShowAddView(true)}
        >
          + Ajouter un repas
        </button>
      </div>

      {/* --- BARRE DE FILTRAGE MULTIPLE --- */}
      <div 
        data-aos="fade-up" 
        style={{ 
          backgroundColor: "var(--af-white)", 
          padding: "16px", 
          borderRadius: "var(--af-border-radius)", 
          boxShadow: "var(--af-shadow)", 
          marginBottom: "24px", 
          display: "flex", 
          flexWrap: "wrap",
          alignItems: "center", 
          gap: "24px" 
        }}
      >
        {/* Filtre Catégorie */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontWeight: 600, color: "var(--af-black)" }}>Catégorie :</span>
          <select value={selectedCategorie} onChange={handleCategoryChange} style={selectStyle}>
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>{cat.libelle}</option>
            ))}
          </select>
        </div>

        {/* Filtre Statut */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontWeight: 600, color: "var(--af-black)" }}>Statut :</span>
          <select value={selectedStatus} onChange={handleStatusChange} style={selectStyle}>
            <option value="">Tous les statuts</option>
            <option value="disponible">Disponible</option>
            <option value="indisponible">Indisponible</option>
          </select>
        </div>
      </div>

      {/* --- SOUS-COMPOSANTS (ADD / EDIT) --- */}
      {showAddView && (
        <AddRepas 
          onClose={() => setShowAddView(false)} 
          onSuccess={handleRefreshList} 
        />
      )}

      {repasToEdit && (
        <EditRepas 
          repas={repasToEdit} 
          onClose={() => setRepasToEdit(null)} 
          onSuccess={handleRefreshList} 
        />
      )}

      {/* --- MODAL DE SUPPRESSION --- */}
      {showDeleteModal && repasToDelete && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
          <div data-aos="zoom-in" data-aos-duration="300" style={{ backgroundColor: "var(--af-white)", padding: "28px", borderRadius: "var(--af-border-radius)", width: "420px", maxWidth: "90%", boxShadow: "0 10px 40px rgba(0,0,0,0.3)", textAlign: "center" }}>
            <h3 style={{ margin: "0 0 12px 0", color: "var(--af-black)", fontWeight: 700 }}>Supprimer ce repas ?</h3>
            <p style={{ color: "var(--af-gray)", fontSize: "15px", margin: "0 0 24px 0" }}>
              Êtes-vous sûr de vouloir retirer définitivement <strong style={{ color: "var(--af-black)" }}>{repasToDelete.nom}</strong> ?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button type="button" onClick={() => { setShowDeleteModal(false); setRepasToDelete(null); }} style={{ flex: 1, padding: "12px", borderRadius: "6px", border: "1px solid #ddd", background: "none", cursor: "pointer" }}>Annuler</button>
              <button type="button" onClick={handleConfirmDelete} style={{ flex: 1, padding: "12px", border: "none", backgroundColor: "var(--af-red)", color: "var(--af-white)", cursor: "pointer", fontWeight: 600 }}>Oui, supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* --- GRILLE DES REPAS FILTRÉS --- */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--af-gray)" }}>Chargement des repas...</div>
      ) : filteredRepasList.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--af-gray)", backgroundColor: "var(--af-white)", borderRadius: "var(--af-border-radius)" }}>Aucun repas trouvé avec ces critères.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
          {filteredRepasList.map((repas, index) => {
            const imageSrc = repas.photo ? `${URL_BACKEND}/${repas.photo}` : "https://via.placeholder.com/300x200?text=AfricaFood";
            const matchedCategory = categories.find((c) => c.id === Number(repas.id_categorie));
            const isDisponible = repas.status?.toLowerCase().trim() === "disponible";

            return (
              <div key={repas.id} data-aos="fade-up" data-aos-delay={(index % 4) * 100} style={{ backgroundColor: "var(--af-white)", borderRadius: "var(--af-border-radius)", overflow: "hidden", boxShadow: "var(--af-shadow)", display: "flex", flexDirection: "column" }}>
                <div style={{ height: "180px", position: "relative", backgroundColor: "#eaeaea" }}>
                  <img src={imageSrc} alt={repas.nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span style={{ 
                    position: "absolute", 
                    top: "12px", 
                    right: "12px", 
                    backgroundColor: isDisponible ? "var(--af-green)" : "var(--af-red)", 
                    color: "var(--af-white)", 
                    padding: "4px 10px", 
                    borderRadius: "20px", 
                    fontSize: "12px", 
                    fontWeight: 600,
                    textTransform: "capitalize"
                  }}>
                    {repas.status?.toLowerCase().trim() === "indisponible" ? "Indisponible" : repas.status}
                  </span>
                </div>
                <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <h4 className="text-af-black" style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>{repas.nom}</h4>
                      <span className="text-af-orange" style={{ fontWeight: 700 }}>{repas.prix} FCFA</span>
                    </div>
                    <p style={{ margin: "6px 0", fontSize: "13px", color: "var(--af-gray)" }}>
                      Catégorie : <strong>{matchedCategory ? matchedCategory.libelle : repas.id_categorie}</strong> | Qté : {repas.quantite}
                    </p>
                    <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#555" }}>{repas.description}</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "20px", borderTop: "1px solid #f0f0f0", paddingTop: "12px" }}>
                    <button onClick={() => setRepasToEdit(repas)} style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid var(--af-blue)", color: "var(--af-blue)", background: "none", cursor: "pointer", fontWeight: 600 }}>Modifier</button>
                    <button onClick={() => { setRepasToDelete(repas); setShowDeleteModal(true); }} style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "none", background: "var(--af-red)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Supprimer</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const selectStyle: React.CSSProperties = { 
  padding: "8px 12px", 
  borderRadius: "6px", 
  border: "1px solid #ddd", 
  width: "200px",
  backgroundColor: "#fff",
  cursor: "pointer"
};