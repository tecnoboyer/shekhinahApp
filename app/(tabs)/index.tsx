// Full HomeScreen with all components and updated logic
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_CONFIG } from '@/config/apiConfig';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TouchableOpacity } from 'react-native';

const OPENAI_API_KEY = API_CONFIG.OPENAI_API_KEY;




export default function HomeScreen() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fullTranscript, setFullTranscript] = useState('');
  const [prayerRequests, setPrayerRequests] = useState<any[]>([]);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant microphone permission.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setFullTranscript('');
      setPrayerRequests([]);
    } catch (err) {
      console.error('Recording error:', err);
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
      if (uri) await transcribeWithOpenAI(uri);

      setRecording(null);
    } catch (err) {
      console.error('Stop recording error:', err);
      Alert.alert('Error', 'Failed to stop recording.');
      setIsProcessing(false);
    }
  };

  const transcribeWithOpenAI = async (audioUri: string) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/mp4',
        name: 'prayer_request.mp4',
      } as any);

      formData.append('model', 'whisper-1');
      formData.append('response_format', 'verbose_json');
      formData.append('timestamp_granularities', 'word');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();
      const transcription = result.text;
      setFullTranscript(transcription);

      const prayerJSON = await extractPrayerRequests(transcription);
      setPrayerRequests(prayerJSON.prayer_requests || []);

    } catch (err) {
      console.error('Transcription error:', err);
      Alert.alert('Error', 'Transcription failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const extractPrayerRequests = async (text: string) => {
    const payload = {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that extracts prayer requests from transcribed text.\nYour task is to:\n1. Identify all explicit prayer requests mentioned in the text.\n2. For each request, determine what the person needs prayer about (e.g., healing, guidance, strength).\n3. Return the results in JSON format:\n{\n  "prayer_requests": [\n    {\n      "request": "...",\n      "need": "...",\n      "details": "..."\n    }\n  ]\n}\nIf no explicit prayer requests are found, return: {"prayer_requests": []}`
        },
        {
          role: 'user',
          content: text
        }
      ]
    };

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    try {
      return JSON.parse(json.choices?.[0]?.message?.content);
    } catch (e) {
      console.warn('Could not parse prayer request response:', json);
      return { prayer_requests: [] };
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
          <ThemedText>Ice-breaking</ThemedText>
        </ThemedView>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/worship')} style={styles.clickableContainer}>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">WORSHIP</ThemedText>
          <ThemedText>Drawing our hearts to Jesus</ThemedText>
        </ThemedView>
      </TouchableOpacity>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">WORD</ThemedText>
        <ThemedText>In tune with the source</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">WITNESS</ThemedText>
        <ThemedText>Let's get together around Jesus</ThemedText>

        <Button
          title={
            isProcessing
              ? 'Processing...'
              : isRecording
                ? 'Stop Recording'
                : 'Record Prayer Request'
          }
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        />

        {fullTranscript !== '' && (
          <ThemedView style={styles.resultContainer}>
            <ThemedText type="defaultSemiBold">Transcript:</ThemedText>
            <Text>{fullTranscript}</Text>
          </ThemedView>
        )}

        {prayerRequests.length > 0 && (
          <ThemedView style={styles.resultContainer}>
            <ThemedText type="defaultSemiBold">Extracted Prayer Requests:</ThemedText>
            {prayerRequests.map((req, index) => (
              <Text key={index}>- {req.request} ({req.need}){req.details ? `\n${req.details}` : ''}</Text>
            ))}
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
  resultContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
});
