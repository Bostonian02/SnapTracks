import { Text, View, Button } from "react-native";
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
        <Button title='Start'></Button>
      </Link>
    </View>
  );
}
