import { getProducts, addToCart } from './api.js';

let currentPage = 1;
const perPage = 8;

async function loadProducts(page = 1) {
    try {
        const result = await getProducts(page, perPage);
        const products = result.data;
        const pagination = result.pagination;
        renderProducts(products);
        renderPagination(pagination);
    } catch (err) {
        document.getElementById('products-list').innerHTML = `<p>Erreur: ${err.message}</p>`;
    }
}

function renderProducts(products) {
    const container = document.getElementById('products-list');
    if (!products.length) {
        container.innerHTML = '<p>Aucun plat disponible.</p>';
        return;
    }
    container.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.image_url || '/assets/images/default-dish.jpg'}" class="product-img" alt="${p.name}">
            <div class="product-info">
                <h3 class="product-title">${p.name}</h3>
                <p class="product-price">${p.price} €</p>
                <p>🍽️ ${p.servings} pers.</p>
                <div class="product-actions">
                    <button class="btn btn-primary add-to-cart" data-id="${p.id}"><i class="fas fa-cart-plus"></i> Ajouter</button>
                    <a href="/product.html?id=${p.id}" class="btn btn-outline">Voir</a>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const productId = btn.dataset.id;
            if (!localStorage.getItem('token')) {
                alert('Veuillez vous connecter');
                window.location.href = '/login.html';
                return;
            }
            try {
                await addToCart(productId, 1);
                alert('Ajouté au panier');
            } catch (err) {
                alert(err.message);
            }
        });
    });
}

function renderPagination(pagination) {
    const container = document.getElementById('pagination');
    if (pagination.lastPage <= 1) return;
    let buttons = '';
    for (let i = 1; i <= pagination.lastPage; i++) {
        buttons += `<button class="${i === pagination.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    container.innerHTML = buttons;
    container.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            loadProducts(currentPage);
        });
    });
}

// Détail produit (si on est sur product.html)
if (window.location.pathname.includes('product.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId) {
        import('./api.js').then(({ getProduct, addToCart }) => {
            getProduct(productId).then(product => {
                document.getElementById('product-detail').innerHTML = `
                    <div class="product-card">
                        <img src="${product.image_url || '/assets/images/default-dish.jpg'}" style="width:100%;max-width:400px">
                        <h2>${product.name}</h2>
                        <p>${product.description}</p>
                        <p>Prix: ${product.price} €</p>
                        <p>Portions: ${product.servings}</p>
                        <p>Stock: ${product.stock}</p>
                        <button id="detail-add-to-cart" class="btn btn-primary">Ajouter au panier</button>
                    </div>
                `;
                document.getElementById('detail-add-to-cart')?.addEventListener('click', () => {
                    if (!localStorage.getItem('token')) { alert('Connectez-vous'); return; }
                    addToCart(product.id, 1).then(() => alert('Ajouté'));
                });
            }).catch(err => alert(err.message));
        });
    }
} else {
    loadProducts(currentPage);
}