import React, { useState, useEffect } from "react";
import { Repas as IRepas } from "../../../models/RepasModel";
import { RepasService } from "../../../services/RepasService";
import CategorieService from "../../../services/CategorieService";

interface CategorieSimple {
  id: number;
  libelle: string;
}

interface EditRepasProps {
  repas: IRepas;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditRepas({ repas, onClose, onSuccess }: EditRepasProps) {
  // --- ÉTATS ---
  const [categories, setCategories] = useState<CategorieSimple[]>([]);
  const [nom, setNom] = useState<string>(repas.nom);
  const [prix, setPrix] = useState<string>(repas.prix.toString());
  const [quantite, setQuantite] = useState<string>(repas.quantite.toString());
  const [idCategorie, setIdCategorie] = useState<string>(repas.id_categorie.toString());
  const [description, setDescription] = useState<string>(repas.description || "");
  
  // Normalisation de l'état initial : si le statut en BDD est "indisponible", on s'assure qu'il reste synchronisé
  const [status, setStatus] = useState<string>(repas.status || "disponible");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // --- CHARGEMENT DES CATÉGORIES ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await CategorieService.getAll();
        const extracted = Array.isArray(res) ? res : (res as any).categories || [];
        setCategories(extracted);
      } catch (err) {
        console.error("Erreur récupération catégories :", err);
      }
    };
    fetchCategories();
  }, []);

  // --- SOUMISSION DU FORMULAIRE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repas.id) return;

    const formData = new FormData();
    formData.append("nom", nom);
    formData.append("prix", prix);
    formData.append("id_categorie", idCategorie);
    formData.append("quantite", quantite);
    formData.append("description", description);
    formData.append("status", status); // Transmettra fidèlement "disponible" ou "indisponible"
    
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    try {
      const res = await RepasService.update(repas.id, formData);
      if (res.status) {
        onSuccess();
      }
    } catch (err) {
      console.error("Erreur de modification du repas :", err);
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div data-aos="zoom-in" data-aos-duration="400" style={modalContentStyle}>
        <h3 className="text-af-black" style={{ marginTop: 0 }}>
          Modifier le repas : {repas.nom}
        </h3>
        
        <form onSubmit={handleSubmit} style={formStyle}>
          {/* Nom du repas */}
          <div>
            <label style={labelStyle}>Nom du repas *</label>
            <input 
              type="text" 
              value={nom} 
              onChange={(e) => setNom(e.target.value)} 
              required 
              style={inputStyle} 
            />
          </div>

          {/* Prix & Quantité */}
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Prix (FCFA) *</label>
              <input 
                type="number" 
                value={prix} 
                onChange={(e) => setPrix(e.target.value)} 
                required 
                style={inputStyle} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Quantité dispo *</label>
              <input 
                type="number" 
                value={quantite} 
                onChange={(e) => setQuantite(e.target.value)} 
                required 
                style={inputStyle} 
              />
            </div>
          </div>

          {/* Statut (Correction de la value pour la base de données) */}
          <div>
            <label style={labelStyle}>Statut du repas *</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
              required 
              style={inputStyle}
            >
              <option value="disponible">Disponible</option>
              {/* Utilisation de "indisponible" comme valeur brute pour éviter l'espace vide en BDD */}
              <option value="indisponible">Non disponible</option>
            </select>
          </div>

          {/* Catégorie */}
          <div>
            <label style={labelStyle}>Catégorie *</label>
            <select 
              value={idCategorie} 
              onChange={(e) => setIdCategorie(e.target.value)} 
              required 
              style={inputStyle}
            >
              <option value="">-- Sélectionner --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.libelle}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3} 
              style={inputStyle} 
            />
          </div>

          {/* Téléversement Photo */}
          <div>
            <label style={labelStyle}>Photo du repas</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)} 
              style={{ width: "100%" }} 
            />
            <small style={{ color: "var(--af-gray)", display: "block", marginTop: "4px" }}>
              Laissez vide pour conserver l'ancienne image.
            </small>
          </div>

          {/* Boutons d'action */}
          <div style={actionsContainerStyle}>
            <button type="button" onClick={onClose} style={btnCancelStyle}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" style={btnSubmitStyle}>
              Mettre à jour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- STYLES EN LIGNE ---
const modalOverlayStyle: React.CSSProperties = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: "var(--af-white)", padding: "24px", borderRadius: "var(--af-border-radius)", width: "500px", maxWidth: "90%", boxShadow: "0 8px 30px rgba(0,0,0,0.2)" };
const formStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "16px" };
const labelStyle: React.CSSProperties = { display: "block", marginBottom: "4px", fontWeight: 600 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box" };
const actionsContainerStyle: React.CSSProperties = { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" };
const btnCancelStyle: React.CSSProperties = { padding: "10px 16px", borderRadius: "var(--af-border-radius)", border: "1px solid #ddd", background: "none", cursor: "pointer" };
const btnSubmitStyle: React.CSSProperties = { padding: "10px 20px", color: "var(--af-white)", border: "none", cursor: "pointer", fontWeight: 600 };