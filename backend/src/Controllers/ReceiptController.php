<?php

namespace App\Controllers;

use App\Repositories\ReceiptRepository;
use App\Services\ReceiptParser;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ReceiptController
{
    private ReceiptRepository $repository;
    private ReceiptParser $parser;

    public function __construct()
    {
        $this->repository = new ReceiptRepository();
        $this->parser = new ReceiptParser();
    }

    public function create(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();

        if (empty($data['text'])) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'error' => 'Missing text field'
            ]));
            return $response->withStatus(400);
        }

        try {
            $parsed = $this->parser->parse($data['text']);
            $id = $this->repository->create($parsed);

            $response->getBody()->write(json_encode([
                'success' => true,
                'id' => $id,
                'parsed' => [
                    'date' => $parsed['parsed_date'],
                    'store' => $parsed['store_name'],
                    'total' => $parsed['total_amount'],
                    'category' => $parsed['category'],
                ]
            ]));

            return $response->withStatus(201);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]));
            return $response->withStatus(500);
        }
    }

    public function list(Request $request, Response $response): Response
    {
        try {
            $receipts = $this->repository->findAll();

            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $receipts
            ]));

            return $response;
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]));
            return $response->withStatus(500);
        }
    }

    public function stats(Request $request, Response $response): Response
    {
        try {
            $thisMonth = $this->repository->getTotalForCurrentMonth();
            $byCategory = $this->repository->getStatsByCategory();

            $response->getBody()->write(json_encode([
                'success' => true,
                'thisMonth' => $thisMonth,
                'byCategory' => $byCategory
            ]));

            return $response;
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]));
            return $response->withStatus(500);
        }
    }

    public function delete(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int) $args['id'];
            $deleted = $this->repository->delete($id);

            if ($deleted) {
                $response->getBody()->write(json_encode([
                    'success' => true,
                    'message' => 'Receipt deleted'
                ]));
                return $response;
            }

            $response->getBody()->write(json_encode([
                'success' => false,
                'error' => 'Receipt not found'
            ]));
            return $response->withStatus(404);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]));
            return $response->withStatus(500);
        }
    }
}