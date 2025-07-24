import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const requestData = [
  {
    title: 'World View',
    scripture: 'Go into all the world and preach the gospel to all creation. — Mark 16:15',
    scope: 'worldview',
    icon: 'earth',
    requests: [
      { text: 'Pray for missionaries in closed countries.', person: 'Alice', scope: 'worldview' },
      { text: 'Global peace in conflict zones.', person: 'John', scope: 'worldview' },
      { text: 'Revival in Asia and Europe.', person: 'Maria', scope: 'worldview' },
      { text: 'Protection for persecuted Christians.', person: 'Luke', scope: 'worldview' },
      { text: 'Unity among international churches.', person: 'Sarah', scope: 'worldview' },
      { text: 'Wise leadership in the UN and NGOs.', person: 'Peter', scope: 'worldview' },
      { text: 'Healing and aid for global health crises.', person: 'Lea', scope: 'worldview' }
    ]
  },
  {
    title: 'Local View',
    scripture: 'Seek the peace and prosperity of the city... Pray to the Lord for it. — Jeremiah 29:7',
    scope: 'localview',
    icon: 'map-marker-radius',
    requests: [
      { text: 'Peace in Canadian cities.', person: 'Noah' },
      { text: 'Support for new immigrants.', person: 'Ella' },
      { text: 'Opportunities for youth ministries.', person: 'Jake' },
      { text: 'Protection over first responders.', person: 'Maya' },
      { text: 'Growth of local churches.', person: 'Oliver' },
      { text: 'Political leaders to act with wisdom.', person: 'Emma' },
      { text: 'Spiritual awakening in Ontario.', person: 'Liam' }
    ]
  },
  {
    title: 'Inner View',
    scripture: 'Carry each other is burdens. — Galatians 6:2',
    scope: 'innerview',
    icon: 'account-heart',
    requests: [
      { text: 'Healing for Sister Anne.', person: 'Chloe', scope: 'innerview' },
      { text: 'Brother Paul is job search.', person: 'Max', scope: 'innerview' },
      { text: 'Guidance for the youth retreat.', person: 'Sophia', scope: 'innerview' },
      { text: 'Strength for the pastoral team.', person: 'James', scope: 'innerview' },
      { text: 'Financial provision for the Gomez family.', person: 'Nina', scope: 'innerview' },
      { text: 'Encouragement for new believers.', person: 'Isla', scope: 'innerview' },
      { text: 'Peace for those grieving.', person: 'Zoe', scope: 'innerview' }
    ]
  }
];

const ViewPanel = ({ title, scripture, requests, icon, currentRequestIndex }: 
  { title: string; scripture: string; requests: { text: string; person: string; scope: string; }[]; 
    icon: string; currentRequestIndex?: number }) => {
  return (
    <View style={styles.panel}>
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name={icon} size={24} color="#333" style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.scriptureBox}>
        <Text style={styles.scripture}>{scripture}</Text>
      </View>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>Request</Text>
        <Text style={styles.tableHeaderText}>Requested By</Text>
      </View>
      <ScrollView style={styles.scrollArea}>
        {requests.map((req, idx) => (
          <View key={idx} style={[
            styles.requestRow,
            currentRequestIndex === idx && styles.activeRequestRow
          ]}>
            <Text style={styles.requestText}>{req.text}</Text>
            <Text style={styles.personText}>{req.person}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default function PrayerRequestView() {
  const insets = useSafeAreaInsets();
  const worldViewRequests = requestData[0].requests;
  const [currentRequestIndex, setCurrentRequestIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const scrollX = useRef(new Animated.Value(0)).current;
  const requestTextWidth = useRef(0);
  const containerWidth = useRef(0);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const startAnimation = () => {
    const currentRequest = worldViewRequests[currentRequestIndex];
    const textLength = currentRequest.text.length;
    const baseDuration = textLength * 150;
    const adjustedDuration = baseDuration / 0.2; // Fixed at 0.2x speed

    animationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scrollX, {
          toValue: containerWidth.current,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(scrollX, {
          toValue: -requestTextWidth.current,
          duration: adjustedDuration,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ]),
      { iterations: 1 }
    );

    animationRef.current.start(({ finished }) => {
      if (finished && isPlaying) {
        setCurrentRequestIndex(prev => 
          (prev + 1) % worldViewRequests.length
        );
      }
    });
  };

  useEffect(() => {
    if (isPlaying) {
      startAnimation();
    } else {
      animationRef.current?.stop();
    }

    return () => {
      animationRef.current?.stop();
    };
  }, [currentRequestIndex, isPlaying]);

  const handlePrevious = () => {
    setCurrentRequestIndex(prev => 
      (prev - 1 + worldViewRequests.length) % worldViewRequests.length
    );
  };

  const handleNext = () => {
    setCurrentRequestIndex(prev => 
      (prev + 1) % worldViewRequests.length
    );
  };

  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const currentRequest = worldViewRequests[currentRequestIndex];

  return (
    <View style={styles.fullScreenContainer}>
      {/* Only render StatusBar on native platforms */}
      {Platform.OS !== 'web' && (
        <RNStatusBar translucent backgroundColor="transparent" />
      )}
      
      {/* Teleprompter Bar */}
      <View style={[styles.teleprompterBar, { marginTop: Platform.OS === 'web' ? 0 : insets.top }]}>
        <View 
          style={styles.teleprompterTrack}
          onLayout={(event) => {
            containerWidth.current = event.nativeEvent.layout.width;
          }}
        >
          <Animated.Text 
            style={[
              styles.teleprompterText,
              { transform: [{ translateX: scrollX }] }
            ]}
            onLayout={(event) => {
              requestTextWidth.current = event.nativeEvent.layout.width;
            }}
          >
            {`${currentRequest.text} — ${currentRequest.person}`}
          </Animated.Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlRow}>
          <TouchableOpacity onPress={handlePrevious} style={styles.controlButton}>
            <MaterialIcons name="skip-previous" size={24} color="#1D3D47" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handlePlayPause} style={styles.controlButton}>
            <MaterialIcons name={isPlaying ? "pause" : "play-arrow"} size={32} color="#1D3D47" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
            <MaterialIcons name="skip-next" size={24} color="#1D3D47" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.currentRequestInfo}>
          {currentRequestIndex + 1}/{worldViewRequests.length}: {currentRequest.person}
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      > 
        {requestData.map((view, index) => (
          <ViewPanel 
            key={index}
            title={view.title} 
            scripture={view.scripture} 
            requests={view.requests} 
            icon={view.icon}
            currentRequestIndex={index === 0 ? currentRequestIndex : undefined}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  teleprompterBar: {
    backgroundColor: '#1D3D47',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#A1CEDC',
    zIndex: 1,
  },
  teleprompterTrack: {
    height: 24,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  teleprompterText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    position: 'absolute',
  },
  controlsContainer: {
    backgroundColor: 'rgba(161, 206, 220, 0.3)',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#A1CEDC',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  controlButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  currentRequestInfo: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 14,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  panel: {
    backgroundColor: '#ffffff',
    marginVertical: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  icon: {
    marginRight: 8
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333'
  },
  scriptureBox: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#EEF2F7',
    borderRadius: 8
  },
  scripture: {
    fontStyle: 'italic',
    fontSize: 16,
    color: '#555'
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#444',
    flex: 1
  },
  scrollArea: {
    maxHeight: 7 * 32
  },
  requestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  activeRequestRow: {
    backgroundColor: 'rgba(29, 61, 71, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#1D3D47',
  },
  requestText: {
    fontSize: 16,
    flex: 1,
    color: '#222'
  },
  personText: {
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
    color: '#666'
  }
});