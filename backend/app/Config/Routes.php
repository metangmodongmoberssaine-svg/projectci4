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
     * FIX : '' au lieu de '/' supprime le double slash api/livreurs//4 
     * qui causait la 404 sur PUT et DELETE.
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

});