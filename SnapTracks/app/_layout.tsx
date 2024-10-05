import { Stack } from "expo-router";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";

import { useColorScheme } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false, title: 'Home' }}/>
        <Stack.Screen name="camera" options={{ headerShown: false, title: 'Camera' }}/>
        <Stack.Screen name="previewscreen" options={{ headerShown: false, title: 'Preview' }}/>
      </Stack>
    </ThemeProvider>
  );
}
