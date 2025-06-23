import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const startRecording = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant microphone permission to use voice recording.');
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setResults([]);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        // Here you would typically send the audio file to a speech-to-text service
        // For demonstration, we'll show a placeholder result
        setTimeout(() => {
          setResults(['This is a placeholder for your transcribed prayer request. In a real implementation, this would be the result from a speech-to-text service like Google Cloud Speech-to-Text, AWS Transcribe, or Azure Speech Services.']);
          setIsProcessing(false);
        }, 2000);
        
        // Example of how you might send to a cloud service:
        /*
        const base64Audio = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Send to your preferred speech-to-text API
        const response = await fetch('YOUR_SPEECH_TO_TEXT_ENDPOINT', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_API_KEY',
          },
          body: JSON.stringify({
            audio: base64Audio,
            format: 'mp4', // or whatever format you're using
          }),
        });
        
        const result = await response.json();
        setResults([result.transcript]);
        */
      }
      
      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
      setIsProcessing(false);
    }
  };

  const handleWelcomePress = () => {
    router.push('/welcome');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/WestHighlandLogo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">West Highland Church</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView>
        <ThemedText type="subtitle">Our desire and motto is "To make the Word of God fully known and the people of God fully mature"!</ThemedText>
      </ThemedView>

      <TouchableOpacity onPress={handleWelcomePress} style={styles.clickableContainer}>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">WELCOME</ThemedText>
          <ThemedText>
            {`Ice-breaking`}
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/worship')} style={styles.clickableContainer}>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">WORSHIP</ThemedText>
          <ThemedText>
            {`Drawing our hearts to Jesus`}
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">WORD</ThemedText>
        <ThemedText>
          {`In tune with the source`}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">WITNESS</ThemedText>
        <ThemedText>
          {`Let's get together around Jesus. Share your prayer request below:`}
        </ThemedText>
        <Button
          title={
            isProcessing 
              ? "Processing..." 
              : isRecording 
                ? "Stop Recording" 
                : "Record Prayer Request"
          }
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        />
        {results.length > 0 && (
          <ThemedView style={{marginTop: 10}}>
            <ThemedText type="defaultSemiBold">Your Prayer Request:</ThemedText>
            <Text style={styles.prayerText}>{results[0]}</Text>
          </ThemedView>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  clickableContainer: {
    borderRadius: 8,
    padding: 4,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  prayerText: {
    fontSize: 16,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginTop: 5,
  },
});