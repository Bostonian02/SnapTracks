import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface PreviewScreenProps {
  imageUri: string;
  onRetake: () => void;
  onConfirm: () => void;
}

export default function PreviewScreen({ imageUri, onRetake, onConfirm }: PreviewScreenProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <Text style={styles.question}>Are you happy with your photo?</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={onRetake}>
          <Text style={styles.buttonText}>No, Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onConfirm}>
          <Text style={styles.buttonText}>Yes, I'm Happy</Text>
        </TouchableOpacity>
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
  },
  image: {
    width: '100%',
    height: '60%',
    borderRadius: 10,
  },
  question: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
