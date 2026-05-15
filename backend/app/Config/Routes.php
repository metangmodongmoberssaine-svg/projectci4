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
        $routes->post('/', 'CategorieController::create', ['filter' => 'jwt']);
        $routes->put('(:num)', 'CategorieController::update/$1', ['filter' => 'jwt']);
        $routes->delete('(:num)', 'CategorieController::delete/$1', ['filter' => 'jwt']);
    });

    /**
     * Gestion des Repas
     */
    $routes->group('repas', function($routes) {
        // Routes publiques
        $routes->get('/', 'RepasController::index');                            // Liste des repas (filtrable par ?categorie=X)
        $routes->get('(:num)', 'RepasController::show/$1');               // Détails d'un repas + ses avis

        // Routes protégées (Administration)
        $routes->post('/', 'RepasController::create', ['filter' => 'jwt']);           // Création avec upload photo
        
        /**
         * Modification du repas
         * On déclare la route en PUT. Grâce au champ '_method' => 'PUT' dans ton FormData côté React, 
         * CodeIgniter va faire correspondre la requête à cette route PUT tout en te permettant de lire 
         * les fichiers via $_FILES ($this->request->getFile('photo')).
         */
        $routes->put('(:num)', 'RepasController::update/$1', ['filter' => 'jwt']);   
        
        $routes->delete('(:num)', 'RepasController::delete/$1', ['filter' => 'jwt']); // Suppression
        $routes->patch('(:num)/status', 'RepasController::toggleStatus', ['filter' => 'jwt']); // Basculer dispo/indispo
    });

});