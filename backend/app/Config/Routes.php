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
        // Routes publiques
        $routes->post('register', 'AuthController::register');
        $routes->post('verify-otp', 'AuthController::verifyOtp');
        $routes->post('login', 'AuthController::login');
        
        // Route protégée (Nécessite le token Bearer dans le header)
        $routes->post('logout', 'AuthController::logout', ['filter' => 'jwt']);
    });

   
});