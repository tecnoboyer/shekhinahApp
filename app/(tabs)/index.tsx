import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
// Import your API configuration
// import { API_CONFIG } from '@/config/apiConfig';
import { API_CONFIG } from '@/config/apiConfig';

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

export default function HomeScreen() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Results state
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
      // Create FormData for the API call
      const formData = new FormData();
      
      // Add the audio file
      formData.append('file', {
        uri: audioUri,
        type: 'audio/mp4',
        name: 'prayer_request.mp4',
      } as any);
      
      // Add other parameters matching your Python example
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'verbose_json');
      formData.append('timestamp_granularities', 'word');

      console.log('Sending audio to OpenAI Whisper...');
      
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
        console.error('OpenAI API Error:', errorText);
        throw new Error(`OpenAI API Error: ${response.status}`);
      }

      const result: TranscriptionResponse = await response.json();
      console.log('Transcription result:', result);
      
      // Process the results just like your Python code
      processTranscriptionResults(result);
      
    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert('Error', 'Failed to transcribe audio. Please check your API key and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processTranscriptionResults = (transcript: TranscriptionResponse) => {
    // Save the full transcript (like your Python code)
    setFullTranscript(transcript.text);
    
    // Initialize problem words list
    const problemWordsList: ProblemWord[] = [];
    
    // Check if segments exist in the response (like your Python code)
    if (transcript.segments && transcript.segments.length > 0) {
      transcript.segments.forEach(segment => {
        // Check if words exist in the segment
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
    } else {
      console.log('Warning: No word-level timestamps available in the API response');
    }
    
    setProblemWords(problemWordsList);
    setShowAnalysis(true);
    
    // Log results like your Python code
    console.log('Successfully processed transcription:');
    console.log('- Full transcript length:', transcript.text.length);
    console.log('- Problem words found:', problemWordsList.length);
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
        <ThemedText>Let's get together around Jesus. Share your prayer request below:</ThemedText>
        
        <Button
          title={
            isProcessing 
              ? "Processing with OpenAI Whisper..." 
              : isRecording 
                ? "Stop Recording" 
                : "Record Prayer Request"
          }
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        />

        {/* Full Transcript Results */}
        {fullTranscript && (
          <ThemedView style={styles.resultContainer}>
            <ThemedText type="defaultSemiBold">Your Prayer Request:</ThemedText>
            <Text style={styles.transcriptText}>{fullTranscript}</Text>
          </ThemedView>
        )}

        {/* Pronunciation Analysis */}
        {showAnalysis && (
          <ThemedView style={styles.analysisContainer}>
            <ThemedText type="defaultSemiBold">Pronunciation Analysis Report</ThemedText>
            <Text style={styles.reportHeader}>
              Total Problem Words Found: {problemWords.length}
            </Text>
            
            {problemWords.length > 0 ? (
              <ScrollView style={styles.problemWordsContainer}>
                {problemWords.map((word, index) => (
                  <ThemedView key={index} style={styles.problemWordItem}>
                    <Text style={styles.problemWordTitle}>
                      {index + 1}. WORD: {word.word.toUpperCase()}
                    </Text>
                    <Text style={styles.problemWordDetail}>
                      • Confidence: {word.confidence.toFixed(2)}/1.00
                    </Text>
                    <Text style={styles.problemWordDetail}>
                      • Position: {word.start.toFixed(2)}-{word.end.toFixed(2)} seconds
                    </Text>
                    <Text style={styles.problemWordDetail}>
                      • Context: "{word.context_sentence}"
                    </Text>
                    <Text style={styles.problemWordDetail}>
                      • Practice: Listen and repeat 5 times at this timestamp
                    </Text>
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