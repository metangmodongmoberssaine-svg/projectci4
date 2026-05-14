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
     * Authentification (Public & Privé)
     */
    $routes->group('auth', function($routes) {
        $routes->post('register', 'AuthController::register');
        $routes->post('verify-otp', 'AuthController::verifyOtp');
        $routes->post('login', 'AuthController::login');
        $routes->post('logout', 'AuthController::logout', ['filter' => 'jwt']);
    });

    /**
     * Gestion des Catégories
     */
    $routes->group('categories', function($routes) {
        // Routes publiques (Consultation)
        $routes->get('/', 'CategorieController::index');
        $routes->get('(:num)', 'CategorieController::show/$1');
        
        // Routes protégées (Administration)
        // Nécessite le Header "Authorization: Bearer <votre_token>"
        $routes->post('/', 'CategorieController::create', ['filter' => 'jwt']);
        $routes->put('(:num)', 'CategorieController::update/$1', ['filter' => 'jwt']);
        $routes->delete('(:num)', 'CategorieController::delete/$1', ['filter' => 'jwt']);
    });

});