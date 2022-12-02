import { Stack, Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="sign-in" redirect />
      <Stack.Screen name="(screens)" />
    </Stack>
  );
}
