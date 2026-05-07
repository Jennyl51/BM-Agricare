import { View, Text, Pressable, StyleSheet, Animated, Switch } from 'react-native';
import type { Href } from 'expo-router';
import { useRouter, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { BM } from '@/constants/theme';
import { useApp } from '@/components/AppContext';

const tabs = [
  { name: 'home', route: '/home-retailers', icon: 'home' },
  { name: 'guides', route: '/tech_guidelines', icon: 'book-open' },
  { name: 'upload', route: '/points-transaction', icon: 'plus' },
  { name: 'rewards', route: '/rewards', icon: 'gift' },
  { name: 'user', route: '/users-retailers', icon: 'user' },
];

const quickLanguages = ['en', 'vi', 'th', 'zh'] as const;

function NavTab({ tab, active, onPress }: { tab: (typeof tabs)[number]; active: boolean; onPress: () => void }) {
  const { t } = useApp();
  const scale = useRef(new Animated.Value(1)).current;
  const bounce = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.86, useNativeDriver: true, speed: 30, bounciness: 8 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 13 }),
    ]).start();
    onPress();
  };

  return (
    <Pressable style={styles.tab} onPress={bounce} onHoverIn={() => Animated.spring(scale, { toValue: 1.08, useNativeDriver: true }).start()} onHoverOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}>
      <Animated.View style={[styles.iconWrap, active && styles.activeIconWrap, { transform: [{ scale }] }]}> 
        <Feather name={tab.icon as any} size={active && tab.name === 'upload' ? 31 : 22} color={active ? BM.green : '#FFFFFF'} />
      </Animated.View>
      <Text style={[styles.text, active && styles.activeText]}>{t(tab.name)}</Text>
    </Pressable>
  );
}

function SideQuickSettings() {
  const { darkMode, toggleDarkMode, language, setLanguage, t, theme } = useApp();
  const [open, setOpen] = useState(false);
  const slide = useRef(new Animated.Value(134)).current;

  useEffect(() => {
    Animated.spring(slide, { toValue: open ? 0 : 134, useNativeDriver: true, bounciness: 7, speed: 14 }).start();
  }, [open, slide]);

  const cycleLanguage = () => {
    const current = quickLanguages.indexOf(language as (typeof quickLanguages)[number]);
    const next = quickLanguages[(current + 1 + quickLanguages.length) % quickLanguages.length];
    setLanguage(next as any);
  };

  return (
    <Animated.View style={[styles.quickPanelWrap, { transform: [{ translateX: slide }] }]}> 
      <View style={[styles.quickPanel, { backgroundColor: theme.card, borderColor: theme.border }]}> 
        <Pressable style={styles.quickHandle} onPress={() => setOpen((v) => !v)}>
          <Feather name={open ? 'chevron-right' : 'chevron-left'} size={18} color="#FFFFFF" />
        </Pressable>
        <View style={styles.quickPanelInner}>
          <View style={styles.quickTitleRow}><Feather name="settings" size={16} color={BM.deepBlue} /><Text style={[styles.quickTitle, { color: theme.text }]}>{t('settings')}</Text></View>
          <View style={styles.quickRow}>
            <View style={styles.quickLabelWrap}><Feather name="moon" size={15} color={BM.green} /><Text style={[styles.quickLabel, { color: theme.text }]}>{t('darkMode')}</Text></View>
            <Switch value={darkMode} onValueChange={toggleDarkMode} />
          </View>
          <View style={styles.quickRow}>
            <View style={styles.quickLabelWrap}><Feather name="globe" size={15} color={BM.green} /><Text style={[styles.quickLabel, { color: theme.text }]}>{t('language')}</Text></View>
            <Pressable onPress={cycleLanguage} style={styles.languageToggle}><Text style={styles.languageToggleText}>{language.toUpperCase()}</Text></Pressable>
          </View>
          <Text style={[styles.quickHint, { color: theme.muted }]}>More account details live on the user page.</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <SideQuickSettings />
      <View style={[styles.nav, { backgroundColor: BM.deepBlue }]}> 
        {tabs.map((tab) => {
          const isActive = pathname === tab.route || (pathname === '/retailer-dashboard' && tab.name === 'home');
          return <NavTab key={tab.name} tab={tab} active={isActive} onPress={() => router.push(tab.route as Href)} />;
        })}
        <View style={styles.homeIndicator} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 96,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 14,
    paddingHorizontal: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: -5 },
    shadowRadius: 15,
    elevation: 12,
  },
  tab: { alignItems: 'center', justifyContent: 'center', flex: 1, gap: 4, minHeight: 56 },
  iconWrap: { width: 40, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  activeIconWrap: { backgroundColor: 'rgba(104,188,69,0.14)' },
  text: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  activeText: { color: BM.green, fontWeight: '900' },
  homeIndicator: { position: 'absolute', bottom: 8, alignSelf: 'center', width: 126, height: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.55)' },
  quickPanelWrap: { position: 'absolute', right: 0, bottom: 120, zIndex: 90 },
  quickPanel: { flexDirection: 'row', alignItems: 'stretch', borderWidth: 1, borderTopLeftRadius: 18, borderBottomLeftRadius: 18, borderTopRightRadius: 0, borderBottomRightRadius: 0, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.14, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, elevation: 10 },
  quickHandle: { width: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: BM.deepBlue },
  quickPanelInner: { width: 162, paddingHorizontal: 12, paddingVertical: 12 },
  quickTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  quickTitle: { fontSize: 13, fontWeight: '900' },
  quickRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 38 },
  quickLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
  quickLabel: { fontSize: 11.5, fontWeight: '800' },
  languageToggle: { backgroundColor: BM.green, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  languageToggleText: { color: '#FFFFFF', fontWeight: '900', fontSize: 10.5 },
  quickHint: { fontSize: 9.5, fontWeight: '700', marginTop: 6, lineHeight: 13 },
});
