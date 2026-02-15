<?php

namespace App\Services;

class ReceiptParser
{
    private const STORE_PATTERNS = [
        'biedronka' => '/biedronka/i',
        'lidl' => '/lidl/i',
        'kaufland' => '/kaufland/i',
        'zabka' => '/żabka|zabka/i',
        'carrefour' => '/carrefour/i',
        'auchan' => '/auchan/i',
        'tesco' => '/tesco/i',
        'orlen' => '/orlen/i',
        'shell' => '/shell/i',
        'bp' => '/bp/i',
        'rossmann' => '/rossmann/i',
        'hebe' => '/hebe/i',
        'media markt' => '/media[\s-]?markt/i',
        'euro rtv agd' => '/euro\s*rtv\s*agd/i',
        'decathlon' => '/decathlon/i',
        'leroy merlin' => '/leroy\s*merlin/i',
    ];

    private const CATEGORIES = [
        'biedronka' => 'Spożywcze',
        'lidl' => 'Spożywcze',
        'kaufland' => 'Spożywcze',
        'zabka' => 'Spożywcze',
        'carrefour' => 'Spożywcze',
        'auchan' => 'Spożywcze',
        'tesco' => 'Spożywcze',
        'orlen' => 'Paliwo',
        'shell' => 'Paliwo',
        'bp' => 'Paliwo',
        'rossmann' => 'Drogeria',
        'hebe' => 'Drogeria',
        'media markt' => 'Elektronika',
        'euro rtv agd' => 'Elektronika',
        'decathlon' => 'Sport',
        'leroy merlin' => 'Dom i ogród',
    ];

    public function parse(string $text): array
    {
        return [
            'raw_text' => $text,
            'parsed_date' => $this->extractDate($text),
            'store_name' => $this->extractStore($text),
            'total_amount' => $this->extractTotal($text),
            'category' => $this->extractCategory($text),
        ];
    }

    private function extractDate(string $text): string
    {
        // Wzorce dat: 2024-01-15, 15.01.2024, 15/01/2024, 15-01-2024
        $patterns = [
            '/(\d{4})[-\/\.](\d{2})[-\/\.](\d{2})/',           // 2024-01-15
            '/(\d{2})[-\/\.](\d{2})[-\/\.](\d{4})/',           // 15-01-2024
            '/(\d{2})[-\/\.](\d{2})[-\/\.](\d{2})/',           // 15-01-24
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                if (strlen($matches[1]) === 4) {
                    // Format: YYYY-MM-DD
                    return $matches[1] . '-' . $matches[2] . '-' . $matches[3];
                } elseif (strlen($matches[3]) === 4) {
                    // Format: DD-MM-YYYY
                    return $matches[3] . '-' . $matches[2] . '-' . $matches[1];
                } elseif (strlen($matches[3]) === 2) {
                    // Format: DD-MM-YY (zakładamy 20XX)
                    $year = '20' . $matches[3];
                    return $year . '-' . $matches[2] . '-' . $matches[1];
                }
            }
        }

        // Fallback na dzisiejszą datę
        return date('Y-m-d');
    }

    private function extractStore(string $text): string
    {
        foreach (self::STORE_PATTERNS as $store => $pattern) {
            if (preg_match($pattern, $text)) {
                return ucfirst(str_replace(['_', '-'], ' ', $store));
            }
        }

        return 'Nieznany sklep';
    }

    private function extractTotal(string $text): float
    {
        // Wzorce dla kwot
        $patterns = [
            // SUMA: 123.45 | SUMA 123,45 PLN
            '/(?:suma|total|razem|do\s*zaplaty|do\s*zap)[\s:]*(\d+[,\.]?\d{0,2})\s*(?:zl|pln)?/i',
            // Liczby z PLN/zł na końcu: 123.45 PLN
            '/(\d+[,\.]\d{2})\s*(?:zl|pln)/i',
            // Kwoty przy oznaczeniach kart: KARTA: 45.99
            '/(?:karta|card|platnosc)[\s:]*(\d+[,\.]\d{2})/i',
        ];

        $amounts = [];
        foreach ($patterns as $pattern) {
            if (preg_match_all($pattern, $text, $matches)) {
                foreach ($matches[1] as $amount) {
                    $normalized = (float) str_replace(',', '.', $amount);
                    if ($normalized > 0) {
                        $amounts[] = $normalized;
                    }
                }
            }
        }

        // Zwróć największą kwotę (zwykle to suma końcowa)
        return !empty($amounts) ? max($amounts) : 0.00;
    }

    private function extractCategory(string $text): string
    {
        foreach (self::STORE_PATTERNS as $store => $pattern) {
            if (preg_match($pattern, $text)) {
                return self::CATEGORIES[$store] ?? 'Inne';
            }
        }

        return 'Inne';
    }
}