import { View, FlatList, StyleSheet, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Playlist() {
  const playlist = [
    { id: '1', title: 'Current Song - Example Song 1' },
    { id: '2', title: 'Next Song - Example Song 2' },
    { id: '3', title: 'Next Song - Example Song 3' },
  ];

  // Use the system color scheme (light or dark)
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
      {/* Title now uses the type 'title' to ensure correct styling */}
      <ThemedText type="title" style={styles.title}>Playlist</ThemedText>

      {/* Render playlist with dynamic background for boxes */}
      <FlatList
        data={playlist}
        renderItem={({ item }) => (
          <View style={[styles.songContainer, { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
            <ThemedText style={styles.song}>{item.title}</ThemedText>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start', // Ensure content starts below the title
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30, // Space below the title for better spacing
  },
  songContainer: {
    width: '100%',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3, // Add shadow on Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  song: {
    fontSize: 18,
  },
});