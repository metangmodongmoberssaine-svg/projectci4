import { getVendorProducts, createVendorProduct, updateVendorProduct, deleteVendorProduct, getVendorOrders, updateOrderStatus, uploadProductImage } from './api.js';

// Charger les produits du vendeur
async function loadProducts() {
    try {
        const products = await getVendorProducts();
        const container = document.getElementById('vendor-products');
        if (!products.length) {
            container.innerHTML = '<p>Aucun produit pour le moment.</p>';
            return;
        }
        container.innerHTML = products.map(p => `
            <div class="product-card" data-id="${p.id}">
                <img src="${p.image_url || '/assets/images/default-dish.jpg'}" class="product-img">
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p>${p.price} € - ${p.servings} pers.</p>
                    <p>Stock: ${p.stock}</p>
                    <button class="btn btn-outline edit-product" data-id="${p.id}"><i class="fas fa-edit"></i> Modifier</button>
                    <button class="btn btn-danger delete-product" data-id="${p.id}"><i class="fas fa-trash"></i> Supprimer</button>
                </div>
            </div>
        `).join('');
        attachProductEvents();
    } catch(err) { alert(err.message); }
}

function attachProductEvents() {
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', () => editProduct(btn.dataset.id));
    });
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('Supprimer ce produit ?')) {
                await deleteVendorProduct(btn.dataset.id);
                loadProducts();
            }
        });
    });
}

async function editProduct(id) {
    const newName = prompt('Nouveau nom');
    if (newName) {
        await updateVendorProduct(id, { name: newName });
        loadProducts();
    }
}

// Création produit avec image
const form = document.getElementById('product-form');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('price', document.getElementById('price').value);
        formData.append('servings', document.getElementById('servings').value);
        formData.append('storage_type', document.getElementById('storage_type').value);
        formData.append('dlc_days', document.getElementById('dlc_days').value);
        const fileInput = document.getElementById('image');
        if (fileInput.files[0]) formData.append('image', fileInput.files[0]);
        
        try {
            // D'abord créer le produit (sans image)
            const productData = {
                name: formData.get('name'),
                price: parseFloat(formData.get('price')),
                servings: parseInt(formData.get('servings')),
                storage_type: formData.get('storage_type'),
                dlc_days: parseInt(formData.get('dlc_days'))
            };
            const result = await createVendorProduct(productData);
            const productId = result.id;
            // Ensuite upload image si nécessaire
            if (fileInput.files[0]) {
                const imageFormData = new FormData();
                imageFormData.append('image', fileInput.files[0]);
                const uploadRes = await uploadProductImage(imageFormData);
                await updateVendorProduct(productId, { image_url: uploadRes.image_url });
            }
            alert('Produit créé');
            loadProducts();
            form.reset();
        } catch(err) { alert(err.message); }
    });
}

// Charger les commandes
async function loadOrders() {
    try {
        const orders = await getVendorOrders();
        const container = document.getElementById('vendor-orders');
        if (!orders.length) {
            container.innerHTML = '<p>Aucune commande.</p>';
            return;
        }
        container.innerHTML = orders.map(order => `
            <div class="order-card">
                <p>Commande #${order.id} - Total: ${order.total_amount} € - Statut: ${order.status}</p>
                <select data-order="${order.id}" class="status-select">
                    <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>En préparation</option>
                    <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Prêt</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Annulé</option>
                </select>
                <button class="btn btn-primary update-status" data-order="${order.id}">Mettre à jour</button>
            </div>
        `).join('');
        document.querySelectorAll('.update-status').forEach(btn => {
            btn.addEventListener('click', async () => {
                const orderId = btn.dataset.order;
                const newStatus = document.querySelector(`.status-select[data-order="${orderId}"]`).value;
                await updateOrderStatus(orderId, newStatus);
                loadOrders();
            });
        });
    } catch(err) { alert(err.message); }
}

loadProducts();
loadOrders();