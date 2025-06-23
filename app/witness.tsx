// witness.tsx - dedicated page for WITNESS (recording, transcription, prayer extraction)

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_CONFIG } from '@/config/apiConfig';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text } from 'react-native';

const OPENAI_API_KEY = API_CONFIG.OPENAI_API_KEY;

interface WordDetail {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

interface Segment {
  text: string;
  words?: WordDetail[];
}

interface TranscriptionResponse {
  text: string;
  segments?: Segment[];
}

interface ProblemWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  context_sentence: string;
}

export default function WitnessScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fullTranscript, setFullTranscript] = useState<string>('');
  const [problemWords, setProblemWords] = useState<ProblemWord[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);

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
      setProblemWords([]);
      setShowAnalysis(false);
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
        await transcribeWithOpenAI(uri);
      }

      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording:', error);
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API Error: ${response.status}`);
      }

      const result: TranscriptionResponse = await response.json();
      processTranscriptionResults(result);
    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert('Error', 'Failed to transcribe audio. Please check your API key and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processTranscriptionResults = (transcript: TranscriptionResponse) => {
    setFullTranscript(transcript.text);
    const problemWordsList: ProblemWord[] = [];

    if (transcript.segments && transcript.segments.length > 0) {
      transcript.segments.forEach(segment => {
        if (segment.words && segment.words.length > 0) {
          segment.words.forEach(word => {
            if (word.confidence < 0.85) {
              problemWordsList.push({
                word: word.word,
                start: word.start,
                end: word.end,
                confidence: word.confidence,
                context_sentence: segment.text
              });
            }
          });
        }
      });
    }

    setProblemWords(problemWordsList);
    setShowAnalysis(true);
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
          <ThemedText type="defaultSemiBold">Your Prayer Request:</ThemedText>
          <Text style={styles.transcriptText}>{fullTranscript}</Text>
        </ThemedView>
      )}

      {showAnalysis && (
        <ThemedView style={styles.analysisContainer}>
          <ThemedText type="defaultSemiBold">Pronunciation Analysis Report</ThemedText>
          <Text style={styles.reportHeader}>Total Problem Words Found: {problemWords.length}</Text>

          {problemWords.length > 0 ? (
            <ScrollView style={styles.problemWordsContainer}>
              {problemWords.map((word, index) => (
                <ThemedView key={index} style={styles.problemWordItem}>
                  <Text style={styles.problemWordTitle}>{index + 1}. WORD: {word.word.toUpperCase()}</Text>
                  <Text style={styles.problemWordDetail}>• Confidence: {word.confidence.toFixed(2)}/1.00</Text>
                  <Text style={styles.problemWordDetail}>• Position: {word.start.toFixed(2)}-{word.end.toFixed(2)} seconds</Text>
                  <Text style={styles.problemWordDetail}>• Context: "{word.context_sentence}"</Text>
                  <Text style={styles.problemWordDetail}>• Practice: Listen and repeat 5 times at this timestamp</Text>
                </ThemedView>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noProblemsText}>
              Great! No pronunciation problems detected. Your speech was clear and confident.
            </Text>
          )}
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
  analysisContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  reportHeader: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  problemWordsContainer: {
    maxHeight: 300,
  },
  problemWordItem: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#ff6b6b',
  },
  problemWordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 5,
  },
  problemWordDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
    paddingLeft: 10,
  },
  noProblemsText: {
    fontSize: 16,
    color: '#4caf50',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
});
