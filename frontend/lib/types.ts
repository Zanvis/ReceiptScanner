export interface Receipt {
    id: number;
    store_name: string;
    total_amount: string;
    category: string;
    parsed_date: string;
    created_at: string;
}

export interface ReceiptStats {
    thisMonth: number;
    byCategory: Array<{
        category: string;
        total: string;
        count: string;
    }>;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface ParsedReceipt {
    date: string;
    store: string;
    total: number;
    category: string;
}