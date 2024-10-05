import { Text, View, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ThemedText type="subtitle">Ready to make some noise?</ThemedText>
      <Link href="/camera" asChild>
        <Pressable>
          <ThemedText>Start</ThemedText>
        </Pressable>
      </Link>
      
      {/* Temporary Button to navigate to NowPlaying */}
      <Link href="/nowplaying" asChild>
        <Pressable>
          <ThemedText>Go to Now Playing</ThemedText>
        </Pressable>
      </Link>
    </View>
  );
}

