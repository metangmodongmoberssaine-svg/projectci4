
import { getAvailableOrders, acceptOrder, deliverOrder } from './api.js';

async function loadOrders() {
    try {
        const orders = await getAvailableOrders();
        const container = document.getElementById('delivery-orders');
        if (!orders.length) {
            container.innerHTML = '<p>Aucune commande prête à être livrée.</p>';
            return;
        }
        container.innerHTML = orders.map(order => `
            <div class="order-card">
                <p>Commande #${order.id} - Adresse: ${order.delivery_address}</p>
                <button class="btn btn-primary accept-order" data-id="${order.id}">Accepter la livraison</button>
                <button class="btn btn-outline deliver-order" data-id="${order.id}" style="display:none;">Marquer livrée</button>
            </div>
        `).join('');
        document.querySelectorAll('.accept-order').forEach(btn => {
            btn.addEventListener('click', async () => {
                await acceptOrder(btn.dataset.id);
                alert('Commande acceptée, en cours de livraison');
                loadOrders();
            });
        });
    } catch(err) { alert(err.message); }
}

loadOrders();