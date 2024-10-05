import { Text, View, Pressable, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: 'center'
      }}
    >
      <ThemedText type="subtitle">Ready to make some noise?</ThemedText>
      <View style={styles.buttonContainer}>
        <Link href="/camera" asChild>
          <Pressable style={styles.button}>
            <ThemedText>Start</ThemedText>
          </Pressable>
        </Link>
        
        {/* Temporary Button to navigate to NowPlaying */}
        <Link href="/nowplaying" asChild>
          <Pressable style={styles.button}>
            <ThemedText>Go to Now Playing</ThemedText>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '80%',
    marginVertical: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

