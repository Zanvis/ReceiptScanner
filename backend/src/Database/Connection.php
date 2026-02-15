<?php

namespace App\Database;

use PDO;
use PDOException;

class Connection
{
    private static ?PDO $instance = null;

    private function __construct() {}

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            try {
                $host = getenv('DB_HOST') ?: 'mysql';
                $dbname = getenv('DB_NAME') ?: 'receipt_tracker';
                $user = getenv('DB_USER') ?: 'receipt_user';
                $pass = getenv('DB_PASS') ?: 'receipt_pass';
                $charset = getenv('DB_CHARSET') ?: 'utf8mb4';

                $dsn = "mysql:host={$host};dbname={$dbname};charset={$charset}";
                
                self::$instance = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } catch (PDOException $e) {
                throw new \RuntimeException("Database connection failed: " . $e->getMessage());
            }
        }

        return self::$instance;
    }

    public static function beginTransaction(): void
    {
        self::getInstance()->beginTransaction();
    }

    public static function commit(): void
    {
        self::getInstance()->commit();
    }

    public static function rollBack(): void
    {
        self::getInstance()->rollBack();
    }
}