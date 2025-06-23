// witness.tsx - dedicated page for WITNESS (recording, transcription, prayer extraction)
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_CONFIG } from '@/config/apiConfig';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text } from 'react-native';



const OPENAI_API_KEY = API_CONFIG.OPENAI_API_KEY;

interface TranscriptionResponse {
  text: string;
}

interface PrayerRequest {
  extracted_text: string;
  need: string;
  prayer_request: string;
}

export default function WitnessScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fullTranscript, setFullTranscript] = useState<string>('');
  const [prayerRequest, setPrayerRequest] = useState<PrayerRequest | null>(null);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant microphone permission to use voice recording.');
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
      setPrayerRequest(null);
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
        console.log('Audio file saved at:', uri);
        await transcribeAndExtractPrayer(uri);
      }

      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
      setIsProcessing(false);
    }
  };

  const transcribeAndExtractPrayer = async (audioUri: string) => {
    try {
      const formData = new FormData();

      formData.append('file', {
        uri: audioUri,
        type: 'audio/mp4',
        name: 'prayer_request.mp4',
      } as any);

      formData.append('model', 'whisper-1');
      formData.append('response_format', 'verbose_json');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API Error: ${response.status}`);
      }

      const result: TranscriptionResponse = await response.json();
      setFullTranscript(result.text);

      const extraction = await extractPrayerRequest(result.text);
      setPrayerRequest(extraction);

    } catch (error) {
      console.error('Transcription or extraction error:', error);
      Alert.alert('Error', 'Failed to transcribe or extract prayer request.');
    } finally {
      setIsProcessing(false);
    }
  };

  const extractPrayerRequest = async (text: string): Promise<PrayerRequest> => {
    const prompt = `Extract a prayer request from the following text. Return only this JSON structure:
{
  "extracted_text": "",
  "need": "",
  "prayer_request": ""
}`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: text },
        ],
      }),
    });

    const json = await res.json();
    const parsed = JSON.parse(json.choices[0].message.content);
    return parsed;
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
        <ThemedText type="title">Witness</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedText type="subtitle">Let's get together around Jesus. Share your prayer request below:</ThemedText>

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

      {fullTranscript && (
        <ThemedView style={styles.resultContainer}>
          <ThemedText type="defaultSemiBold">Transcription:</ThemedText>
          <Text style={styles.transcriptText}>{fullTranscript}</Text>
        </ThemedView>
      )}

      {prayerRequest && (
        <ThemedView style={styles.resultContainer}>
          <ThemedText type="defaultSemiBold">Extracted Prayer Request:</ThemedText>
          <Text>• Text: {prayerRequest.extracted_text}</Text>
          <Text>• Need: {prayerRequest.need}</Text>
          <Text>• Prayer Request: {prayerRequest.prayer_request}</Text>
        </ThemedView>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    color: '#333',
  },
});
