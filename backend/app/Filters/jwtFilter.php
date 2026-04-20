<?php namespace App\Filters;

use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Filters\FilterInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $header = $request->getHeaderLine('Authorization');

        if (!$header || !str_starts_with($header, 'Bearer ')) {
            return service('response')->setStatusCode(401)->setJSON([
                'status' => false,
                'message' => 'Token manquant.'
            ]);
        }

        $token = substr($header, 7);

        try {
            $decoded = JWT::decode($token, new Key(getenv('JWT_SECRET'), 'HS256'));

            //  Injection dans la requête
            $request->userId   = (int) $decoded->uid;
            $request->userRole = (string) $decoded->role;

        } catch (\Exception $e) {
            return service('response')->setStatusCode(401)->setJSON([
                'status' => false,
                'message' => 'Token invalide ou expiré.'
            ]);
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // rien ici
    }
}