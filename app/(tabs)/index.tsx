import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

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
          <ThemedText>
            {`Ice-breaking`}
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">WORSHIP</ThemedText>
        <ThemedText>
          {`Drawing our hearts to Jesus`}
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">WORD</ThemedText>
        <ThemedText>
          {`In tune with the source`}
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">WITNESS</ThemedText>
        <ThemedText>
          {`Let's get together around Jesus`}
        </ThemedText>
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
});