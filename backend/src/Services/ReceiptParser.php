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
        error_log('========== PARSER START ==========');
        error_log('Input text length: ' . strlen($text));
        error_log('Input text (first 200 chars): ' . substr($text, 0, 200));
        
        $result = [
            'raw_text' => $text,
            'parsed_date' => $this->extractDate($text),
            'store_name' => $this->extractStore($text),
            'total_amount' => $this->extractTotal($text),
            'category' => $this->extractCategory($text),
        ];
        
        error_log('Parsed result: ' . print_r($result, true));
        error_log('========== PARSER END ==========');
        
        return $result;
    }

    private function extractStore(string $text): string
    {
        error_log('--- Extracting store ---');
        error_log('Text to search: ' . $text);
        
        foreach (self::STORE_PATTERNS as $store => $pattern) {
            if (preg_match($pattern, $text)) {
                $storeName = ucfirst(str_replace(['_', '-'], ' ', $store));
                error_log("MATCH FOUND: {$store} -> {$storeName}");
                return $storeName;
            }
        }

        error_log('NO STORE MATCH - returning default');
        return 'Nieznany sklep';
    }

    private function extractTotal(string $text): float
    {
        error_log('--- Extracting total ---');
        
        $patterns = [
            '/(?:suma|total|razem|do\s*zaplaty|do\s*zap)[\s:]*(\d+[,\.]?\d{0,2})\s*(?:zl|pln)?/i',
            '/(\d+[,\.]\d{2})\s*(?:zl|pln)/i',
            '/(?:karta|card|platnosc)[\s:]*(\d+[,\.]\d{2})/i',
        ];

        $amounts = [];
        foreach ($patterns as $idx => $pattern) {
            if (preg_match_all($pattern, $text, $matches)) {
                error_log("Pattern {$idx} matched: " . print_r($matches[1], true));
                foreach ($matches[1] as $amount) {
                    $normalized = (float) str_replace(',', '.', $amount);
                    if ($normalized > 0) {
                        $amounts[] = $normalized;
                    }
                }
            }
        }

        $total = !empty($amounts) ? max($amounts) : 0.00;
        error_log("Final total: {$total}");
        
        return $total;
    }

    private function extractDate(string $text): string
    {
        error_log('--- Extracting date ---');
        
        $patterns = [
            '/(\d{4})[-\/\.](\d{2})[-\/\.](\d{2})/',
            '/(\d{2})[-\/\.](\d{2})[-\/\.](\d{4})/',
            '/(\d{2})[-\/\.](\d{2})[-\/\.](\d{2})/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                error_log("Date pattern matched: " . print_r($matches, true));
                
                if (strlen($matches[1]) === 4) {
                    return $matches[1] . '-' . $matches[2] . '-' . $matches[3];
                } elseif (strlen($matches[3]) === 4) {
                    return $matches[3] . '-' . $matches[2] . '-' . $matches[1];
                } elseif (strlen($matches[3]) === 2) {
                    $year = '20' . $matches[3];
                    return $year . '-' . $matches[2] . '-' . $matches[1];
                }
            }
        }

        $today = date('Y-m-d');
        error_log("No date found, using today: {$today}");
        return $today;
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