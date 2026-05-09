<?php

namespace Config;

use CodeIgniter\Config\Filters as BaseFilters;
use CodeIgniter\Filters\Cors;
use CodeIgniter\Filters\CSRF;
use CodeIgniter\Filters\DebugToolbar;
use CodeIgniter\Filters\ForceHTTPS;
use CodeIgniter\Filters\Honeypot;
use CodeIgniter\Filters\InvalidChars;
use CodeIgniter\Filters\PageCache;
use CodeIgniter\Filters\PerformanceMetrics;
use CodeIgniter\Filters\SecureHeaders;

class Filters extends BaseFilters
{
    /**
     * Aliases pour les classes de filtres.
     */
    public array $aliases = [
        'csrf'          => CSRF::class,
        'toolbar'       => DebugToolbar::class,
        'honeypot'      => Honeypot::class,
        'invalidchars'  => InvalidChars::class,
        'secureheaders' => SecureHeaders::class,
        'cors'          => Cors::class,
        'forcehttps'    => ForceHTTPS::class,
        'pagecache'     => PageCache::class,
        'performance'   => PerformanceMetrics::class,
        'jwt'           => \App\Filters\JwtFilter::class, // Ton alias pour le "Sanctum" version CI4
    ];

    /**
     * Filtres appliqués globalement.
     */
    public array $globals = [
        'before' => [
            // 'honeypot',
            // 'csrf',
            // 'invalidchars',
            'cors', // Il est conseillé d'activer CORS globalement pour tes APIs
        ],
        'after' => [
            'toolbar',
            // 'honeypot',
            // 'secureheaders',
        ],
    ];

    /**
     * Appliquer un filtre sur des patterns d'URL spécifiques.
     */
    public array $filters = [
        // On demande le JWT pour toutes les routes 'api/user/...' 
        // ou des actions spécifiques comme le logout.
        'jwt' => [
            'before' => [
                'api/auth/logout',
                'api/user/*', 
                'api/commandes/*'
            ]
        ],
    ];

    public array $required = [
        'before' => ['forcehttps', 'pagecache'],
        'after'  => ['pagecache', 'performance', 'toolbar'],
    ];

    public array $methods = [];
}