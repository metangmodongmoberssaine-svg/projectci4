import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Repas as IRepas } from "../models/RepasModel";
import { RepasService } from "../services/RepasService";
import CategorieService from "../services/CategorieService";

interface CategorieSimple {
  id: number;
  libelle: string;
}

interface IRepasClient extends IRepas {
  en_promotion?: boolean;
  prix_normal?: number;
}

export default function Repas() {
  const [repasList, setRepasList] = useState<IRepasClient[]>([]);
  const [categories, setCategories] = useState<CategorieSimple[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [selectedCategorie, setSelectedCategorie] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>(""); 

  const URL_BACKEND = import.meta.env.VITE_BACKEND_URL_IMAGE;

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    fetchCategories();
  }, []);

  // Déclenché à chaque fois que la catégorie sélectionnée change pour exploiter la route dynamique
  useEffect(() => {
    fetchRepas(selectedCategorie ? Number(selectedCategorie) : undefined);
  }, [selectedCategorie]);

  const fetchCategories = async () => {
    try {
      const res = await CategorieService.getAll();
      const extracted = Array.isArray(res) ? res : (res as any).categories || [];
      setCategories(extracted);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRepas = async (catId?: number) => {
    setLoading(true);
    try {
      // Utilisation stricte de la route getClientAll dédiée à la partie publique
      const res = await RepasService.getClientAll(catId);
      
      // Petit délai volontaire de 600ms pour temporiser, structurer le site et apprécier l'effet de chargement
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (res.status && res.data) {
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
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    setTimeout(() => { AOS.refresh(); }, 50);
  };

  // Le filtrage par catégorie est désormais géré directement par l'API, on ne filtre en local que le statut
  const filteredRepasList = repasList.filter((repas) => {
    if (selectedStatus !== "") {
      const repasStatusClean = repas.status !== undefined && repas.status !== null ? String(repas.status).toLowerCase().trim() : "";
      const selectedStatusClean = selectedStatus.toLowerCase().trim();
      if (repasStatusClean !== selectedStatusClean) return false;
    }
    return true; 
  });

  return (
    <div className="bg-af-light" style={{ padding: "40px 24px", minHeight: "100vh", fontFamily: "sans-serif" }}>
      
      {/* --- BANNIÈRE HERO --- */}
      <div 
        data-aos="fade-down"
        style={{
          backgroundColor: "var(--af-white)",
          padding: "40px",
          borderRadius: "var(--af-border-radius)",
          boxShadow: "var(--af-shadow)",
          marginBottom: "40px",
          textAlign: "center",
          borderLeft: "5px solid var(--af-orange)"
        }}
      >
        <h1 style={{ color: "var(--af-black)", margin: "0 0 12px 0", fontSize: "32px", fontWeight: 800 }}>
          Bienvenue chez <span style={{ color: "var(--af-orange)" }}>AfricaFood</span>
        </h1>
        <p style={{ color: "#555", maxWidth: "600px", margin: "0 auto", fontSize: "16px", lineHeight: "1.6" }}>
          Succombez à la richesse de notre patrimoine culinaire. Tous nos plats sont préparés à la demande avec des ingrédients frais, locaux et soigneusement sélectionnés par nos chefs.
        </p>
      </div>

      {/* --- TITRE ET FILTRES --- */}
      <div style={{ marginBottom: "32px" }}>
        <div data-aos="fade-right" style={{ marginBottom: "20px" }}>
          <h2 className="text-af-black" style={{ margin: 0, fontWeight: 700, fontSize: "24px" }}>Notre Carte Exclusive</h2>
          <p style={{ color: "var(--af-gray)", margin: "4px 0 0 0" }}>Filtrez selon vos envies du moment et vérifiez la disponibilité en temps réel.</p>
        </div>

        <div 
          data-aos="fade-up" 
          style={{ 
            backgroundColor: "var(--af-white)", 
            padding: "20px", 
            borderRadius: "var(--af-border-radius)", 
            boxShadow: "var(--af-shadow)", 
            display: "flex", 
            flexWrap: "wrap",
            alignItems: "center", 
            gap: "24px" 
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontWeight: 600, color: "var(--af-black)" }}>Catégorie :</span>
            <select value={selectedCategorie} onChange={handleCategoryChange} style={selectStyle}>
              <option value="">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>{cat.libelle}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontWeight: 600, color: "var(--af-black)" }}>Statut :</span>
            <select value={selectedStatus} onChange={handleStatusChange} style={selectStyle}>
              <option value="">Tous les statuts</option>
              <option value="disponible">Disponible</option>
              <option value="indisponible">Indisponible</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- GRILLE ET CONTENU --- */}
      {loading ? (
        /* SKELETON ANIMATION VISIBLE GRACE AU DELAI DE STRUCTURE */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ backgroundColor: "var(--af-white)", borderRadius: "var(--af-border-radius)", height: "350px", opacity: 0.6, padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ backgroundColor: "#e0e0e0", height: "180px", borderRadius: "8px" }}></div>
              <div style={{ backgroundColor: "#e0e0e0", height: "24px", width: "70%", borderRadius: "4px" }}></div>
              <div style={{ backgroundColor: "#e0e0e0", height: "16px", width: "40%", borderRadius: "4px" }}></div>
              <div style={{ backgroundColor: "#e0e0e0", height: "40px", width: "100%", borderRadius: "4px" }}></div>
            </div>
          ))}
        </div>
      ) : filteredRepasList.length === 0 ? (
        <div 
          data-aos="zoom-in"
          style={{ 
            textAlign: "center", 
            padding: "60px 20px", 
            color: "var(--af-gray)", 
            backgroundColor: "var(--af-white)", 
            borderRadius: "var(--af-border-radius)",
            boxShadow: "var(--af-shadow)"
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🍽️</div>
          <h3 style={{ color: "var(--af-black)", margin: "0 0 8px 0" }}>Notre cuisine se renouvelle</h3>
          <p style={{ margin: 0 }}>Aucun plat ne correspond actuellement à vos critères de recherche ou la carte est en cours de mise à jour.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
          {filteredRepasList.map((repas, index) => {
            const imageSrc = repas.photo ? `${URL_BACKEND}/${repas.photo}` : "https://via.placeholder.com/300x200?text=AfricaFood";
            const matchedCategory = categories.find((c) => c.id === Number(repas.id_categorie));
            const isDisponible = repas.status?.toLowerCase().trim() === "disponible";

            return (
              <div key={repas.id} data-aos="fade-up" data-aos-delay={(index % 4) * 100} style={{ backgroundColor: "var(--af-white)", borderRadius: "var(--af-border-radius)", overflow: "hidden", boxShadow: "var(--af-shadow)", display: "flex", flexDirection: "column" }}>
                
                {/* ZONE IMAGE */}
                <div style={{ height: "180px", position: "relative", backgroundColor: "#eaeaea" }}>
                  <img src={imageSrc} alt={repas.nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span style={{ 
                    position: "absolute", top: "12px", right: "12px", 
                    backgroundColor: isDisponible ? "var(--af-green)" : "var(--af-red)", 
                    color: "var(--af-white)", padding: "4px 10px", borderRadius: "20px", 
                    fontSize: "12px", fontWeight: 600, textTransform: "capitalize"
                  }}>
                    {repas.status?.toLowerCase().trim() === "indisponible" ? "Indisponible" : repas.status}
                  </span>
                </div>
                
                {/* CONTENU DE LA CARD */}
                <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <h4 className="text-af-black" style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>{repas.nom}</h4>
                      
                      {/* VERIFICATION ET DOUBLE AFFICHAGE DU PRIX EN CAS DE PROMOTION */}
                      <div style={{ textAlign: "right", minWidth: "100px" }}>
                        {repas.en_promotion && repas.prix_normal ? (
                          <>
                            <span style={{ textDecoration: "line-through", color: "var(--af-red)", fontSize: "12px", display: "block", fontWeight: 600 }}>
                              {Number(repas.prix_normal).toLocaleString()} FCFA
                            </span>
                            <span style={{ color: "var(--af-green)", fontWeight: 800, fontSize: "18px", display: "block", marginTop: "2px" }}>
                              {Number(repas.prix).toLocaleString()} FCFA
                            </span>
                          </>
                        ) : (
                          <span className="text-af-orange" style={{ fontWeight: 800, fontSize: "18px" }}>
                            {Number(repas.prix).toLocaleString()} FCFA
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p style={{ margin: "10px 0 6px 0", fontSize: "13px", color: "var(--af-gray)" }}>
                      Catégorie : <strong style={{ color: "var(--af-black)" }}>{matchedCategory ? matchedCategory.libelle : repas.id_categorie}</strong>
                    </p>
                    <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#555", lineHeight: "1.5" }}>{repas.description}</p>
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
  padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", width: "200px", backgroundColor: "#fff", cursor: "pointer", outline: "none"
};