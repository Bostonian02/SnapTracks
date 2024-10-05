import {Text, View, Button, TouchableOpacity, StyleSheet} from 'react-native';
import React, { useState, useRef } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

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
            <ThemedText>Flip Camera</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <ThemedText>Take Photo</ThemedText>
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
    backgroundColor: '#007AFF',
    borderRadius: 5,
    paddingVertical: 10,
    marginHorizontal: 10,
  }
})