import { Ionicons } from '@expo/vector-icons';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');
const VIMEO_VIDEO_ID = '1093813765';
const VIMEO_HASH = 'h=ac25568371'; // From your URL

export default function WorshipScreen() {
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>({ isLoaded: false });
  const [error, setError] = useState('');
  const [videoUri, setVideoUri] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Direct Vimeo URL pattern with hash
        const directUrl = `https://player.vimeo.com/video/${VIMEO_VIDEO_ID}?${VIMEO_HASH}&autoplay=1`;
        
        // Test if the URL is accessible
        const response = await fetch(directUrl, { method: 'HEAD' });
        if (response.ok) {
          setVideoUri(directUrl);
        } else {
          // Fallback to standard embed URL
          setVideoUri(`https://player.vimeo.com/video/${VIMEO_VIDEO_ID}?autoplay=1`);
        }
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Failed to load video');
        setVideoUri(`https://player.vimeo.com/video/${VIMEO_VIDEO_ID}?autoplay=1`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoUrl();
  }, []);

  // Web-specific render
  if (Platform.OS === 'web') {
    return (
      <View style={styles.fullScreenContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>WORSHIP</Text>
        </View>
        
        <View style={styles.webVideoContainer}>
          <iframe
            src={`https://player.vimeo.com/video/${VIMEO_VIDEO_ID}?${VIMEO_HASH}&autoplay=1`}
            style={styles.webIframe}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </View>
      </View>
    );
  }

  // Mobile render
  return (
    <View style={styles.fullScreenContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>WORSHIP</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass" size={60} color="#A1CEDC" />
          <Text style={styles.loadingText}>Loading worship video...</Text>
        </View>
      ) : (
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: videoUri }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          onError={(error) => {
            console.error('Video error:', error);
            setError('Video playback failed');
          }}
          onReadyForDisplay={() => setIsLoading(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    width: '100%',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: Platform.select({ ios: 50, android: 30 }),
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  backButton: {
    marginRight: 15,
    zIndex: 11,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  webVideoContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    marginTop: Platform.select({ web: 60, default: 0 }),
  },
  webIframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#A1CEDC',
    marginTop: 20,
    fontSize: 18,
  },
});