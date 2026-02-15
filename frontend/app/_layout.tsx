import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: '💰 Skaner Paragonów',
        }}
      />
      <Stack.Screen
        name="scan"
        options={{
          title: 'Skanuj paragon',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}