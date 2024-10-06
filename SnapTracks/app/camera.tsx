import { Text, View, Button, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useState, useRef } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/ThemedText';

import PreviewScreen from './previewscreen';
import { useRouter } from 'expo-router'; // Import useRouter

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Encoding, setBase64Encoding] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const cameraRef = useRef<CameraView | null>(null);
  const router = useRouter(); // Initialize router

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <ThemedText style={styles.message}>We need your permission to show the camera</ThemedText>
        <Button onPress={requestPermission} title="Grant Permission"></Button>
      </View>
    );
  }

  // Change the direction the camera is facing
  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  // Capture when the camera is ready
  function onCameraReady() {
    setIsCameraReady(true);
  }

  // Take a photo
  async function takePicture() {
    if (cameraRef.current && isCameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true });
        console.log('Photo taken!');
        if (photo) {
          setImageUri(photo.uri);
          if (photo.base64) {
            setBase64Encoding(photo.base64);
          }
        } else {
          console.log('Photo is not ready.');
        }
      } catch (error) {
        console.log('Error taking picture:', error);
      }
    }
  }

  // Handle retaking photo
  function handleRetakePhoto() {
    setImageUri(null);
  }

  // Function when user confirms photo
  async function handleConfirmPhoto() {
    console.log('Photo confirmed:', imageUri);
    setLoading(true); // Start loading
    if (base64Encoding) {
      console.log('Base64 encoding exists!');
      try {
        // Describe the image
        const description = await describeImage(base64Encoding);

        // Generate music prompt
        const data = await generateMusicPrompt(description);

        // Save data to file
        const fileUri = FileSystem.documentDirectory + 'songs.json';
        const jsonData = JSON.stringify(data, null, 2);
        console.log('File uri location:', fileUri);
        await FileSystem.writeAsStringAsync(fileUri, jsonData);
        console.log('File has been saved as songs.json');

        // Extract and modify the audio URL
        let audioUrl = data.songs[0].data['audio_url'];
        const modifiedAudioUrl = modifyAudioUrl(audioUrl);
        console.log('Modified audio URL:', modifiedAudioUrl);

        // Wait until the URL is ready
        await waitForUrlReady(modifiedAudioUrl);

        // After the URL is ready, proceed
        setLoading(false); // Stop loading
        router.push('/nowplaying'); // Navigate to NowPlaying page
      } catch (error) {
        console.error('Error:', error);
        setLoading(false); // Stop loading even on error
      }
    } else {
      console.log('No base64 encoding available.');
      setLoading(false);
    }
  }

  function modifyAudioUrl(url: string) {
    const baseUrl = url.replace('audio/?item_id=', '');
    const formattedUrl = `${baseUrl}.mp3`;
    return formattedUrl;
  }

  async function waitForUrlReady(url: string, timeout = 300000, interval = 5000) {
    // Wait up to timeout milliseconds, checking every interval milliseconds
    const startTime = Date.now();
  
    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          // URL is ready
          console.log('Audio URL is ready.');
          return true;
        }
      } catch (error) {
        // Ignore errors and continue polling
        console.log('Waiting for audio URL to be ready...');
      }
      // Wait for interval milliseconds
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    // Timed out
    throw new Error('Audio URL did not become ready in time');
  }  

  // Call the describe image API
  async function describeImage(base64Image: string) {
    const response = await fetch('https://eaa3-132-170-212-17.ngrok-free.app/describe_image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_base64: base64Image,
      }),
    });

    if (!response.ok) {
      console.log('Error:', response.statusText);
      throw new Error(response.statusText);
    }

    const data = await response.json();
    console.log('Image Description: ', data);
    return data;
  }

  // Call the generate music prompt API
  async function generateMusicPrompt(settingDescription: string) {
    const response = await fetch('https://eaa3-132-170-212-17.ngrok-free.app/generate_music', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        setting_description: settingDescription,
        location: 'Orlando',
        weather: 'Sunny',
        time_of_day: 'Middle of afternoon',
      }),
    });

    if (!response.ok) {
      console.log('Error:', response.statusText);
      throw new Error(response.statusText);
    }

    const data = await response.json();
    return data;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text>Processing your image and generating music...</Text>
      </View>
    );
  }
  

  if (imageUri) {
    return (
      <PreviewScreen
        imageUri={imageUri}
        onRetake={handleRetakePhoto}
        onConfirm={handleConfirmPhoto}
      />
    );
  }

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        onCameraReady={onCameraReady}
      >
        <View style={styles.buttonContainer}>
          {/* Flip Camera Button */}
          <View style={styles.leftButton}>
            <TouchableOpacity onPress={toggleCameraFacing}>
              <Ionicons name="sync-circle" size={64} color="#6200ee"/>
            </TouchableOpacity>
          </View>

          {/* Take Picture Button */}
          <View style={styles.centerButton}>
            <TouchableOpacity onPress={takePicture}>
              <Ionicons name="scan-circle-outline" size={96} color="#6200ee" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  leftButton: {
    flex: 1,
    alignItems: 'flex-start'
  },
  centerButton: {
    flex: 1.78,
    alignItems: 'flex-start'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})