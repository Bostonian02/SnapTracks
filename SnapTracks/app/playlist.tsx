import { View, FlatList, StyleSheet, useColorScheme, Image, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Playlist() {
  const playlist = [
    { id: '1', title: 'Current Song - Example Song 1', cover: 'https://via.placeholder.com/50' },
    { id: '2', title: 'Next Song - Example Song 2', cover: 'https://via.placeholder.com/50' },
    { id: '3', title: 'Next Song - Example Song 3', cover: 'https://via.placeholder.com/50' },
  ];

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const renderSong = ({ item }) => (
    <View style={styles.songContainer}>
      <Image source={{ uri: item.cover }} style={styles.coverImage}/>
      <Text style={styles.songTitle}>{item.title}</Text>
    </View>
  );
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
      <ThemedText type="title" style={styles.title}>Playlist</ThemedText>

      <FlatList
        data={playlist}
        renderItem={renderSong}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  coverImage: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  songTitle: {
    fontSize: 16,
    color: '#333',
    flexShrink: 1,
  },
  song: {
    fontSize: 18,
  },
});