import { Text, View, Pressable, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Link } from "expo-router";
import { HelloWave } from "@/components/HelloWave";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: 'center',
        margin: 10
      }}
    >
      <ThemedText type="title">Welcome to SnapTracks</ThemedText>
      <HelloWave></HelloWave>
      <ThemedText type="subtitle">Ready to make some noise?</ThemedText>
      <View style={styles.buttonContainer}>
        <Link href="/camera" asChild>
          <Pressable style={styles.button}>
            <ThemedText style={{ color: 'white' }}>Start</ThemedText>
          </Pressable>
        </Link>
        
        {/* Temporary Button to navigate to NowPlaying */}
        <Link href="/nowplaying" asChild>
          <Pressable style={styles.button}>
            <ThemedText style={{ color: 'white' }}>Go to Now Playing</ThemedText>
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
    backgroundColor: '#6200ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

