// PrayerRequestView.tsx
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const requestData = {
  worldView: {
    title: 'World View',
    scripture: 'Go into all the world and preach the gospel to all creation. — Mark 16:15',
    requests: [
      'Pray for missionaries in closed countries.',
      'Global peace in conflict zones.',
      'Revival in Asia and Europe.',
      'Protection for persecuted Christians.',
      'Unity among international churches.',
      'Wise leadership in the UN and NGOs.',
      'Healing and aid for global health crises.'
    ]
  },
  localView: {
    title: 'Local View',
    scripture: 'Seek the peace and prosperity of the city... Pray to the Lord for it. — Jeremiah 29:7',
    requests: [
      'Peace in Canadian cities.',
      'Support for new immigrants.',
      'Opportunities for youth ministries.',
      'Protection over first responders.',
      'Growth of local churches.',
      'Political leaders to act with wisdom.',
      'Spiritual awakening in Ontario.'
    ]
  },
  innerView: {
    title: 'Inner View',
    scripture: 'Carry each other’s burdens. — Galatians 6:2',
    requests: [
      'Healing for Sister Anne.',
      'Brother Paul’s job search.',
      'Guidance for the youth retreat.',
      'Strength for the pastoral team.',
      'Financial provision for the Gomez family.',
      'Encouragement for new believers.',
      'Peace for those grieving.'
    ]
  }
};

const ViewPanel = ({ title, scripture, requests }: { title: string; scripture: string; requests: string[] }) => {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.scriptureBox}>
        <Text style={styles.scripture}>{scripture}</Text>
      </View>
      <ScrollView style={styles.scrollArea}>
        {requests.map((req, idx) => (
          <Text key={idx} style={styles.request}>• {req}</Text>
        ))}
      </ScrollView>
    </View>
  );
};

export default function PrayerRequestView() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <ViewPanel 
        title={requestData.worldView.title} 
        scripture={requestData.worldView.scripture} 
        requests={requestData.worldView.requests} 
      />
      <ViewPanel 
        title={requestData.localView.title} 
        scripture={requestData.localView.scripture} 
        requests={requestData.localView.requests} 
      />
      <ViewPanel 
        title={requestData.innerView.title} 
        scripture={requestData.innerView.scripture} 
        requests={requestData.innerView.requests} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    paddingHorizontal: 10
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
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
  scrollArea: {
    maxHeight: 7 * 28 // approx 7 lines
  },
  request: {
    fontSize: 18,
    marginBottom: 6,
    color: '#222'
  }
});
