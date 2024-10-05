import {Text, View, Button, TouchableOpacity} from 'react-native';
import React, { useState } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

import { ThemedText } from '@/components/ThemedText';

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission)
  {
    // Camera permissions are still loading
    return <View />
  }

  if (!permission.granted)
  {
    // Camera permissions are not granted yet
    return (
      <View>
        <ThemedText>We need your permission to show the camera</ThemedText>
        <Button onPress={requestPermission} title='Grant Permission'></Button>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    }}>
      <CameraView facing={facing}>
        <View>
          <TouchableOpacity onPress={toggleCameraFacing}>
            <ThemedText>Flip Camera</ThemedText>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}