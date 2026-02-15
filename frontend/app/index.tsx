import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { receiptApi } from '@/lib/api';
import StatsHeader from '@/components/StatsHeader';
import ReceiptCard from '@/components/ReceiptCard';
import type { Receipt, ReceiptStats } from '@/lib/types';

export default function HomeScreen() {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [stats, setStats] = useState<ReceiptStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
        setLoading(true);
        const [receiptsData, statsData] = await Promise.all([
            receiptApi.getReceipts(),
            receiptApi.getStats(),
        ]);
        setReceipts(receiptsData);
        setStats(statsData);
        } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert(
            'Błąd połączenia',
            'Nie można pobrać danych z serwera. Sprawdź połączenie.'
        );
        } finally {
        setLoading(false);
        setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const handleScan = () => {
        router.push('/scan');
    };

    if (loading) {
        return (
        <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Ładowanie...</Text>
        </View>
        );
    }

    return (
        <View style={styles.container}>
        <FlatList
            data={receipts}
            ListHeaderComponent={
            <>
                <StatsHeader stats={stats} />
                
                <TouchableOpacity
                style={styles.scanButton}
                onPress={handleScan}
                activeOpacity={0.8}
                >
                <Text style={styles.scanIcon}>📸</Text>
                <Text style={styles.scanText}>Zeskanuj paragon</Text>
                </TouchableOpacity>

                <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Ostatnie paragony</Text>
                </View>
            </>
            }
            renderItem={({ item }) => <ReceiptCard receipt={item} />}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                Brak paragonów.{'\n'}Zeskanuj pierwszy!
                </Text>
            </View>
            }
            refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    listContent: {
        paddingBottom: 20,
    },
    scanButton: {
        backgroundColor: '#2196F3',
        margin: 20,
        padding: 20,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    scanIcon: {
        fontSize: 32,
    },
    scanText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    listHeader: {
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        lineHeight: 24,
    },
});