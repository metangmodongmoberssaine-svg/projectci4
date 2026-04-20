import { login, register } from './api.js';

// Afficher/masquer les liens selon connexion
export function updateAuthUI() {
    const token = localStorage.getItem('token');
    const authLinks = document.getElementById('auth-links');
    const logoutBtn = document.getElementById('logout-btn');
    if (token) {
        if (authLinks) authLinks.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        if (authLinks) authLinks.style.display = 'flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

export function logout() {
    localStorage.removeItem('token');
    updateAuthUI();
    window.location.href = '/index.html';
}

// Initialisation au chargement de chaque page
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
});

// Formulaire login (si présent)
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            const data = await login(email, password);
            localStorage.setItem('token', data.token);
            alert('Connexion réussie');
            window.location.href = '/index.html';
        } catch (err) {
            alert(err.message);
        }
    });
}

// Formulaire register
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            await register(email, password, name);
            alert('Inscription réussie. Connectez-vous.');
            window.location.href = '/login.html';
        } catch (err) {
            alert(err.message);
        }
    });
}