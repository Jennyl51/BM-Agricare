import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BM } from '@/constants/theme';
import { BackgroundBlobs, BounceButton } from '@/components/AgricareUI';
import { useApp } from '@/components/AppContext';

const languages = [
  ['en', 'English'], ['vi', 'Vietnamese'], ['th', 'Thai'], ['zh', 'Chinese'], ['es', 'Spanish'], ['fr', 'French'], ['ko', 'Korean'], ['ja', 'Japanese'],
] as const;

export default function SettingsPage() {
  const { theme, darkMode, toggleDarkMode, language, setLanguage } = useApp();
  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}> 
      <BackgroundBlobs />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.back} onPress={() => router.back()}><Feather name="arrow-left" size={28} color="#0A0908" /></Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>Control the app display without leaving your workflow.</Text>

        <View style={[styles.card, { backgroundColor: theme.card }]}> 
          <View style={styles.row}>
            <View style={styles.rowLeft}><Feather name="moon" size={20} color={BM.deepBlue} /><Text style={[styles.rowTitle, { color: theme.text }]}>Dark mode</Text></View>
            <Switch value={darkMode} onValueChange={toggleDarkMode} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card }]}> 
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Language</Text>
          <View style={styles.languageGrid}>
            {languages.map(([code, label]) => (
              <BounceButton key={code} onPress={() => setLanguage(code as any)} style={[styles.langButton, language === code && styles.langButtonActive]}>
                <Text style={[styles.langCode, language === code && styles.langCodeActive]}>{code.toUpperCase()}</Text>
                <Text style={[styles.langLabel, { color: language === code ? '#FFFFFF' : theme.text }]}>{label}</Text>
              </BounceButton>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 28, paddingTop: 52, paddingBottom: 44 },
  back: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 36, fontWeight: '900' },
  subtitle: { fontSize: 13, fontWeight: '700', marginTop: 6, lineHeight: 18, marginBottom: 22 },
  card: { borderRadius: 26, borderWidth: 1.5, borderColor: '#0A0908', padding: 18, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.13, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, elevation: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowTitle: { fontSize: 17, fontWeight: '900' },
  sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 12 },
  languageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  langButton: { width: '47%', borderRadius: 18, backgroundColor: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 10, alignItems: 'center' },
  langButtonActive: { backgroundColor: BM.deepBlue },
  langCode: { color: BM.green, fontSize: 12, fontWeight: '900' },
  langCodeActive: { color: '#FFFFFF' },
  langLabel: { fontSize: 10, fontWeight: '800', marginTop: 3 },
});
