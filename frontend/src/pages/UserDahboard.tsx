import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideBarUser from '../contents/SibdeBarUser';
const UserDashboard: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: 'var(--af-light)' }}>
            
            {/* 1. SIDEBAR USER */}
            <SideBarUser isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* 2. ZONE DE DROITE */}
            <div 
                className="d-flex flex-column flex-grow-1" 
                style={{ 
                    marginLeft: isCollapsed ? '80px' : '280px', 
                    transition: 'margin-left 0.3s ease',
                    minHeight: '100vh',
                    width: '100%',
                    overflowX: 'hidden'
                }}
            >
                {/* CONTENU DYNAMIQUE */}
                <main className="p-4 flex-grow-1">

                    <div className="container-fluid p-0 animate__animated animate__fadeIn">
                        <Outlet />
                    </div>
                </main>

                {/* Footer Admin */}
                <footer className="px-4 py-3 text-center" style={{ fontSize: '0.85rem', color: 'var(--af-gray)', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    &copy; {new Date().getFullYear()} <strong className="text-af-orange">AfricaFood Admin</strong> — Gestion des produits frais.
                </footer>
            </div>

            <style>{`
                body { overflow-x: hidden; }
                .animate__fadeIn { animation-duration: 0.6s; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: #f1f1f1; }
                ::-webkit-scrollbar-thumb {
                    background: var(--af-primary);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default UserDashboard;