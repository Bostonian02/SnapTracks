import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, PanResponder } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import * as Progress from 'react-native-progress';
import { Audio } from 'expo-av';
import { Link } from 'expo-router';

export default function NowPlaying() {
  const [progress, setProgress] = useState(0.0);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);

  const albumCover = "https://www.newburycomics.com/cdn/shop/products/Kendrick-Lamar-Good-Kid-MAAD-City-2LP-Vinyl-1764910_71b46ce0-409a-40fa-823f-dedb5c74eb35_1024x1024.jpeg?v=1437499389";
  const songName = "Money Trees";
  const songURL = "https://cdn.aimlapi.com/suno/796a14db-4f53-4ffa-9dd9-ca1270d253ab.mp3"; // Example link

  useEffect(() => {
    let soundObject: any;

    async function fetchAndPlaySound() {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });

      try {
        // Load the sound
        const { sound, status } = await Audio.Sound.createAsync(
          { uri: songURL },
          { shouldPlay: true, progressUpdateIntervalMillis: 1000 }
        );

        setSound(sound);
        setDuration(status.durationMillis);
        soundObject = sound;

        // Subscribe to playback status updates
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setProgress(status.positionMillis / status.durationMillis);

            // Handle looping when the song ends
            if (status.didJustFinish) {
              soundObject.replayAsync();
            }
          } else if (status.error) {
            console.error(`Playback Error: ${status.error}`);
          }
        });
      } catch (error) {
        console.error("Error downloading or playing sound: ", error);
      }
    }

    fetchAndPlaySound();

    return () => {
      if (soundObject) {
        soundObject.unloadAsync();
      }
    };
  }, []);

  const togglePlayPause = async () => {
    if (sound) {
      try {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error("Error with playback: ", error);
      }
    }
  };

  const handleScrub = async (newProgress) => {
    if (sound && duration) {
      const newPosition = newProgress * duration;
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
      setProgress(newProgress);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setScrubbing(true);
    },
    onPanResponderMove: (_, gestureState) => {
      // Calculate the new progress based on drag position
      const newProgress = Math.min(Math.max(gestureState.moveX / 300, 0), 1); // Adjust 300 to match your progress bar width
      setProgress(newProgress);
    },
    onPanResponderRelease: () => {
      setScrubbing(false);
      handleScrub(progress); // Adjust the track position
    },
  });

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
      <Text>{`${Math.floor(position / 60000)}:${(Math.floor((position / 1000) % 60)).toString().padStart(2, '0')} / ${Math.floor(duration / 60000)}:${(Math.floor((duration / 1000) % 60)).toString().padStart(2, '0')}`}</Text>

      {/* Progress Bar with Scrubbing */}
      <View
        {...panResponder.panHandlers}
        style={{ width: '90%', height: 20, justifyContent: 'center', marginTop: 20 }}
      >
        <Progress.Bar
          progress={progress}
          width={null} // Full width of the container
          height={20}
          color="#6200ee"
          borderRadius={3}
        />
      </View>

      {/* Play/Pause Button */}
      <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
        <Text style={styles.playPauseButtonText}>{isPlaying ? "Pause" : "Play"}</Text>
      </TouchableOpacity>
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
  playPauseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#6200ee',
    borderRadius: 5,
  },
  playPauseButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});




// https://www.newburycomics.com/cdn/shop/products/Kendrick-Lamar-Good-Kid-MAAD-City-2LP-Vinyl-1764910_71b46ce0-409a-40fa-823f-dedb5c74eb35_1024x1024.jpeg?v=1437499389