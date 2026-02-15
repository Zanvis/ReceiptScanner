import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ReceiptStats } from '@/lib/types';

interface Props {
    stats: ReceiptStats | null;
}

export default function StatsHeader({ stats }: Props) {
    if (!stats) return null;

    return (
        <View style={styles.container}>
        <View style={styles.mainStat}>
            <Text style={styles.label}>Wydatki w tym miesiącu</Text>
            <Text style={styles.amount}>{stats.thisMonth.toFixed(2)} zł</Text>
        </View>

        {stats.byCategory.length > 0 && (
            <View style={styles.categories}>
            <Text style={styles.categoriesTitle}>Top kategorie:</Text>
            {stats.byCategory.slice(0, 3).map((cat) => (
                <View key={cat.category} style={styles.categoryRow}>
                <Text style={styles.categoryName}>{cat.category}</Text>
                <Text style={styles.categoryAmount}>
                    {parseFloat(cat.total).toFixed(2)} zł ({cat.count})
                </Text>
                </View>
            ))}
            </View>
        )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#4CAF50',
        padding: 20,
        paddingTop: 10,
    },
    mainStat: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
    },
    label: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 5,
        opacity: 0.9,
    },
    amount: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    categories: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 12,
        borderRadius: 8,
    },
    categoriesTitle: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    categoryName: {
        color: '#fff',
        fontSize: 14,
    },
    categoryAmount: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});