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
      <ThemedText type="title" style={styles.title}>Welcome to SnapTracks</ThemedText>
      <HelloWave></HelloWave>
      <ThemedText type="subtitle" style={styles.subtitle}>Ready to make some noise?</ThemedText>
      <View style={styles.buttonContainer}>
        <Link href="/camera" asChild>
          <Pressable style={styles.button}>
            <ThemedText style={{ color: 'white', fontSize: 20 }}>Start</ThemedText>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 10,
  },
  subtitle: {
    marginTop: 10,
  },
  button: {
    width: '80%',
    marginVertical: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
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

