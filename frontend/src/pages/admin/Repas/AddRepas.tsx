import React, { useState, useEffect } from "react";
import { RepasService } from "../../../services/RepasService";
import CategorieService from "../../../services/CategorieService";

interface CategorieSimple {
  id: number;
  libelle: string;
}

interface AddRepasProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddRepas({ onClose, onSuccess }: AddRepasProps) {
  const [categories, setCategories] = useState<CategorieSimple[]>([]);
  const [nom, setNom] = useState<string>("");
  const [prix, setPrix] = useState<string>("");
  const [quantite, setQuantite] = useState<string>("0");
  const [idCategorie, setIdCategorie] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await CategorieService.getAll();
        const extracted = Array.isArray(res) ? res : (res as any).categories || [];
        setCategories(extracted);
      } catch (err) {
        console.error("Erreur catégories :", err);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nom", nom);
    formData.append("prix", prix);
    formData.append("id_categorie", idCategorie);
    formData.append("quantite", quantite);
    formData.append("description", description);
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    try {
      const res = await RepasService.create(formData);
      if (res.status) {
        // L'alerte native a été retirée ici pour un enchaînement fluide
        onSuccess();
      }
    } catch (err) {
      console.error("Erreur d'ajout :", err);
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div data-aos="zoom-in" data-aos-duration="400" style={modalContentStyle}>
        <h3 className="text-af-black" style={{ marginTop: 0 }}>Ajouter un nouveau repas</h3>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div>
            <label style={labelStyle}>Nom du repas *</label>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required style={inputStyle} placeholder="Ex: Ndolé Royal" />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Prix (FCFA) *</label>
              <input type="number" value={prix} onChange={(e) => setPrix(e.target.value)} required style={inputStyle} placeholder="Ex: 3500" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Quantité initiale *</label>
              <input type="number" value={quantite} onChange={(e) => setQuantite(e.target.value)} required style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Catégorie *</label>
            <select value={idCategorie} onChange={(e) => setIdCategorie(e.target.value)} required style={inputStyle}>
              <option value="">-- Sélectionner --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.libelle}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={inputStyle} placeholder="Ingrédients, accompagnements..." />
          </div>

          <div>
            <label style={labelStyle}>Photo du repas</label>
            <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)} style={{ width: "100%" }} />
          </div>

          <div style={actionsContainerStyle}>
            <button type="button" onClick={onClose} style={btnCancelStyle}>Annuler</button>
            <button type="submit" className="btn-primary" style={btnSubmitStyle}>Sauvegarder</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Styles réutilisables partagés
const modalOverlayStyle: React.CSSProperties = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: "var(--af-white)", padding: "24px", borderRadius: "var(--af-border-radius)", width: "500px", maxWidth: "90%", boxShadow: "0 8px 30px rgba(0,0,0,0.2)" };
const formStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "16px" };
const labelStyle: React.CSSProperties = { display: "block", marginBottom: "4px", fontWeight: 600 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box" };
const actionsContainerStyle: React.CSSProperties = { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" };
const btnCancelStyle: React.CSSProperties = { padding: "10px 16px", borderRadius: "var(--af-border-radius)", border: "1px solid #ddd", background: "none", cursor: "pointer" };
const btnSubmitStyle: React.CSSProperties = { padding: "10px 20px", color: "var(--af-white)", border: "none", cursor: "pointer", fontWeight: 600 };