import { getPendingVendors, verifyVendor, getAdminStats, getUsers } from './api.js';

async function loadPendingVendors() {
    const vendors = await getPendingVendors();
    const container = document.getElementById('pending-vendors');
    if (!vendors.length) { container.innerHTML = '<p>Aucun vendeur en attente.</p>'; return; }
    container.innerHTML = vendors.map(v => `
        <div>
            ${v.name} (${v.email})
            <button class="btn btn-primary verify-vendor" data-id="${v.id}">Valider</button>
        </div>
    `).join('');
    document.querySelectorAll('.verify-vendor').forEach(btn => {
        btn.addEventListener('click', async () => {
            await verifyVendor(btn.dataset.id);
            loadPendingVendors();
            loadStats();
        });
    });
}

async function loadStats() {
    const stats = await getAdminStats();
    document.getElementById('stats').innerHTML = `
        <p>Total commandes: ${stats.total_orders}</p>
        <p>Chiffre d'affaires: ${stats.total_revenue} €</p>
        <p>Produits: ${stats.total_products}</p>
        <p>Vendeurs en attente: ${stats.pending_vendors}</p>
    `;
}

async function loadUsers() {
    const result = await getUsers(1, 10);
    const users = result.data;
    const container = document.getElementById('users-list');
    container.innerHTML = users.map(u => `<p>${u.name} - ${u.email} - Rôle: ${u.role}</p>`).join('');
}

loadPendingVendors();
loadStats();
loadUsers();