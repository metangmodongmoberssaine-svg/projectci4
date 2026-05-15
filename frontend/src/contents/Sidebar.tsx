import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  MdLogout,
  MdAccountCircle,
  MdMenu,
  MdDashboard,
  MdCategory,
  MdFastfood, 
  MdLocalOffer
} from "react-icons/md";
import AuthService from "../services/AuthService";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      setShowLogoutModal(false);
      navigate("/login");
    } catch (error) {
      console.error("Erreur déconnexion", error);
      localStorage.clear();
      navigate("/login");
    }
  };

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    borderRadius: 'var(--af-border-radius)',
    transition: 'all 0.3s ease',
    backgroundColor: isActive ? 'var(--af-primary)' : 'transparent',
    color: 'var(--af-white)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: isCollapsed ? 'center' : 'start',
    padding: '12px 15px',
    position: 'relative' as const,
    marginBottom: '8px',
    textDecoration: 'none'
  });

  return (
    <>
      <style>{`
        .sidebar-container.collapsed .nav-item .nav-link::after {
          content: attr(data-label);
          position: absolute;
          left: 100%;
          margin-left: 15px;
          padding: 5px 10px;
          background: var(--af-orange-dark);
          color: white;
          border-radius: 5px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: 0.2s ease;
          z-index: 2000;
          font-size: 0.8rem;
          box-shadow: var(--af-shadow);
        }
        .sidebar-container.collapsed .nav-item .nav-link:hover::after {
          opacity: 1;
          visibility: visible;
        }
        .nav-link-custom:hover { 
            background-color: rgba(255, 255, 255, 0.1) !important; 
        }
      `}</style>

      <div
        className={`d-flex flex-column flex-shrink-0 p-3 shadow sidebar-container ${isCollapsed ? "collapsed" : ""}`}
        style={{ 
          width: isCollapsed ? "80px" : "280px", 
          minHeight: "100vh", 
          backgroundColor: "var(--af-black-deep)", 
          transition: "all 0.3s ease",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 1000
        }}
      >
        {/* Header Logo */}
        <div className={`d-flex align-items-center mb-4 mt-2 ${isCollapsed ? 'justify-content-center' : 'justify-content-between'}`}>
          {!isCollapsed && (
            <div className="d-flex align-items-center">
              <MdFastfood className="me-2" size={32} style={{ color: 'var(--af-primary)' }} />
              <div className="d-flex flex-column">
                <span className="fs-5 fw-bold text-white">AfricaFood</span>
                <small className="fw-bold" style={{ fontSize: '0.65rem', color: 'var(--af-success)', letterSpacing: '1px' }}>ADMINISTRATION</small>
              </div>
            </div>
          )}
          <button 
            className="btn text-white p-0 border-0" 
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <MdMenu size={28} />
          </button>
        </div>

        <hr style={{ backgroundColor: "rgba(255,255,255,0.1)", height: '1px' }} />

        {/* Navigation */}
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item">
            <NavLink to="/admin/dashboard" style={navLinkStyle} className="nav-link-custom" data-label="Tableau de bord">
              <MdDashboard size={22} className={isCollapsed ? "" : "me-3"} />
              {!isCollapsed && <span className="fw-bold">Tableau de bord</span>}
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/admin/categories" style={navLinkStyle} className="nav-link-custom" data-label="Catégories">
              <MdCategory size={22} className={isCollapsed ? "" : "me-3"} />
              {!isCollapsed && <span className="fw-bold">Catégories</span>}
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/admin/repas" style={navLinkStyle} className="nav-link-custom" data-label="Repas">
              <MdFastfood size={22} className={isCollapsed ? "" : "me-3"} />
              {!isCollapsed && <span className="fw-bold">Repas</span>}
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/admin/promotions" style={navLinkStyle} className="nav-link-custom" data-label="Promotions">
              <MdLocalOffer size={22} className={isCollapsed ? "" : "me-3"} />
              {!isCollapsed && <span className="fw-bold">Promotions</span>}
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/admin/profile" style={navLinkStyle} className="nav-link-custom" data-label="Mon Profil">
              <MdAccountCircle size={22} className={isCollapsed ? "" : "me-3"} />
              {!isCollapsed && <span className="fw-bold">Mon Profil</span>}
            </NavLink>
          </li>
        </ul>

        <hr style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />

        {/* Pied de page / Déconnexion */}
        <div className="mt-auto">
          <button
            onClick={() => setShowLogoutModal(true)}
            className={`btn w-100 d-flex align-items-center gap-2 p-3 text-white border-0 ${isCollapsed ? 'justify-content-center' : 'justify-content-start'}`}
            style={{ 
              borderRadius: 'var(--af-border-radius)', 
              backgroundColor: 'rgba(192, 57, 43, 0.1)', 
              transition: 'all 0.2s'
            }}
          >
            <MdLogout size={22} style={{ color: 'var(--af-danger)' }} />
            {!isCollapsed && <span className="fw-bold">Déconnexion</span>}
          </button>
        </div>
      </div>

      {/* MODAL DE DÉCONNEXION */}
      {showLogoutModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1051 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '380px' }}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 'var(--af-border-radius)' }}>
              <div className="modal-body p-4 text-center">
                <MdLogout size={50} className="mb-3" style={{ color: 'var(--af-danger)' }} />
                <h5 className="fw-bold text-af-black">Déconnexion</h5>
                <p className="text-muted">Êtes-vous sûr de vouloir quitter votre session ?</p>
                <div className="d-flex gap-2 mt-4">
                  <button className="btn btn-light w-50 fw-bold" onClick={() => setShowLogoutModal(false)}>Annuler</button>
                  <button className="btn btn-primary w-50 fw-bold" onClick={handleLogout}>Confirmer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;