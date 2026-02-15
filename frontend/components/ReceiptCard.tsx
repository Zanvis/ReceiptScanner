import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Receipt } from '@/lib/types';

interface Props {
    receipt: Receipt;
    onPress?: () => void;
}

export default function ReceiptCard({ receipt, onPress }: Props) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        });
    };

    return (
        <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.7}
        >
        <View style={styles.header}>
            <Text style={styles.store}>{receipt.store_name}</Text>
            <Text style={styles.amount}>
            {parseFloat(receipt.total_amount).toFixed(2)} zł
            </Text>
        </View>

        <View style={styles.footer}>
            <View style={styles.category}>
            <Text style={styles.categoryIcon}>📂</Text>
            <Text style={styles.categoryText}>{receipt.category}</Text>
            </View>
            <Text style={styles.date}>{formatDate(receipt.parsed_date)}</Text>
        </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    store: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        flex: 1,
    },
    amount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    category: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    categoryIcon: {
        fontSize: 14,
    },
    categoryText: {
        fontSize: 14,
        color: '#666',
    },
    date: {
        fontSize: 14,
        color: '#999',
    },
});