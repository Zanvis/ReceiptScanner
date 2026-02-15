import { Stack } from 'expo-router';
import { PortalHost } from '@rn-primitives/portal';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import '../global.css';

export default function RootLayout() {
  return (
    <>
      {/* StatusBar steruje kolorem ikonek (bateria, godzina).
         'dark' oznacza ciemne ikonki na jasnym tle.
      */}
      <StatusBar style="dark" />
      
      <Stack
        screenOptions={{
          // Tło nagłówka: Czysta biel lub bardzo jasny szary (jak tło aplikacji)
          headerStyle: {
            backgroundColor: '#ffffff', // lub '#f8fafc' jeśli chcesz idealnie zlać z tłem
          },
          // Kolor przycisków i strzałek (Szmaragdowy, pasujący do akcentów)
          headerTintColor: '#059669', 
          // Styl tytułu: Ciemny granat (Slate-900), gruby font
          headerTitleStyle: {
            fontWeight: '800', // Extra bold
            color: '#0f172a',  // Slate-900
            fontSize: 20,
          },
          // KLUCZOWE: Usunięcie cienia pod nagłówkiem (Flat design)
          headerShadowVisible: false,
          // Wyśrodkowanie tytułu (standard na iOS, opcja na Android)
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            // Możemy usunąć tytuł 'Skaner...' i zostawić go w nagłówku w treści, 
            // ALBO zostawić tutaj. Wersja z emoji wygląda trochę mniej "pro", 
            // więc zmieniamy na czysty tekst.
            title: 'Skaner',
          }}
        />
        <Stack.Screen
          name="scan"
          options={{
            title: 'Skanowanie',
            presentation: 'modal',
            // W modalu często daje się minimalnie inny styl
            headerStyle: {
              backgroundColor: '#ffffff',
            },
          }}
        />
        {/* Obsługa ekranu szczegółów (dynamiczna nazwa w pliku, tu tylko default) */}
        <Stack.Screen
            name="receipt/[id]"
            options={{
                title: 'Szczegóły',
                headerBackTitle: 'Wróć', // Tylko iOS
            }}
        />
      </Stack>
      <PortalHost />
    </>
  );
}