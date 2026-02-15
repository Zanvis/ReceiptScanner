<?php

use App\Controllers\ReceiptController;
use App\Middleware\CorsMiddleware;
use Slim\Factory\AppFactory;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require __DIR__ . '/../vendor/autoload.php';

// Załaduj zmienne środowiskowe (opcjonalne)
if (file_exists(__DIR__ . '/../.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->load();
}

$app = AppFactory::create();

// Middleware
$app->add(new CorsMiddleware());
$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();
$errorMiddleware = $app->addErrorMiddleware(true, true, true);

// Routes z prefiksem /api
$app->get('/', function (Request $request, Response $response) {
    $response->getBody()->write(json_encode([
        'success' => true,
        'message' => 'Receipt Scanner API',
        'version' => '1.0.0'
    ]));
    return $response;
});

$app->post('/api/receipts', [ReceiptController::class, 'create']);
$app->get('/api/receipts', [ReceiptController::class, 'list']);
$app->get('/api/receipts/stats', [ReceiptController::class, 'stats']);
$app->delete('/api/receipts/{id}', [ReceiptController::class, 'delete']);

// Health check
$app->get('/api/health', function (Request $request, Response $response) {
    try {
        \App\Database\Connection::getInstance();
        $response->getBody()->write(json_encode([
            'success' => true,
            'database' => 'connected'
        ]));
    } catch (\Exception $e) {
        $response->getBody()->write(json_encode([
            'success' => false,
            'database' => 'error',
            'message' => $e->getMessage()
        ]));
        return $response->withStatus(500);
    }
    return $response;
});

$app->run();