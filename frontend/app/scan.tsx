import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  StatusBar,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; // Używamy ikon z Expo (standard)

import { receiptApi } from '@/lib/api';
import { Text } from '@/components/ui/text';

export default function ScanScreen() {
  const [processing, setProcessing] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const requestPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Brak uprawnień',
        'Aplikacja potrzebuje dostępu do aparatu, aby skanować paragony.'
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: false, // Zmieniono na false dla szybszego flow, można włączyć true
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      processImage(uri);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: false,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      processImage(uri);
    }
  };

  const processImage = async (uri: string) => {
    try {
      setProcessing(true);

      const result = await TextRecognition.recognize(uri);
      const text = result.text;

      if (!text || text.trim().length === 0) {
        Alert.alert('Błąd', 'Nie znaleziono tekstu na zdjęciu. Spróbuj ponownie.');
        setImageUri(null);
        return;
      }

      const response = await receiptApi.createReceipt(text);

      // Zamiast prostego Alertu, można by tu zrobić nawigację do ekranu edycji/podglądu
      // Ale na razie zostawiamy Alert w stylu "Sukces"
      Alert.alert(
        '✅ Paragon dodany!',
        `Sklep: ${response.parsed.store}\nKwota: ${response.parsed.total.toFixed(2)} zł`,
        [
          {
            text: 'Wróć',
            onPress: () => router.back(),
            style: 'default',
          },
        ]
      );
    } catch (error: any) {
      console.error('Processing error:', error);
      Alert.alert(
        'Błąd przetwarzania',
        'Nie udało się odczytać paragonu. Upewnij się, że zdjęcie jest wyraźne.'
      );
      setImageUri(null);
    } finally {
      setProcessing(false);
    }
  };

  // --- EKRAN PRZETWARZANIA (OVERLAY) ---
  if (processing && imageUri) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <StatusBar barStyle="light-content" />
        <Image 
          source={{ uri: imageUri }} 
          className="absolute w-full h-full opacity-30" 
          resizeMode="cover"
        />
        <View className="bg-slate-900/80 p-8 rounded-3xl items-center shadow-2xl">
          <ActivityIndicator size="large" color="#10b981" className="mb-6" />
          <Text className="text-white text-xl font-bold mb-2">Analizowanie...</Text>
          <Text className="text-slate-400 text-center">
            Przetwarzamy Twój paragon{'\n'}za pomocą AI
          </Text>
        </View>
      </View>
    );
  }

  // --- GŁÓWNY EKRAN WYBORU ---
  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      
      {/* Przycisk Zamknij (X) */}
      <View 
        className="absolute z-10 right-5"
        style={{ top: insets.top + 10 }}
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100"
        >
          <Ionicons name="close" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerClassName="flex-1 justify-center px-6 py-10">
        <View className="mb-10 items-center">
          <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="scan-outline" size={40} color="#059669" />
          </View>
          <Text className="text-slate-900 text-3xl font-bold text-center mb-3">
            Dodaj paragon
          </Text>
          <Text className="text-slate-500 text-center text-lg px-4">
            Zrób zdjęcie lub wybierz z galerii, a my automatycznie odczytamy dane.
          </Text>
        </View>

        <View className="gap-4 w-full max-w-sm mx-auto">
          {/* Przycisk: KAMERA */}
          <TouchableOpacity
            onPress={takePhoto}
            activeOpacity={0.8}
            className="bg-slate-900 p-6 rounded-2xl flex-row items-center shadow-lg shadow-slate-300"
          >
            <View className="bg-slate-800 p-3 rounded-xl mr-5">
              <Ionicons name="camera" size={32} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold mb-1">
                Zrób zdjęcie
              </Text>
              <Text className="text-slate-400 text-sm">
                Użyj aparatu teraz
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748b" />
          </TouchableOpacity>

          {/* Przycisk: GALERIA */}
          <TouchableOpacity
            onPress={pickFromGallery}
            activeOpacity={0.8}
            className="bg-white p-6 rounded-2xl flex-row items-center border border-slate-200 shadow-sm"
          >
            <View className="bg-slate-100 p-3 rounded-xl mr-5">
              <Ionicons name="images" size={32} color="#0f172a" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 text-lg font-bold mb-1">
                Wybierz z galerii
              </Text>
              <Text className="text-slate-500 text-sm">
                Zaimportuj plik
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        <View className="mt-12 items-center">
          <Text className="text-slate-400 text-xs uppercase tracking-widest font-semibold">
            Wspierane formaty
          </Text>
          <View className="flex-row gap-3 mt-3">
            {['JPG', 'PNG', 'HEIC'].map((format) => (
              <View key={format} className="bg-slate-200 px-3 py-1 rounded-md">
                <Text className="text-slate-600 text-[10px] font-bold">{format}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}