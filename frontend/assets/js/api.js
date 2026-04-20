const API_BASE = 'http://localhost:8080/api';

async function request(endpoint, method = 'GET', data = null, requiresAuth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (requiresAuth) {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Non authentifié');
        headers['Authorization'] = `Bearer ${token}`;
    }
    const config = { method, headers };
    if (data) config.body = JSON.stringify(data);

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || json.error || 'Erreur serveur');
    return json;
}

// Auth
export const register = (email, password, name) =>
    request('/auth/register', 'POST', { email, password, name }, false);
export const login = (email, password) =>
    request('/auth/login', 'POST', { email, password }, false);

// Products (public)
export const getProducts = (page = 1, perPage = 10) =>
    request(`/products?page=${page}&perPage=${perPage}`, 'GET', null, false);
export const getProduct = (id) =>
    request(`/products/${id}`, 'GET', null, false);

// Cart (auth)
export const getCart = () => request('/cart', 'GET');
export const addToCart = (product_id, quantity = 1) =>
    request('/cart/add', 'POST', { product_id, quantity });
export const removeFromCart = (id) =>
    request('/cart/remove', 'POST', { id });
export const clearCart = () =>
    request('/cart/clear', 'POST');

// Orders (auth)
export const createOrder = (delivery_address, delivery_time) =>
    request('/orders', 'POST', { delivery_address, delivery_time });
export const getOrders = (page = 1, perPage = 10) =>
    request(`/orders?page=${page}&perPage=${perPage}`, 'GET');
export const getOrder = (id) =>
    request(`/orders/${id}`, 'GET');

// Vendor (role vendor)
export const getVendorProducts = () => request('/vendor/products', 'GET');
export const createVendorProduct = (data) => request('/vendor/products', 'POST', data);
export const updateVendorProduct = (id, data) => request(`/vendor/products/${id}`, 'PUT', data);
export const deleteVendorProduct = (id) => request(`/vendor/products/${id}`, 'DELETE');
export const getVendorOrders = () => request('/vendor/orders', 'GET');
export const updateOrderStatus = (orderId, status) =>
    request(`/vendor/orders/${orderId}/status`, 'PUT', { status });
export const uploadProductImage = (formData) => {
    // Requête spéciale avec FormData (pas de Content-Type JSON)
    return fetch(`${API_BASE}/vendor/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
    }).then(res => res.json());
};

// Delivery (role delivery)
export const getAvailableOrders = () => request('/delivery/orders', 'GET');
export const acceptOrder = (orderId) => request(`/delivery/orders/${orderId}/accept`, 'POST');
export const deliverOrder = (orderId) => request(`/delivery/orders/${orderId}/status`, 'PUT', { status: 'delivered' });

// Admin (role admin)
export const getPendingVendors = () => request('/admin/pending-vendors', 'GET');
export const verifyVendor = (vendorId) => request(`/admin/verify-vendor/${vendorId}`, 'PUT');
export const getAdminStats = () => request('/admin/stats', 'GET');
export const getUsers = (page = 1, perPage = 10) =>
    request(`/admin/users?page=${page}&perPage=${perPage}`, 'GET');