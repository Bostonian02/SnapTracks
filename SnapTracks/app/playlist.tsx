import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function Playlist() {
  const playlist = [
    { id: '1', title: 'Current Song - Example Song 1' },
    { id: '2', title: 'Next Song - Example Song 2' },
    { id: '3', title: 'Next Song - Example Song 3' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ThemedText type="title">Playlist</ThemedText>

        <FlatList
          data={playlist}
          renderItem={({ item }) => (
            <View style={styles.songContainer}>
              <Text style={styles.song}>{item.title}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white', // Ensure background color matches
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  songContainer: {
    width: '100%',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  song: {
    fontSize: 18,
    color: '#333',
  },
});

