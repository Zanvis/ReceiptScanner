import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ReceiptDetailsScreen() {
    const { id } = useLocalSearchParams();

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Szczegóły paragonu #{id}</Text>
        <Text style={styles.subtitle}>Ta funkcja będzie wkrótce dostępna</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
});