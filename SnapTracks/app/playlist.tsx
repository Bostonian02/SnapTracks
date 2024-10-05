import { View, FlatList, StyleSheet, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Playlist() {
  const playlist = [
    { id: '1', title: 'Current Song - Example Song 1' },
    { id: '2', title: 'Next Song - Example Song 2' },
    { id: '3', title: 'Next Song - Example Song 3' },
  ];

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
      <ThemedText type="title" style={styles.title}>Playlist</ThemedText>

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
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  songContainer: {
    width: '90%', // Adjust width to allow centering
    alignSelf: 'center', // Center the cells
    padding: 15,
    marginBottom: 20,
    marginHorizontal: 10, // Add horizontal margins to create space from the sides
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  song: {
    fontSize: 18,
  },
});