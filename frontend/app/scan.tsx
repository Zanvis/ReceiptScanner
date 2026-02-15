import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { router } from 'expo-router';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { receiptApi } from '@/lib/api';

export default function ScanScreen() {
    const [processing, setProcessing] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(null);

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
        allowsEditing: false,
        });

        if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        processImage(result.assets[0].uri);
        }
    };

    const pickFromGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: false,
        });

        if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        processImage(result.assets[0].uri);
        }
    };

    const processImage = async (uri: string) => {
        try {
        setProcessing(true);

        // Rozpoznaj tekst
        const result = await TextRecognition.recognize(uri);
        const text = result.text;

        if (!text || text.trim().length === 0) {
            Alert.alert('Błąd', 'Nie znaleziono tekstu na zdjęciu. Spróbuj ponownie.');
            setImageUri(null);
            return;
        }

        // Wyślij do API
        const response = await receiptApi.createReceipt(text);

        Alert.alert(
            '✅ Sukces!',
            `Sklep: ${response.parsed.store}\nKwota: ${response.parsed.total.toFixed(2)} zł\nKategoria: ${response.parsed.category}`,
            [
            {
                text: 'OK',
                onPress: () => {
                router.back();
                },
            },
            ]
        );
        } catch (error: any) {
        console.error('Processing error:', error);
        Alert.alert(
            'Błąd',
            error.response?.data?.error || 'Wystąpił problem podczas przetwarzania. Spróbuj ponownie.'
        );
        setImageUri(null);
        } finally {
        setProcessing(false);
        }
    };

    return (
        <View style={styles.container}>
        {imageUri ? (
            <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.preview} />
            {processing && (
                <View style={styles.overlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.processingText}>Przetwarzanie...</Text>
                </View>
            )}
            </View>
        ) : (
            <View style={styles.content}>
            <Text style={styles.title}>Wybierz źródło zdjęcia</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={takePhoto}
                disabled={processing}
            >
                <Text style={styles.buttonIcon}>📸</Text>
                <Text style={styles.buttonText}>Zrób zdjęcie</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={pickFromGallery}
                disabled={processing}
            >
                <Text style={styles.buttonIcon}>🖼️</Text>
                <Text style={styles.buttonText}>Wybierz z galerii</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
            >
                <Text style={styles.cancelText}>Anuluj</Text>
            </TouchableOpacity>
            </View>
        )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 40,
    },
    button: {
        backgroundColor: '#2196F3',
        padding: 20,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    buttonSecondary: {
        backgroundColor: '#4CAF50',
    },
    buttonIcon: {
        fontSize: 28,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButton: {
        marginTop: 20,
        padding: 16,
        alignItems: 'center',
    },
    cancelText: {
        color: '#666',
        fontSize: 16,
    },
    previewContainer: {
        flex: 1,
        position: 'relative',
    },
    preview: {
        flex: 1,
        resizeMode: 'contain',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    processingText: {
        color: '#fff',
        fontSize: 18,
        marginTop: 16,
        fontWeight: '600',
    },
});