<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

/**
 * Cross-Origin Resource Sharing (CORS) Configuration
 */
class Cors extends BaseConfig
{
    /**
     * The default CORS configuration.
     */
    public array $default = [
        /**
         * Autorise l'URL de ton application React
         */
        'allowedOrigins' => ['http://localhost:5173'],

        'allowedOriginsPatterns' => [],

        /**
         * Passer à 'true' si tu comptes utiliser des Cookies ou des sessions 
         * partagées (pas nécessaire pour le JWT pur, mais utile pour le futur).
         */
        'supportsCredentials' => true,

        /**
         * On autorise explicitement 'Authorization' pour ton Token JWT
         * et 'Content-Type' pour tes envois JSON.
         */
        'allowedHeaders' => ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],

        'exposedHeaders' => [],

        /**
         * Méthodes HTTP autorisées pour ton API
         */
        'allowedMethods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

        /**
         * Durée de mise en cache de la requête de pré-vérification (2 heures)
         */
        'maxAge' => 7200,
    ];
}