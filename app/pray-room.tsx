// pray-room.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
      { text: 'Peace in Canadian cities.', person: 'Noah', scope: 'localview' },
      { text: 'Support for new immigrants.', person: 'Ella', scope: 'localview' },
      { text: 'Opportunities for youth ministries.', person: 'Jake', scope: 'localview' },
      { text: 'Protection over first responders.', person: 'Maya', scope: 'localview' },
      { text: 'Growth of local churches.', person: 'Oliver', scope: 'localview' },
      { text: 'Political leaders to act with wisdom.', person: 'Emma', scope: 'localview' },
      { text: 'Spiritual awakening in Ontario.', person: 'Liam', scope: 'localview' }
    ]
  },
  {
    title: 'Inner View',
    scripture: 'Carry each other’s burdens. — Galatians 6:2',
    scope: 'innerview',
    icon: 'account-heart',
    requests: [
      { text: 'Healing for Sister Anne.', person: 'Chloe', scope: 'innerview' },
      { text: 'Brother Paul’s job search.', person: 'Max', scope: 'innerview' },
      { text: 'Guidance for the youth retreat.', person: 'Sophia', scope: 'innerview' },
      { text: 'Strength for the pastoral team.', person: 'James', scope: 'innerview' },
      { text: 'Financial provision for the Gomez family.', person: 'Nina', scope: 'innerview' },
      { text: 'Encouragement for new believers.', person: 'Isla', scope: 'innerview' },
      { text: 'Peace for those grieving.', person: 'Zoe', scope: 'innerview' }
    ]
  }
];

const ViewPanel = ({ title, scripture, requests, icon }: { title: string; scripture: string; requests: { text: string; person: string; scope: string; }[]; icon: string }) => {
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
          <View key={idx} style={styles.requestRow}>
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
  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}> 
      {requestData.map((view, index) => (
        <ViewPanel 
          key={index}
          title={view.title} 
          scripture={view.scripture} 
          requests={view.requests} 
          icon={view.icon} 
        />
      ))}
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
