import {Text, View, Button, TouchableOpacity, StyleSheet} from 'react-native';
import React, { useState, useRef } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';

import { ThemedText } from '@/components/ThemedText';

import PreviewScreen from './previewscreen';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Encoding, setBase64Encoding] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

  if (!permission)
  {
    // Camera permissions are still loading
    return <View />
  }

  if (!permission.granted)
  {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <ThemedText style={styles.message}>We need your permission to show the camera</ThemedText>
        <Button onPress={requestPermission} title='Grant Permission'></Button>
      </View>
    );
  }

  // Change the direction the camera is facing
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  // Capture when the camera is ready
  function onCameraReady() {
    setIsCameraReady(true);
  }

  // Take a photo
  async function takePicture() {
    if (cameraRef.current && isCameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync({base64: true});
        console.log('Photo taken!');
        if (photo) {
          setImageUri(photo.uri);
          if (photo.base64)
          {
            setBase64Encoding(photo.base64);
          }
        }
        else
        {
          console.log('yur shit sucks, photo is not ready dumbass');
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
  function handleConfirmPhoto() {
    console.log('Photo confirmed:', imageUri);
    if (base64Encoding)
    {
      console.log('Base 64 encoding exists!');
      let description: Promise<any> = describeImage(base64Encoding);
      description
        .then((value) => {
          // Value is what the promise resolves to
          let data: Promise<any> = generateMusicPrompt(value);
          data
            .then((value) => {
              const fileUri = FileSystem.documentDirectory + 'songs.json';
              const jsonData = JSON.stringify(value, null, 2);
              console.log('File uri location:', fileUri);
              try {
                FileSystem.writeAsStringAsync(fileUri, jsonData);
                console.log('File has been saved as songs.json');
              } catch (error) {
                console.log('Error writing file:', error);
              }
            })
        })
        .catch((error) => {
          console.error('Promise rejected with error:', error);
        });
    }
    
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

  // Call the describe image API
  async function describeImage(base64Image: string)
  {
    const response = await fetch('https://eaa3-132-170-212-17.ngrok-free.app/describe_image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_base64: base64Image,
      }),
    });

    if (!response.ok)
    {
      console.log('Error:', response.statusText);
      return;
    }

    const data = await response.json();
    console.log('Image Description: ', data);
    return data;
  }

  // Call the generate music prompt API
  async function generateMusicPrompt(settingDescription: string)
  {
    const response = await fetch('https://eaa3-132-170-212-17.ngrok-free.app/generate_music', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        setting_description: settingDescription,
        location: 'Orlando',
        weather: 'Sunny',
        time_of_day: 'Middle of afternoon'
      })
    });

    if (!response.ok)
    {
      console.log('Error:', response.statusText);
      return;
    }

    const data = await response.json();
    return data;
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
    }}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        onCameraReady={onCameraReady}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <ThemedText style={{color: 'white'}}>Flip Camera</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <ThemedText style={{color: 'white'}}>Take Photo</ThemedText>
          </TouchableOpacity>
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
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    borderRadius: 5,
    paddingVertical: 15,
    marginHorizontal: 10,
  }
})