// // hooks/useFullScreen.ts
// import * as NavigationBar from 'expo-navigation-bar';
// import * as StatusBar from 'expo-status-bar';
// import { useEffect } from 'react';
// import { Platform } from 'react-native';

// export function useFullScreen() {
//   useEffect(() => {
//     if (Platform.OS === 'android') {
//       NavigationBar.setVisibilityAsync('hidden');
//       NavigationBar.setBehaviorAsync('inset-swipe');
//     }

//     StatusBar.setStatusBarHidden(true, 'slide');
//   }, []);
// }
