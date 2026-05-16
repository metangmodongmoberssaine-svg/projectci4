<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Config\Services;

class AuthFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $authHeader = $request->getServer('HTTP_AUTHORIZATION');
        
        if (!$authHeader) {
            return Services::response()
                ->setStatusCode(401)
                ->setJSON(['status' => false, 'message' => 'Token manquant.']);
        }

        $arr = explode(' ', $authHeader);
        $token = $arr[1] ?? '';

        try {
            $key = getenv('JWT_SECRET');
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            
            // Stockage de l'objet décodé complet par sécurité
            $request->user = $decoded; 

            // --- LA CORRECTION ICI ---
            // On extrait l'ID de l'utilisateur du token (souvent 'id' ou 'uid' ou 'sub')
            // Adapte 'id' si dans ton JWT le paramètre s'appelle autrement (ex: $decoded->uid)
            $userId = $decoded->id ?? $decoded->uid ?? $decoded->sub ?? 0;

            if ($userId > 0) {
                // On injecte l'ID dans un Header pour que le contrôleur le lise à coup sûr
                $request->setHeader('X-User-Id', (string) $userId);
            }
            
            return $request; // On retourne la requête modifiée

        } catch (\Exception $e) {
            return Services::response()
                ->setStatusCode(401)
                ->setJSON(['status' => false, 'message' => 'Token invalide ou expiré.']);
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Rien à faire ici
    }
}