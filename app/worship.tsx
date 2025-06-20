import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width, height } = Dimensions.get('window');
const VIMEO_VIDEO_ID = '1093813765';
const VIMEO_HASH = 'h=ac25568371';
const YOUTUBE_VIDEO_ID = 'youaORF2SK4';

export default function WorshipScreen() {
  const router = useRouter();
  const [playing, setPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const [error, setError] = useState(null);

  // Handle player state changes
  const onStateChange = useCallback((state) => {
    console.log('YouTube Player State:', state);
    
    switch (state) {
      case 'playing':
        setPlaying(true);
        setIsLoading(false);
        break;
      case 'paused':
        setPlaying(false);
        break;
      case 'ended':
        setPlaying(false);
        break;
      case 'buffering':
        setIsLoading(true);
        break;
      case 'unstarted':
        setIsLoading(false);
        break;
      default:
        break;
    }
  }, []);

  // Handle player ready state
  const onReady = useCallback(() => {
    console.log('YouTube Player Ready');
    setPlayerReady(true);
    setIsLoading(false);
  }, []);

  // Handle player errors
  const onError = useCallback((error) => {
    console.error('YouTube Player Error:', error);
    setError(error);
    setIsLoading(false);
    
    // Show user-friendly error message
    Alert.alert(
      'Video Error',
      'Unable to load the video. Please check your internet connection and try again.',
      [
        { text: 'Retry', onPress: () => {
          setError(null);
          setIsLoading(true);
          setPlayerReady(false);
        }},
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }, []);

  // Auto-play after player is ready (optional)
  useEffect(() => {
    if (playerReady && !playing) {
      // Small delay to ensure player is fully initialized
      const timer = setTimeout(() => {
        setPlaying(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [playerReady, playing]);

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.title}>WORSHIP</Text>
    </View>
  );

  // Web platform - use Vimeo
  if (Platform.OS === 'web') {
    return (
      <View style={styles.fullScreenContainer}>
        <Header />
        <View style={styles.webVideoContainer}>
          <iframe
            src={`https://player.vimeo.com/video/${VIMEO_VIDEO_ID}?${VIMEO_HASH}&autoplay=1&muted=0&controls=1`}
            style={styles.webIframe}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            allowFullScreen
            title="Worship Video"
          />
        </View>
      </View>
    );
  }

  // Mobile platforms - use YouTube
  return (
    <View style={styles.fullScreenContainer}>
      <Header />
      
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#FF6B6B" />
          <Text style={styles.errorText}>Failed to load video</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setIsLoading(true);
              setPlayerReady(false);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {isLoading && !playerReady && (
            <View style={styles.loadingOverlay}>
              <Ionicons name="hourglass" size={60} color="#A1CEDC" />
              <Text style={styles.loadingText}>Loading worship video...</Text>
            </View>
          )}
          
          <View style={styles.playerContainer}>
            <YoutubePlayer
              height={Platform.select({
                android: height * 0.9, // Slightly reduce height on Android
                ios: height
              })}
              width={width}
              play={playing}
              videoId={YOUTUBE_VIDEO_ID}
              onChangeState={onStateChange}
              onReady={onReady}
              onError={onError}
              volume={100}
              playbackRate={1}
              playerParams={{
                cc_lang_pref: 'en',
                showClosedCaptions: false,
                preventFullScreen: false,
                loop: false,
                controls: true,
                modestbranding: true,
                rel: false,
                showinfo: false
              }}
              webViewStyle={styles.webViewStyle}
              webViewProps={{
                androidLayerType: Platform.OS === 'android' ? 'hardware' : 'none',
                allowsFullscreenVideo: true,
                mediaPlaybackRequiresUserAction: false,
                javaScriptEnabled: true,
                domStorageEnabled: true,
                startInLoadingState: true,
                allowsInlineMediaPlayback: true,
                allowsAirPlayForMediaPlayback: true,
                bounces: false,
                scrollEnabled: false,
              }}
            />
          </View>

          {/* Manual play button for Android compatibility */}
          {!playing && playerReady && (
            <TouchableOpacity 
              style={styles.playButton}
              onPress={() => setPlaying(true)}
            >
              <View style={styles.playButtonContent}>
                <Ionicons name="play" size={24} color="#FFFFFF" />
                <Text style={styles.playButtonText}>Play Video</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Video controls overlay */}
          {playing && (
            <TouchableOpacity 
              style={styles.pauseButton}
              onPress={() => setPlaying(false)}
            >
              <Ionicons name="pause" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </>
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
    marginTop: 60,
  },
  webIframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.select({ ios: 0, android: 60 }),
  },
  webViewStyle: {
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 5,
  },
  loadingText: {
    color: '#A1CEDC',
    marginTop: 20,
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#A1CEDC',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playButton: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 6,
  },
  playButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  pauseButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 25,
    padding: 15,
    zIndex: 6,
  },
});