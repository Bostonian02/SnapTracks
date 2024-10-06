import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import { ThemedText } from '@/components/ThemedText';
import { Audio } from 'expo-av';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

export default function NowPlaying() {
  const [progress, setProgress] = useState(0.0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [songData, setSongData] = useState<any>(null);
  const [albumCover, setAlbumCover] = useState<string>('');
  const [songTitle, setSongTitle] = useState<string>('');
  const [songURL, setSongURL] = useState<string>('');
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    readFile();

    async function readFile() {
      try {
        const fileUri = FileSystem.documentDirectory + 'songs.json';
        const jsonString = await FileSystem.readAsStringAsync(fileUri);
        const data = JSON.parse(jsonString);
        setSongData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error reading file:', error);
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (songData && songData.songs) {
      const song = songData.songs[0];
      setAlbumCover(song.data['image_url']);
      setSongTitle(song.data['title']);
  
      // Use your provided code to format the audio URL correctly
      let audioUrl: string = song.data['audio_url'];
      const baseUrl = audioUrl.replace('audio/?item_id=', ''); 
      const formattedUrl = `${baseUrl}.mp3`;
      console.log(formattedUrl);
      setSongURL(formattedUrl);
    } else {
      console.log('Song data not set');
      setAlbumCover('https://www.example.com/default-image.jpg'); // Set a default image URL
    }
  }, [songData]);

  useEffect(() => {
    let soundObject: Audio.Sound;

    if (!songURL) {
      return; // If songURL is not set yet, do not proceed
    }

    async function fetchAndPlaySound() {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      try {
        const { sound, status } = await Audio.Sound.createAsync(
          { uri: songURL },
          { shouldPlay: true, progressUpdateIntervalMillis: 500 }
        );

        setSound(sound);
        setDuration(status.durationMillis ?? 0);
        soundObject = sound;

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && !isSliding) {
            setPosition(status.positionMillis ?? 0);
            setProgress((status.positionMillis ?? 0) / (status.durationMillis ?? 1));

            if (status.didJustFinish) {
              soundObject.replayAsync();
            }
          } else if (status.error) {
            console.error(`Playback Error: ${status.error}`);
          }
        });

        setIsPlaying(true);
      } catch (error) {
        console.error('Error downloading or playing sound: ', error);
      }
    }

    fetchAndPlaySound();

    return () => {
      if (soundObject) {
        soundObject.unloadAsync();
      }
    };
  }, [songURL]);

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
        console.error('Error with playback: ', error);
      }
    }
  };

  const handleSliderValueChange = (value) => {
    setProgress(value);
    setPosition(value * duration);
  };

  const handleSlidingStart = () => {
    setIsSliding(true);
  };

  const handleSlidingComplete = async (value) => {
    if (sound && duration) {
      const newPosition = value * duration;
      try {
        await sound.setPositionAsync(newPosition);
        setPosition(newPosition);
        setProgress(value);
      } catch (error) {
        console.error("Error setting playback position: ", error);
      }
      setIsSliding(false);
    }
  };

  const skipBackward = async () => {
    if (sound) {
      const newPosition = Math.max(position - 10000, 0); // Skip backward 10 seconds
      try {
        await sound.setPositionAsync(newPosition);
        setPosition(newPosition);
        setProgress(newPosition / duration);
      } catch (error) {
        console.error("Error skipping backward: ", error);
      }
    }
  };

  const skipForward = async () => {
    if (sound) {
      const newPosition = Math.min(position + 10000, duration); // Skip forward 10 seconds
      try {
        await sound.setPositionAsync(newPosition);
        setPosition(newPosition);
        setProgress(newPosition / duration);
      } catch (error) {
        console.error("Error skipping forward: ", error);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text>Loading song...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Queue Button in Top Right */}
      {/* <View style={styles.header}>
        <Link href="/playlist" asChild>
          <TouchableOpacity style={styles.queueButton}>
            <ThemedText style={styles.queueButtonText}>Queue</ThemedText>
          </TouchableOpacity>
        </Link>
      </View> */}

      {/* Album Cover and Song Info */}
      <Image source={{ uri: albumCover }} style={styles.albumCover} />
      <ThemedText style={styles.songName}>{songTitle}</ThemedText>
      <Text style={styles.timeText}>
        {`${Math.floor(position / 60000)}:${(Math.floor((position / 1000) % 60))
          .toString()
          .padStart(2, '0')} / ${Math.floor(duration / 60000)}:${(Math.floor((duration / 1000) % 60))
          .toString()
          .padStart(2, '0')}`}
      </Text>

      {/* Slider for Scrubbing */}
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={progress}
        minimumTrackTintColor="#6200ee"
        maximumTrackTintColor="#e0e0e0"
        thumbTintColor="#6200ee"
        onValueChange={handleSliderValueChange}
        onSlidingStart={handleSlidingStart}
        onSlidingComplete={handleSlidingComplete}
      />

      {/* Play/Pause and Skip Buttons */}
      <View style={styles.playPauseSkipButtonContainer}>
        <Pressable onPress={skipBackward}>
          <Ionicons name="play-back" size={48} color="#6200ee" />
        </Pressable>
        <Pressable onPress={togglePlayPause}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={48} color="#6200ee" />
        </Pressable>
        <Pressable onPress={skipForward}>
          <Ionicons name="play-forward" size={48} color="#6200ee" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff', // Optional: Set a background color
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
    borderRadius: 10, // Optional: Add border radius for aesthetics
  },
  songName: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timeText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  slider: {
    width: '90%',
    height: 40,
  },
  playPauseSkipButtonContainer: {
    flexDirection: 'row',
    width: '60%', // Adjust as needed
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});






// https://www.newburycomics.com/cdn/shop/products/Kendrick-Lamar-Good-Kid-MAAD-City-2LP-Vinyl-1764910_71b46ce0-409a-40fa-823f-dedb5c74eb35_1024x1024.jpeg?v=1437499389