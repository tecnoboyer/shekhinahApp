import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>Welcome</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Welcome to West Highland Church!</ThemedText>
          <ThemedText style={styles.text}>
            We are so glad you're here! Whether this is your first time visiting or you've been part of our community for years, 
            we want you to feel at home.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Our Heart</ThemedText>
          <ThemedText style={styles.text}>
            Our desire and motto is "To make the Word of God fully known and the people of God fully mature"! 
            We believe in creating a warm, welcoming environment where everyone can grow in their faith journey.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>What to Expect</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Friendly faces and warm greetings</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Meaningful worship and fellowship</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Biblical teaching that applies to daily life</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Opportunities to connect and serve</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>First Time Here?</ThemedText>
          <ThemedText style={styles.text}>
            Don't worry about not knowing what to do - we've all been there! Feel free to ask anyone for help, 
            and know that there's no pressure to participate in anything you're not comfortable with.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Connect With Us</ThemedText>
          <ThemedText style={styles.text}>
            We'd love to get to know you better! Look for our welcome team members, or feel free to introduce 
            yourself to anyone - we're all family here.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.welcomeBox}>
          <ThemedText style={styles.welcomeMessage}>
            "Come as you are, leave transformed by God's love"
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    marginBottom: 10,
    color: '#A1CEDC',
  },
  text: {
    lineHeight: 24,
    fontSize: 16,
  },
  bulletPoint: {
    marginLeft: 10,
    marginBottom: 5,
    lineHeight: 20,
  },
  welcomeBox: {
    backgroundColor: '#A1CEDC',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  welcomeMessage: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});