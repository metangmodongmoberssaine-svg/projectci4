import React, { useEffect, useState, useMemo } from 'react';
import PanierService from '../../services/PanierService';
import { RepasService } from '../../services/RepasService'; 
import { PanierData, PanierItem } from '../../models/PanierModel';
import { Repas as IRepas } from '../../models/RepasModel'; 
import CommandeService from '../../services/CommandeService';

export default function Panier() {
    // États du Panier
    const [panier, setPanier] = useState<PanierData | null>(null);
    const [loadingPanier, setLoadingPanier] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const perPage = 6; 

    // États pour les informations de livraison et commande
    const [isOrdering, setIsOrdering] = useState<boolean>(false);
    const [adresseLivraison, setAdresseLivraison] = useState<string>("");
    const [codePromo, setCodePromo] = useState<string>("");

    // États de la liste des repas réels venant de la BD
    const [repasListe, setRepasListe] = useState<IRepas[]>([]);
    const [loadingRepas, setLoadingRepas] = useState<boolean>(true);

    // États pour le filtrage et la recherche
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("Toutes");
    const [priceOrder, setPriceOrder] = useState<string>("none"); // "none", "asc", "desc"

    // URL du backend pour charger correctement les images
    const URL_BACKEND = import.meta.env.VITE_BACKEND_URL_IMAGE;

    // Charger le panier depuis l'API
    const fetchPanier = async (page: number) => {
        try {
            setLoadingPanier(true);
            const response = await PanierService.getPanier(page, perPage);
            if (response.status) {
                setPanier(response.data);
                setError(null);
            } else {
                setError("Impossible de récupérer le panier.");
            }
        } catch (err) {
            setError("Une erreur est survenue lors du chargement du panier.");
        } finally {
            setLoadingPanier(false);
        }
    };

    // Charger la liste complète des repas réels depuis la BD
    const fetchRepasDisponibles = async () => {
        try {
            setLoadingRepas(true);
            const res = await RepasService.getAll();
            if (res.status && res.data) {
                const repasDispo = res.data.filter((r: IRepas) => r.status?.toLowerCase().trim() === "disponible");
                setRepasListe(repasDispo);
            }
        } catch (err) {
            console.error("Erreur lors de la récupération des repas depuis la BD", err);
        } finally {
            setLoadingRepas(false);
        }
    };

    useEffect(() => {
        fetchRepasDisponibles();
    }, []);

    useEffect(() => {
        fetchPanier(currentPage);
    }, [currentPage]);

    const categories = useMemo(() => {
        return ["Toutes", ...Array.from(new Set(repasListe.map(r => r.categorie || "Autres").filter(Boolean)))];
    }, [repasListe]);

    // Calcul du total du panier de manière dynamique
    const totalPanier = useMemo(() => {
        if (!panier || !panier.items) return 0;
        return panier.items.reduce((acc, item) => {
            const prix = typeof item.prix_unitaire === 'string' ? parseFloat(item.prix_unitaire) : item.prix_unitaire || 0;
            return acc + (prix * (item.quantite || 0));
        }, 0);
    }, [panier]);

    // Ajouter un repas au panier
    const handleAddToCart = async (repasId: number) => {
        try {
            const res = await PanierService.addToCart(repasId, 1); 
            if (res.status) {
                fetchPanier(currentPage);
            }
        } catch (err) {
            alert("Erreur lors de l'ajout au panier.");
        }
    };

    // Supprimer une ligne du panier
    const handleRemoveItem = async (itemId: number) => {
        if (!window.confirm("Voulez-vous retirer ce repas de votre panier ?")) return;
        try {
            const res = await PanierService.removeFromCart(itemId);
            if (res.status) {
                if (panier?.items.length === 1 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                } else {
                    fetchPanier(currentPage);
                }
            }
        } catch (err) {
            alert("Erreur lors de la suppression de l'élément.");
        }
    };

    // Modifier la quantité
    const handleUpdateQuantity = async (itemId: number, newQty: number) => {
        if (newQty === 0) {
            await handleRemoveItem(itemId);
            return;
        }
        if (newQty < 1 || isNaN(newQty)) return;

        try {
            const res = await PanierService.updateQuantity(itemId, newQty);
            if (res.status) {
                fetchPanier(currentPage);
            }
        } catch (err) {
            alert("Erreur lors de la mise à jour de la quantité.");
        }
    };

    // Vider tout le panier
    const handleClearCart = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir vider tout votre panier ?")) return;
        try {
            const res = await PanierService.clearCart();
            if (res.status) {
                setPanier(null);
                setCurrentPage(1);
            }
        } catch (err) {
            alert("Erreur lors du nettoyage du panier.");
        }
    };

    // Passer la commande en envoyant les paramètres attendus par CommandeService.create()
    const handleCreateCommande = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!adresseLivraison.trim()) {
            alert("Veuillez renseigner une adresse de livraison valide.");
            return;
        }

        try {
            setIsOrdering(true);
            
            // Préparation des données d'entrée conformes à CreateCommandeInput
            const payload = {
                adresse: adresseLivraison.trim(),
                code_promo: codePromo.trim() !== "" ? codePromo.trim() : undefined
            };

            const res = await CommandeService.create(payload);

            if (res.status) {
                alert(`Commande passée avec succès !\nRéférence : ${res.reference}`);
                
                // Si le backend renvoie des infos d'initialisation de paiement Campay (Mtn / Orange Money)
                if (res.checkout) {
                    console.log("Paiement push de déclenché :", res.checkout);
                }

                // Réinitialisation des états locaux
                setPanier(null); 
                setAdresseLivraison("");
                setCodePromo("");
                setCurrentPage(1);
            } else {
                alert(res.message || "Impossible de finaliser la commande.");
            }
        } catch (err) {
            console.error("Erreur lors de la commande :", err);
            alert("Une erreur est survenue lors de la validation de votre commande.");
        } finally {
            setIsOrdering(false);
        }
    };

    // Filtrage et Tri dynamique combiné mémoïsé
    const filteredRepasListe = useMemo(() => {
        return repasListe
            .filter((repas) => {
                const query = searchQuery.toLowerCase().trim();
                const matchesNom = repas.nom ? repas.nom.toLowerCase().includes(query) : false;
                const matchesDesc = repas.description ? repas.description.toLowerCase().includes(query) : false;
                const matchesSearch = query === "" || matchesNom || matchesDesc;

                const repasCat = repas.categorie || "Autres";
                const matchesCat = selectedCategory === "Toutes" || repasCat.toLowerCase().trim() === selectedCategory.toLowerCase().trim();

                return matchesSearch && matchesCat;
            })
            .sort((a, b) => {
                const prixA = typeof a.prix === 'string' ? parseFloat(a.prix) : a.prix || 0;
                const prixB = typeof b.prix === 'string' ? parseFloat(b.prix) : b.prix || 0;

                if (priceOrder === "asc") return prixA - prixB;
                if (priceOrder === "desc") return prixB - prixA;
                return 0;
            });
    }, [repasListe, searchQuery, selectedCategory, priceOrder]);

    return (
        <div className="w-100 ps-3 pe-4 py-3 bg-af-light" style={{ minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
            
            <style>{`
                .hover-shadow-effect {
                    transition: all 0.25s ease-in-out !important;
                }
                .hover-shadow-effect:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 .4rem 1rem rgba(0,0,0,.08) !important;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .no-spinners::-webkit-outer-spin-button,
                .no-spinners::-webkit-inner-spin-button {
                    webkit-appearance: none;
                    margin: 0;
                }
                .no-spinners {
                    moz-appearance: textfield;
                }
            `}</style>

            <div className="w-100">
                
                {/* --- EN-TÊTE PRINCIPAL --- */}
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                    <div>
                        <h2 className="text-af-black mb-1" style={{ fontWeight: 700, fontSize: "26px" }}>
                            <i className="bi bi-shop text-af-orange me-2"></i>Espace Shopping & Panier
                        </h2>
                        <p className="text-muted mb-0" style={{ fontSize: "14px" }}>Sélectionnez vos spécialités et passez commande en un clic</p>
                    </div>
                    {panier && panier.items && panier.items.length > 0 && (
                        <button 
                            className="btn btn-outline-danger btn-sm rounded-pill px-4 py-2"
                            style={{ fontWeight: 600 }}
                            onClick={handleClearCart}
                            disabled={isOrdering}
                        >
                            <i className="bi bi-trash me-1"></i>Vider le panier
                        </button>
                    )}
                </div>

                {error && (
                    <div className="alert alert-danger text-center shadow-sm mb-4 border-0 rounded-3">{error}</div>
                )}

                <div className="row g-4">
                    
                    {/* ================= BARRE DE FILTRES COMPLETE EN HAUT ================= */}
                    <div className="col-12 mb-2">
                        <div className="p-3 bg-white shadow-sm rounded-4 border-0 row g-3 align-items-center">
                            <div className="col-12 col-md-5">
                                <div style={{ position: 'relative', width: '100%' }}>
                                    <i className="bi bi-search text-muted" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px' }}></i>
                                    <input 
                                        type="text"
                                        placeholder="Rechercher un plat, une saveur..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="form-control border-0 bg-light"
                                        style={{ paddingLeft: '44px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '10px', fontSize: '14px', outline: 'none', boxShadow: 'none' }}
                                    />
                                </div>
                            </div>

                            <div className="col-6 col-md-4">
                                <div className="input-group">
                                    <label className="input-group-text border-0 bg-light text-muted small" style={{ borderRadius: '10px 0 0 10px', fontSize: '13px' }}>
                                        <i className="bi bi-tags-fill me-1"></i>Catégorie :
                                    </label>
                                    <select 
                                        className="form-select border-0 bg-light text-af-black fw-semibold"
                                        style={{ borderRadius: '0 10px 10px 0', fontSize: '13.5px', outline: 'none', boxShadow: 'none' }}
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        {categories.map((cat, i) => (
                                            <option key={i} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="col-6 col-md-3">
                                <div className="input-group">
                                    <label className="input-group-text border-0 bg-light text-muted small" style={{ borderRadius: '10px 0 0 10px', fontSize: '13px' }}>
                                        <i className="bi bi-coin me-1"></i> Prix :
                                    </label>
                                    <select 
                                        className="form-select border-0 bg-light text-af-black"
                                        style={{ borderRadius: '0 10px 10px 0', fontSize: '13.5px', outline: 'none', boxShadow: 'none' }}
                                        value={priceOrder}
                                        onChange={(e) => setPriceOrder(e.target.value)}
                                    >
                                        <option value="none">Par défaut</option>
                                        <option value="asc">Croissant ↑</option>
                                        <option value="desc">Décroissant ↓</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ================= COLONNE GAUCHE : LA BOUTIQUE ================= */}
                    <div className="col-xl-9 col-lg-8 col-12">
                        <div className="p-3 bg-white shadow-sm rounded-4 mb-4 border-0">
                            
                            <h3 className="text-af-black mb-3 fs-6 fw-bold border-bottom pb-2">
                                <i className="bi bi-journal-rice text-af-orange me-2"></i>Carte des repas disponibles ({filteredRepasListe.length})
                            </h3>

                            {loadingRepas ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-af-orange" role="status"></div>
                                </div>
                            ) : filteredRepasListe.length === 0 ? (
                                <div className="text-center py-5 text-muted bg-light rounded-3" style={{ fontSize: '14px' }}>
                                    Aucun plat ne correspond à vos critères de filtrage.
                                </div>
                            ) : (
                                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-3">
                                    {filteredRepasListe.map((repas) => {
                                        const imageSrc = repas.photo ? `${URL_BACKEND}/${repas.photo}` : 'https://via.placeholder.com/150?text=AfricaFood';
                                        const prixAffiche = typeof repas.prix === 'string' ? parseFloat(repas.prix) : repas.prix;
                                        
                                        return (
                                            <div key={repas.id} className="col">
                                                <div className="card h-100 border-0 shadow-sm hover-shadow-effect" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                                    <div style={{ height: '95px', overflow: 'hidden', position: 'relative', backgroundColor: '#f1f5f9' }}>
                                                        <img 
                                                            src={imageSrc} 
                                                            className="card-img-top w-100 h-100" 
                                                            alt={repas.nom}
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                        {repas.categorie && (
                                                            <span className="position-absolute top-0 start-0 badge bg-dark bg-opacity-75 m-2" style={{ fontSize: '10px' }}>
                                                                {repas.categorie}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="card-body d-flex flex-column justify-content-between bg-white" style={{ padding: '10px' }}>
                                                        <div>
                                                            <h5 className="card-title text-af-black mb-1 text-truncate" style={{ fontWeight: 700, fontSize: '13.5px' }} title={repas.nom}>
                                                                {repas.nom}
                                                            </h5>
                                                            <p className="card-text text-muted mb-2" style={{ fontSize: '0.78rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.3', minHeight: '32px' }}>
                                                                {repas.description || "Aucune description disponible."}
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="d-flex align-items-center justify-content-between mt-auto border-top border-light" style={{ paddingTop: '8px' }}>
                                                            <span className="text-af-orange" style={{ fontSize: '12.5px', fontWeight: 800 }}>
                                                                {prixAffiche?.toLocaleString()} F
                                                            </span>
                                                            <button 
                                                                className="btn btn-sm btn-primary rounded-pill d-flex align-items-center gap-1 shadow-none"
                                                                style={{ fontWeight: 600, fontSize: '11px', paddingLeft: '10px', paddingRight: '10px', paddingTop: '4px', paddingBottom: '4px' }}
                                                                onClick={() => repas.id && handleAddToCart(repas.id)}
                                                                disabled={isOrdering}
                                                            >
                                                                <i className="bi bi-cart-plus-fill"></i>+
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ================= COLONNE DROITE : PANIER + FORMULAIRE DE COMMANDE ================= */}
                    <div className="col-xl-3 col-lg-4 col-12">
                        <div className="p-3 bg-white shadow-sm rounded-4 border-0" style={{ position: 'sticky', top: '24px' }}>
                            <h3 className="text-af-black mb-3 fs-6 fw-bold border-bottom pb-2" style={{ fontWeight: 700 }}>
                                <i className="bi bi-cart3 text-af-orange me-1"></i>Mon Panier 
                                {panier?.pagination?.total_items ? ` (${panier.pagination.total_items})` : ''}
                            </h3>

                            {loadingPanier && !panier ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-af-orange" role="status"></div>
                                </div>
                            ) : !panier || !panier.items || panier.items.length === 0 ? (
                                <div className="text-center py-4 bg-light rounded-4 border-0">
                                    <i className="bi bi-cart-x text-muted mb-1" style={{ fontSize: '2rem', display: 'block' }}></i>
                                    <h5 className="mt-1 text-af-black fw-bold" style={{ fontSize: '14px' }}>Votre panier est vide</h5>
                                    <p className="text-muted small px-2 mb-0" style={{ fontSize: '11.5px' }}>Sélectionnez des plats pour les ajouter ici.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="d-flex justify-content-between text-muted small fw-bold px-1 mb-2" style={{ fontSize: '10.5px' }}>
                                        <span style={{ width: '42%' }}>PRODUIT</span>
                                        <span style={{ width: '33%' }} className="text-center">QTE</span>
                                        <span style={{ width: '25%' }} className="text-end">P.U</span>
                                    </div>

                                    <div className="mb-3 custom-scrollbar" style={{ maxHeight: '240px', overflowY: 'auto', paddingRight: '2px' }}>
                                        {panier.items.map((item: PanierItem) => (
                                            <div key={item.id} className="d-flex align-items-center justify-content-between p-2 mb-2 bg-light rounded-3 border-0">
                                                
                                                <div className="d-flex align-items-center" style={{ width: '42%' }}>
                                                    <img 
                                                        src={item.photo ? `${URL_BACKEND}/${item.photo}` : 'https://via.placeholder.com/100?text=AfricaFood'} 
                                                        alt={item.nom}
                                                        className="img-fluid rounded-2"
                                                        style={{ width: '26px', height: '26px', objectFit: 'cover' }}
                                                    />
                                                    <div className="ms-2 text-truncate">
                                                        <h6 className="text-af-black mb-0 fw-bold text-truncate" style={{ fontSize: '11.5px' }} title={item.nom}>
                                                            {item.nom}
                                                        </h6>
                                                    </div>
                                                </div>

                                                <div className="d-flex align-items-center justify-content-center" style={{ width: '33%' }}>
                                                    <div className="input-group input-group-sm bg-white rounded-2 border" style={{ width: '76px', overflow: 'hidden' }}>
                                                        <button 
                                                            type="button"
                                                            className="btn btn-link text-secondary p-0 border-0 text-decoration-none shadow-none" 
                                                            style={{ width: '20px', fontSize: '13px', fontWeight: 'bold' }}
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantite - 1)}
                                                            disabled={isOrdering}
                                                        >-</button>
                                                        
                                                        <input 
                                                            type="text" 
                                                            inputMode="numeric"
                                                            pattern="[0-9]*"
                                                            className="form-control text-center p-0 border-0 fw-bold bg-transparent shadow-none"
                                                            style={{ fontSize: '11.5px', height: '24px' }}
                                                            value={item.quantite === 0 ? "" : item.quantite}
                                                            disabled={isOrdering}
                                                            onChange={(e) => {
                                                                const inputValue = e.target.value;
                                                                if (inputValue === "") {
                                                                    const updatedItems = panier.items.map(i => i.id === item.id ? { ...i, quantite: 0 } : i);
                                                                    setPanier({ ...panier, items: updatedItems });
                                                                    return;
                                                                }
                                                                const val = parseInt(inputValue, 10);
                                                                if (!isNaN(val) && val >= 0) {
                                                                    handleUpdateQuantity(item.id, val);
                                                                }
                                                            }}
                                                            onBlur={(e) => {
                                                                const val = parseInt(e.target.value, 10);
                                                                if (isNaN(val) || val === 0) {
                                                                    handleRemoveItem(item.id);
                                                                }
                                                            }}
                                                        />

                                                        <button 
                                                            type="button"
                                                            className="btn btn-link text-secondary p-0 border-0 text-decoration-none shadow-none" 
                                                            style={{ width: '20px', fontSize: '13px', fontWeight: 'bold' }}
                                                            onClick={() => handleUpdateQuantity(item.id, (item.quantite || 0) + 1)}
                                                            disabled={isOrdering}
                                                        >+</button>
                                                    </div>
                                                </div>

                                                <div className="d-flex align-items-center justify-content-end gap-1" style={{ width: '25%' }}>
                                                    <span className="text-af-black fw-semibold text-end" style={{ fontSize: '11px' }}>
                                                        {parseFloat((item.prix_unitaire ?? 0).toString()).toLocaleString()} F
                                                    </span>
                                                    <button 
                                                        type="button"
                                                        className="btn btn-sm text-danger p-0 border-0 bg-transparent shadow-none ms-1"
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        disabled={isOrdering}
                                                        title="Retirer du panier"
                                                    >
                                                        <i className="bi bi-trash" style={{ fontSize: '13px' }}></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* --- ZONE D'AFFICHAGE DU TOTAL --- */}
                                    <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded-3 mb-3 border">
                                        <span className="text-af-black fw-bold" style={{ fontSize: '13px' }}>Total global :</span>
                                        <span className="text-af-orange fw-bolder" style={{ fontSize: '15px' }}>{totalPanier.toLocaleString()} F</span>
                                    </div>

                                    {/* FORMULAIRE DE LIVRAISON REQUIS POUR LA CREATION */}
                                    <form onSubmit={handleCreateCommande} className="border-top pt-3 mt-2">
                                        <div className="mb-2">
                                            <label className="form-label text-af-black fw-bold mb-1" style={{ fontSize: '12px' }}>
                                                Adresse de livraison <span className="text-danger">*</span>
                                            </label>
                                            <input 
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Ex: Douala, Akwa, Rue..."
                                                value={adresseLivraison}
                                                onChange={(e) => setAdresseLivraison(e.target.value)}
                                                style={{ fontSize: '12.5px', borderRadius: '6px' }}
                                                required
                                                disabled={isOrdering}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label text-af-black fw-bold mb-1" style={{ fontSize: '12px' }}>
                                                Code promo (Optionnel)
                                            </label>
                                            <input 
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Ex: FREEAFRICA"
                                                value={codePromo}
                                                onChange={(e) => setCodePromo(e.target.value)}
                                                style={{ fontSize: '12.5px', borderRadius: '6px' }}
                                                disabled={isOrdering}
                                            />
                                        </div>

                                        <button 
                                            type="submit"
                                            className="btn btn-sm btn-primary w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2 text-uppercase"
                                            style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}
                                            disabled={isOrdering}
                                        >
                                            {isOrdering ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    Traitement...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-credit-card-2-back-fill"></i> Commander • {totalPanier.toLocaleString()} F
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}