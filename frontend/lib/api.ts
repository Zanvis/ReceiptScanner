import axios from 'axios';
import type { Receipt, ReceiptStats, ApiResponse, ParsedReceipt } from './types';

const API_URL = 'http://192.168.0.24:8080/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const receiptApi = {
  // Pobierz listę paragonów
    getReceipts: async (): Promise<Receipt[]> => {
        const response = await api.get<ApiResponse<Receipt[]>>('/receipts');
        return response.data.data || [];
    },

    // Pobierz statystyki
    getStats: async (): Promise<ReceiptStats> => {
        const response = await api.get<ApiResponse<ReceiptStats>>('/receipts/stats');
        return {
            thisMonth: response.data.thisMonth || 0,
            byCategory: response.data.byCategory || [],
        };
    },

    // Dodaj nowy paragon
    createReceipt: async (text: string): Promise<{ id: number; parsed: ParsedReceipt }> => {
        const response = await api.post('/receipts', { text });
        return {
            id: response.data.id,
            parsed: response.data.parsed,
        };
    },

    // Usuń paragon
    deleteReceipt: async (id: number): Promise<void> => {
        await api.delete(`/receipts/${id}`);
    },

    // Health check
    healthCheck: async (): Promise<boolean> => {
        try {
            const response = await api.get('/health');
            return response.data.success;
        } catch {
            return false;
        }
    },
};