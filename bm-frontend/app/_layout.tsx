import { Stack } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { AppProvider } from '@/components/AppContext';

export default function RootLayout() {
  return (
    <AppProvider>
      <View style={styles.stage}>
        <View style={styles.phoneFrame}>
          <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
        </View>
      </View>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: '#07110A',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
  },
  phoneFrame: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    overflow: 'hidden',
    backgroundColor: '#ECF8DD',
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'web' ? 0.35 : 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 22,
  },
});
