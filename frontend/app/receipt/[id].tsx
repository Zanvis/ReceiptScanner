import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';

export default function ReceiptDetailsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View className="flex-1 justify-center items-center bg-secondary/5 p-5">
      <Text className="text-2xl font-bold text-foreground mb-2">
        Szczegóły paragonu #{id}
      </Text>
      <Text className="text-lg text-muted-foreground">
        Ta funkcja będzie wkrótce dostępna
      </Text>
    </View>
  );
}