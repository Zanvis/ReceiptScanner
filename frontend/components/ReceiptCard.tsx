import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import type { Receipt } from '@/lib/types';
import { Text } from '@/components/ui/text';

interface Props {
  receipt: Receipt;
  onPress?: () => void;
}

export default function ReceiptCard({ receipt, onPress }: Props) {
  // Funkcja, aby wyciągnąć pierwszą literę do "logo" sklepu
  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <TouchableOpacity
      className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm flex-row items-center justify-between"
      onPress={onPress}
      activeOpacity={0.6}
    >
      {/* LEWA STRONA: Ikona + Info */}
      <View className="flex-row items-center flex-1 gap-3">
        {/* "Logo" sklepu - placeholder */}
        <View className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200">
          <Text className="text-slate-600 font-bold text-lg">
            {getInitials(receipt.store_name)}
          </Text>
        </View>

        <View>
          <Text className="text-slate-900 font-bold text-base leading-tight">
            {receipt.store_name}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            {/* Badge kategorii */}
            <View className="bg-slate-100 px-2 py-0.5 rounded-md">
              <Text className="text-[10px] font-semibold text-slate-600 uppercase">
                {receipt.category}
              </Text>
            </View>
            <Text className="text-xs text-slate-400">
              {formatDate(receipt.parsed_date)}
            </Text>
          </View>
        </View>
      </View>

      {/* PRAWA STRONA: Cena */}
      <View>
        <Text className="text-slate-900 font-bold text-lg text-right tabular-nums">
          -{parseFloat(receipt.total_amount).toFixed(2)}
        </Text>
        <Text className="text-slate-400 text-xs text-right">PLN</Text>
      </View>
    </TouchableOpacity>
  );
}