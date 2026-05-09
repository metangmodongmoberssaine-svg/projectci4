<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Config\Services;
use Exception;

class JwtFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $authHeader = $request->getServer('HTTP_AUTHORIZATION');

        if (!$authHeader) {
            return Services::response()
                ->setStatusCode(401)
                ->setJSON(['status' => false, 'message' => 'Accès refusé. Token manquant.']);
        }

        try {
            // Extraction du token Bearer
            $token = str_replace('Bearer ', '', $authHeader);
            $key = getenv('JWT_SECRET');
            
            // Décodage
            $decoded = JWT::decode($token, new Key($key, 'HS256'));

            // On injecte les infos du user dans la requête pour le controller
            $request->user = $decoded;

        } catch (Exception $e) {
            return Services::response()
                ->setStatusCode(401)
                ->setJSON([
                    'status' => false, 
                    'message' => 'Session expirée ou Token invalide.',
                    'error' => $e->getMessage()
                ]);
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) {}
}