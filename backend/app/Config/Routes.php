<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

/*
 * --------------------------------------------------------------------
 * Routes pour l'API AfricaFood
 * --------------------------------------------------------------------
 */
$routes->group('api', ['namespace' => 'App\Controllers\Api'], function($routes) {
    
    /**
     * Authentification & Profil
     */
    $routes->group('auth', function($routes) {
        $routes->post('register', 'AuthController::register');
        $routes->post('verify-otp', 'AuthController::verifyOtp');
        $routes->post('login', 'AuthController::login');

        $routes->group('', ['filter' => 'jwt'], function($routes) {
            $routes->get('profile', 'AuthController::profile');
            $routes->put('update-profile', 'AuthController::updateProfile');
            $routes->post('change-password', 'AuthController::changePassword');
            $routes->post('logout', 'AuthController::logout');
        });
    });

    /**
     * Gestion des Adresses (Protégée par JWT)
     */
    $routes->group('adresses', ['filter' => 'jwt'], function($routes) {
        $routes->get('/', 'AdresseController::index');                               // GET    /api/adresses (Lister ses adresses)
        $routes->post('/', 'AdresseController::store');                              // POST   /api/adresses (Ajouter une adresse)
        $routes->put('(:num)', 'AdresseController::update/$1');                      // PUT    /api/adresses/{id} (Modifier)
        $routes->delete('(:num)', 'AdresseController::delete/$1');                    // DELETE /api/adresses/{id} (Supprimer)
        $routes->patch('(:num)/default', 'AdresseController::setDefault/$1');        // PATCH  /api/adresses/{id}/default (Définir par défaut)
    });

    /**
     * Gestion des Contacts (Public & Admin)
     */
    $routes->group('contact', function($routes) {
        // Route publique pour envoyer un message
        $routes->post('send', 'ContactController::sendPublicMessage');
    });

    $routes->group('admin/contacts', ['filter' => 'jwt'], function($routes) {
        // Routes d'administration protégées par JWT
        $routes->get('/', 'ContactController::index');                               // Lister avec pagination & filtres
        $routes->patch('mark-read/(:num)', 'ContactController::toggleReadStatus/$1'); // Inverser le statut (Lu/Non lu)
        $routes->patch('mark-all-read', 'ContactController::markAllAsRead');         // Tout marquer comme lu
        $routes->post('reply/(:num)', 'ContactController::reply/$1');                 // Répondre à un message
    });

    /**
     * Gestion des Livreurs
     */
    $routes->group('livreurs', ['filter' => 'jwt'], function($routes) {
        $routes->resource('', ['controller' => 'LivreurController', 'webservice' => true]);
    });

    /**
     * Gestion des Notifications
     */
    $routes->group('notifications', ['filter' => 'jwt'], function($routes) {
        $routes->get('/', 'NotificationController::index');           
        $routes->patch('read-all', 'NotificationController::markRead'); 
        $routes->patch('read/(:num)', 'NotificationController::markRead/$1'); 
        $routes->post('send', 'NotificationController::send'); 
    });

    /**
     * Gestion des Catégories
     */
    $routes->group('categories', function($routes) {
        $routes->get('/', 'CategorieController::index');
        $routes->get('(:num)', 'CategorieController::show/$1');
        
        $routes->group('', ['filter' => 'jwt'], function($routes) {
            $routes->post('/', 'CategorieController::create');
            $routes->put('(:num)', 'CategorieController::update/$1');
            $routes->delete('(:num)', 'CategorieController::delete/$1');
        });
    });

    /**
     * Gestion des Repas
     */
    $routes->group('repas', function($routes) {
        $routes->get('client', 'RepasController::clientIndex'); 
        $routes->get('/', 'RepasController::index');
        $routes->get('(:num)', 'RepasController::show/$1');

        $routes->group('', ['filter' => 'jwt'], function($routes) {
            $routes->post('/', 'RepasController::create'); 
            $routes->put('(:num)', 'RepasController::update/$1'); 
            $routes->delete('(:num)', 'RepasController::delete/$1'); 
            $routes->patch('(:num)/status', 'RepasController::toggleStatus');
        });
    });

    /**
     * Gestion des Promotions
     */
    $routes->group('promotions', function($routes) {
        $routes->get('/', 'PromotionController::index');
        
        $routes->group('', ['filter' => 'jwt'], function($routes) {
            $routes->post('/', 'PromotionController::store');
            $routes->put('(:num)', 'PromotionController::update/$1');
            $routes->delete('(:num)', 'PromotionController::delete/$1');
            $routes->patch('(:num)/toggle', 'PromotionController::toggle/$1');
        });
    });

    /**
     * Gestion du Panier (Protégée par JWT)
     */
    $routes->group('panier', ['filter' => 'jwt'], function($routes) {
        $routes->get('/', 'PanierController::index');                                    // GET    /api/panier
        $routes->post('add', 'PanierController::add');                                   // POST   /api/panier/add
        $routes->put('item/(:num)', 'PanierController::update/$1');                     // PUT    /api/panier/item/{id}
        $routes->delete('item/(:num)', 'PanierController::remove/$1');                  // DELETE /api/panier/item/{id}
        $routes->delete('clear', 'PanierController::clear');                             // DELETE /api/panier/clear
    });

    /**
     * Gestion des Commandes (Protégée par JWT & Admin)
     */
    $routes->group('commandes', ['filter' => 'jwt'], function($routes) {
        $routes->get('/', 'CommandeController::index');                                  // GET    /api/commandes (Historique client)
        $routes->get('(:num)', 'CommandeController::show/$1');                           // GET    /api/commandes/{id} (Détail d'une commande)
        $routes->post('/', 'CommandeController::create');                                // POST   /api/commandes (Créer commande + Campay)
        $routes->post('(:num)/annuler', 'CommandeController::annuler/$1');               // POST   /api/commandes/{id}/annuler (Annulation client)
        $routes->patch('(:num)/statut', 'CommandeController::changerStatut/$1');          // PATCH  /api/commandes/{id}/statut (Admin change l'état)
    });

    /**
     * Gestion des Paiements Campay
     * URLs correspondantes : /api/payment/...
     */
    $routes->group('payment', function($routes) {
        // Le webhook doit rester STRICTEMENT public pour recevoir les réponses asynchrones de Campay
        $routes->post('webhook', 'CampayController::webhook');         // POST /api/payment/webhook

        // Toutes les autres actions de paiement nécessitent une authentification JWT
        $routes->group('', ['filter' => 'jwt'], function($routes) {
            $routes->post('initiate', 'CampayController::initiate');       // POST /api/payment/initiate
            $routes->post('collect', 'CampayController::collectBrute');     // POST /api/payment/collect
            $routes->post('withdraw', 'CampayController::withdrawAdmin');   // POST /api/payment/withdraw
            $routes->get('status/(:any)', 'CampayController::status/$1');   // GET  /api/payment/status/{reference}
        });
    });

});