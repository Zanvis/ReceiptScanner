import React from 'react';
import { View } from 'react-native';
import type { ReceiptStats } from '@/lib/types';
import { Text } from '@/components/ui/text';

interface Props {
  stats: ReceiptStats | null;
}

export default function StatsHeader({ stats }: Props) {
  if (!stats) return null;

  return (
    <View className="mb-6">
      <View className="bg-slate-900 mx-5 p-6 rounded-3xl shadow-lg shadow-slate-300">
        {/* Górna sekcja: Główny bilans */}
        <View className="mb-6">
          <Text className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-2">
            Wydatki w tym miesiącu
          </Text>
          <View className="flex-row items-baseline">
            <Text className="text-white text-4xl font-bold tracking-tight">
              {stats.thisMonth.toFixed(2)}
            </Text>
            <Text className="text-emerald-400 text-xl font-medium ml-1">zł</Text>
          </View>
        </View>

        {/* Dolna sekcja: Mini statystyki (Divider) */}
        {stats.byCategory.length > 0 && (
          <View className="border-t border-slate-700 pt-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-slate-300 text-xs font-semibold">
                Główne kategorie
              </Text>
              <Text className="text-slate-500 text-[10px]">TOP 3</Text>
            </View>
            
            <View className="gap-2">
              {stats.byCategory.slice(0, 3).map((cat) => (
                <View key={cat.category} className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2">
                    <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <Text className="text-slate-300 text-sm font-medium">
                      {cat.category}
                    </Text>
                  </View>
                  <Text className="text-white text-sm font-semibold tabular-nums">
                    {parseFloat(cat.total).toFixed(2)} zł
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}