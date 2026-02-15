import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform,
  StatusBar
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { receiptApi } from '@/lib/api';
import type { Receipt, ReceiptStats } from '@/lib/types';
import StatsHeader from '@/components/StatsHeader';
import ReceiptCard from '@/components/ReceiptCard';
import { Text } from '@/components/ui/text';

export default function HomeScreen() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [stats, setStats] = useState<ReceiptStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Hook do bezpiecznych marginesów (np. na iPhone z notchem)
  const insets = useSafeAreaInsets();

  const loadData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const [receiptsData, statsData] = await Promise.all([
        receiptApi.getReceipts(),
        receiptApi.getStats(),
      ]);
      setReceipts(receiptsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleScan = () => router.push('/scan');
  const handleReceiptPress = (id: number) => router.push(`/receipt/${id}`);

  // Loading State - Czysty i na środku
  if (loading && !refreshing && receipts.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 relative">
      <StatusBar barStyle="dark-content" />
      
      <FlatList
        data={receipts}
        // Ważne: Padding na dole = wysokość przycisku + margines, żeby lista nie wchodziła pod przycisk
        contentContainerClassName="pb-32 pt-2"
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#0f172a" 
          />
        }
        ListHeaderComponent={
          <View>
            {/* Karta Statystyk */}
            <StatsHeader stats={stats} />

            {/* Nagłówek Sekcji - Minimalistyczny */}
            <View className="px-6 mb-3 flex-row items-center justify-between">
              <Text className="text-slate-900 text-lg font-bold tracking-tight">
                Ostatnie transakcje
              </Text>
              {/* Opcjonalny licznik lub link 'Zobacz wszystkie' */}
              <Text className="text-slate-400 text-xs font-medium">
                {receipts.length} paragonów
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-5">
             <ReceiptCard 
               receipt={item} 
               onPress={() => handleReceiptPress(item.id)} 
             />
          </View>
        )}
        ListEmptyComponent={
          <View className="py-12 items-center justify-center opacity-60">
            <View className="w-16 h-16 bg-slate-200 rounded-full items-center justify-center mb-4">
               <Text className="text-2xl">🧾</Text>
            </View>
            <Text className="text-slate-500 text-center font-medium">
              Brak historii paragonów
            </Text>
            <Text className="text-slate-400 text-xs text-center mt-1">
              Dodaj pierwszy skanując paragon
            </Text>
          </View>
        }
      />

      {/* FLOATING ACTION BUTTON (Pływający przycisk) */}
      <View 
        className="absolute w-full px-6 items-center pointer-events-box-none"
        style={{ bottom: insets.bottom + 20 }} // Uwzględnia bezpieczny margines na dole (iPhone Home Bar)
      >
        <TouchableOpacity
          onPress={handleScan}
          activeOpacity={0.9}
          // Styl: Ciemny Granat (Slate-900) pasujący do karty statystyk.
          // Dodajemy cień (shadow-xl) i delikatny połysk.
          className="bg-slate-900 w-full py-4 rounded-2xl flex-row items-center justify-center shadow-xl shadow-slate-400/50"
        >
          {/* Ikona Plusa / Aparatu */}
          <View className="bg-emerald-500 rounded-full p-1.5 mr-3">
             <Text className="text-white text-xs font-bold">＋</Text> 
          </View>
          
          <Text className="text-white font-bold text-lg tracking-wide">
            Skanuj paragon
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}