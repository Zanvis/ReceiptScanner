<?php

namespace App\Repositories;

use App\Database\Connection;
use PDO;

class ReceiptRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Connection::getInstance();
    }

    public function create(array $data): int
    {
        $sql = "
            INSERT INTO receipts (raw_text, parsed_date, store_name, total_amount, category)
            VALUES (:raw_text, :parsed_date, :store_name, :total_amount, :category)
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':raw_text' => $data['raw_text'],
            ':parsed_date' => $data['parsed_date'],
            ':store_name' => $data['store_name'],
            ':total_amount' => $data['total_amount'],
            ':category' => $data['category'],
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findAll(int $limit = 50): array
    {
        $sql = "
            SELECT id, store_name, total_amount, category, parsed_date, created_at
            FROM receipts
            ORDER BY parsed_date DESC, created_at DESC
            LIMIT :limit
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $sql = "
            SELECT *
            FROM receipts
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);

        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function getTotalForCurrentMonth(): float
    {
        $sql = "
            SELECT COALESCE(SUM(total_amount), 0) as total
            FROM receipts
            WHERE YEAR(parsed_date) = YEAR(CURDATE())
            AND MONTH(parsed_date) = MONTH(CURDATE())
        ";

        $stmt = $this->db->query($sql);
        $result = $stmt->fetch();

        return (float) $result['total'];
    }

    public function getStatsByCategory(): array
    {
        $sql = "
            SELECT 
                category,
                SUM(total_amount) as total,
                COUNT(*) as count
            FROM receipts
            GROUP BY category
            ORDER BY total DESC
        ";

        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    public function delete(int $id): bool
    {
        $sql = "DELETE FROM receipts WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);

        return $stmt->rowCount() > 0;
    }
}