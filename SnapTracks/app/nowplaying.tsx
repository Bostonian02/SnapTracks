import { View, Text, Image, ProgressBarAndroid, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useState, useEffect } from 'react';
import { Link } from 'expo-router';

export default function NowPlaying() {
  const [progress, setProgress] = useState(0.4); // Placeholder progress value
  const albumCover = "https://www.newburycomics.com/cdn/shop/products/Kendrick-Lamar-Good-Kid-MAAD-City-2LP-Vinyl-1764910_71b46ce0-409a-40fa-823f-dedb5c74eb35_1024x1024.jpeg?v=1437499389"; // Replace with your album cover image
  const songName = "Money Trees";

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => Math.min(prevProgress + 0.01, 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Queue Button in Top Right */}
      <View style={styles.header}>
        <Link href="/playlist" asChild>
          <TouchableOpacity style={styles.queueButton}>
            <ThemedText style={styles.queueButtonText}>Queue</ThemedText>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Album Cover and Song Info */}
      <Image source={{ uri: albumCover }} style={styles.albumCover} />
      <ThemedText style={styles.songName}>{songName}</ThemedText>
      <Text>2:34 / 5:00</Text>

      {/* Wider Progress Bar */}
      <ProgressBarAndroid style={styles.progressBar} styleAttr="Horizontal" color="#6200ee" progress={progress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  queueButton: {
    padding: 10,
  },
  queueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  albumCover: {
    width: 330,
    height: 330,
    marginBottom: 20,
  },
  songName: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressBar: {
    width: '90%', // Wider progress bar
    height: 20,
    marginTop: 20,
  },
});



// https://www.newburycomics.com/cdn/shop/products/Kendrick-Lamar-Good-Kid-MAAD-City-2LP-Vinyl-1764910_71b46ce0-409a-40fa-823f-dedb5c74eb35_1024x1024.jpeg?v=1437499389