import { View, Text, Pressable, StyleSheet, Animated, Switch, Image } from 'react-native';
import type { Href } from 'expo-router';
import { useRouter, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BM } from '@/constants/theme';
import { useApp } from '@/components/AppContext';
import { getUserMe } from '@/services/userApi';

type Tab = { name: string; label?: string; route: string; icon: keyof typeof Feather.glyphMap };

type Me = {
  name?: string;
  username?: string;
  email?: string;
  total_points?: number;
  tier?: string;
  pending_invoices?: number;
  completed_invoices?: number;
  total_invoices?: number;
  region?: string;
  user_type?: string;
};

const retailerTabs: Tab[] = [
  { name: 'home', route: '/home-retailers', icon: 'home' },
  { name: 'guides', route: '/tech_guidelines', icon: 'book-open' },
  { name: 'upload', route: '/points-transaction', icon: 'plus' },
  { name: 'rewards', route: '/rewards', icon: 'gift' },
  { name: 'user', route: '/users-retailers', icon: 'user' },
];

const tceTabs: Tab[] = [
  { name: 'tasks', label: 'tasks', route: '/tce-dashboard', icon: 'home' },
  { name: 'retailers', label: 'retailers', route: '/map', icon: 'users' },
  { name: 'invoices', label: 'invoices', route: '/invoices', icon: 'plus' },
  { name: 'user', label: 'user', route: '/profile', icon: 'user' },
  { name: 'consultation', label: 'consultation', route: '/consulation-request', icon: 'message-circle' },
];

const quickLanguages = ['en', 'vi', 'th', 'zh'] as const;

function NavTab({ tab, active, onPress }: { tab: Tab; active: boolean; onPress: () => void }) {
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
        <Feather name={tab.icon} size={active && tab.icon === 'plus' ? 30 : 22} color={active ? BM.green : '#FFFFFF'} />
      </Animated.View>
      <Text numberOfLines={1} style={[styles.text, active && styles.activeText]}>{tab.label || t(tab.name)}</Text>
    </Pressable>
  );
}

function SideQuickSettings() {
  const { darkMode, toggleDarkMode, language, setLanguage, t, theme } = useApp();
  const router = useRouter();
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
          <Pressable style={styles.quickTitleRow} onPress={() => router.push('/settings' as Href)}>
            <Feather name="settings" size={16} color={BM.deepBlue} />
            <Text style={[styles.quickTitle, { color: theme.text }]}>{t('settings')}</Text>
            <Feather name="arrow-up-right" size={12} color={BM.green} />
          </Pressable>
          <View style={styles.quickRow}>
            <View style={styles.quickLabelWrap}><Feather name="moon" size={15} color={BM.green} /><Text style={[styles.quickLabel, { color: theme.text }]}>{t('darkMode')}</Text></View>
            <Switch value={darkMode} onValueChange={toggleDarkMode} />
          </View>
          <View style={styles.quickRow}>
            <View style={styles.quickLabelWrap}><Feather name="globe" size={15} color={BM.green} /><Text style={[styles.quickLabel, { color: theme.text }]}>{t('language')}</Text></View>
            <Pressable onPress={cycleLanguage} style={styles.languageToggle}><Text style={styles.languageToggleText}>{language.toUpperCase()}</Text></Pressable>
          </View>
          <Text style={[styles.quickHint, { color: theme.muted }]}>Tap Settings for the full page.</Text>
        </View>
      </View>
    </Animated.View>
  );
}


const navCropSprites = [
  require('@/assets/fall_images/cocoa_fall_1.png'),
  require('@/assets/fall_images/coconut_fall_1.png'),
  require('@/assets/fall_images/corn_fall_2.png'),
  require('@/assets/fall_images/rice_fall_2.png'),
];

const navTierSprites = {
  starter: require('@/assets/fall_images/gold_fall.png'),
  gold: require('@/assets/fall_images/gold_fall.png'),
  emerald: require('@/assets/fall_images/emerald_fall.png'),
  diamond: require('@/assets/fall_images/diamond_fall.png'),
};

function normalizeTierForSprite(tier?: string): keyof typeof navTierSprites {
  const lower = String(tier || '').toLowerCase();
  if (lower.includes('diamond')) return 'diamond';
  if (lower.includes('emerald')) return 'emerald';
  if (lower.includes('gold')) return 'gold';
  return 'starter';
}

function BouncingNavSprite({ source, width, height, index, size = 22 }: { source: any; width: number; height: number; index: number; size?: number }) {
  const x = useRef(new Animated.Value(Math.random() * Math.max(width - size, 1))).current;
  const y = useRef(new Animated.Value(Math.random() * Math.max(height - size, 1))).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!width || !height) return;
    let mounted = true;

    const move = () => {
      if (!mounted) return;
      rotate.setValue(0);
      Animated.parallel([
        Animated.timing(x, {
          toValue: Math.random() * Math.max(width - size, 1),
          duration: 1250 + Math.random() * 850,
          useNativeDriver: true,
        }),
        Animated.timing(y, {
          toValue: Math.random() * Math.max(height - size, 1),
          duration: 1250 + Math.random() * 850,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 1250 + Math.random() * 850,
          useNativeDriver: true,
        }),
      ]).start(() => move());
    };

    const kickoff = setTimeout(move, index * 120);
    return () => {
      mounted = false;
      clearTimeout(kickoff);
      x.stopAnimation();
      y.stopAnimation();
      rotate.stopAnimation();
    };
  }, [height, index, rotate, size, width, x, y]);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', index % 2 ? '-35deg' : '35deg'] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.bouncingSprite,
        {
          width: size,
          height: size,
          transform: [{ translateX: x }, { translateY: y }, { rotate: spin }],
        },
      ]}
    >
      <Image source={source} style={styles.bouncingSpriteImage} />
    </Animated.View>
  );
}

function BouncingNavSprites({ tier, isTce }: { tier?: string; isTce: boolean }) {
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const tierSprite = navTierSprites[normalizeTierForSprite(tier)];
  const sprites = isTce ? navCropSprites : [...navCropSprites, tierSprite, tierSprite];

  return (
    <View
      pointerEvents="none"
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setBounds({ width, height });
      }}
      style={styles.bouncingSpriteBox}
    >
      {bounds.width > 0 && bounds.height > 0
        ? sprites.map((sprite, index) => (
            <BouncingNavSprite
              key={`${index}-${normalizeTierForSprite(tier)}`}
              source={sprite}
              width={bounds.width}
              height={bounds.height}
              index={index}
              size={index >= navCropSprites.length ? 24 : 19 + (index % 2) * 3}
            />
          ))
        : null}
    </View>
  );
}

function AnimatedTopBackground() {
  const drift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(drift, { toValue: 1, duration: 3600, useNativeDriver: true }),
      Animated.timing(drift, { toValue: 0, duration: 3600, useNativeDriver: true }),
    ])).start();
  }, [drift]);
  const x = drift.interpolate({ inputRange: [0, 1], outputRange: [-18, 18] });
  const y = drift.interpolate({ inputRange: [0, 1], outputRange: [0, 12] });
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.topBlobOne, { transform: [{ translateX: x }, { translateY: y }] }]} />
      <Animated.View style={[styles.topBlobTwo, { transform: [{ translateX: Animated.multiply(x, -1) }, { translateY: Animated.multiply(y, -1) }] }]} />
      <Animated.View style={[styles.topShine, { transform: [{ translateX: Animated.multiply(x, 0.4) }] }]} />
    </View>
  );
}

function RoleTopNav({ isTce }: { isTce: boolean }) {
  const router = useRouter();
  const { theme } = useApp();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    let mounted = true;
    getUserMe().then((data) => mounted && setMe(data)).catch(() => mounted && setMe(null));
    return () => { mounted = false; };
  }, []);

  const displayName = me?.name || (isTce ? 'TCE User' : 'Retailer User');
  const initials = useMemo(() => displayName.split(' ').filter(Boolean).slice(0, 2).map((x) => x[0]).join('').toUpperCase() || 'BM', [displayName]);
  const activeInvoices = Number(me?.pending_invoices ?? (isTce ? 8 : 2));
  const points = Number(me?.total_points ?? 7809);
  const tier = me?.tier || (isTce ? 'Staff' : 'Gold');

  return (
    <View style={styles.topNavWrap} pointerEvents="box-none">
      <View style={[styles.topNav, { backgroundColor: theme.card, borderColor: '#0A0908' }]}> 
        <AnimatedTopBackground />
        <BouncingNavSprites tier={tier} isTce={isTce} />
        <Pressable style={styles.identity} onPress={() => router.push((isTce ? '/profile' : '/users-retailers') as Href)}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={[styles.helloText, { color: theme.text }]}>Hi, {displayName.split(' ')[0]}</Text>
            <Text numberOfLines={1} style={[styles.roleText, { color: theme.muted }]}>{isTce ? 'Technical Commercial Expert' : `${tier} Retailer`}</Text>
          </View>
        </Pressable>
        <View style={styles.metricCluster}>
          {isTce ? (
            <>
              <View style={styles.metricPill}><Feather name="file-text" size={14} color={BM.deepBlue} /><Text style={styles.metricValue}>{activeInvoices}</Text><Text style={styles.metricLabel}>active invoices</Text></View>
              <View style={styles.metricPillSmall}><Feather name="check-circle" size={14} color={BM.green} /><Text style={styles.metricValueSmall}>{me?.completed_invoices ?? 16}</Text></View>
            </>
          ) : (
            <>
              <View style={styles.metricPill}><Feather name="gift" size={14} color={BM.deepBlue} /><Text style={styles.metricValue}>{points.toLocaleString()}</Text><Text style={styles.metricLabel}>points</Text></View>
              <View style={styles.metricPillSmall}><Feather name="award" size={14} color={BM.green} /><Text style={styles.metricValueSmall}>{tier}</Text></View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isTce = pathname === '/tce-dashboard' || pathname === '/profile' || pathname === '/consulation-request' || pathname === '/invoices' || pathname === '/map' || pathname === '/retailer-detail';
  const isAppPage = isTce || pathname === '/home-retailers' || pathname === '/tech_guidelines' || pathname === '/points-transaction' || pathname === '/rewards' || pathname === '/users-retailers' || pathname === '/products-retailer' || pathname === '/InvoiceHistory';
  const tabs = isTce ? tceTabs : retailerTabs;

  return (
    <>
      {isAppPage ? <RoleTopNav isTce={isTce} /> : null}
      <SideQuickSettings />
      <View style={[styles.nav, { backgroundColor: BM.deepBlue }]}> 
        {tabs.map((tab) => {
          const isActive = pathname === tab.route || (pathname === '/retailer-detail' && tab.name === 'retailers') || (pathname === '/retailer-dashboard' && tab.name === 'home');
          return <NavTab key={tab.route} tab={tab} active={isActive} onPress={() => router.push(tab.route as Href)} />;
        })}
        <View style={styles.homeIndicator} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topNavWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 85 },
  topNav: { minHeight: 116, borderBottomLeftRadius: 26, borderBottomRightRadius: 26, borderWidth: 1.5, borderTopWidth: 0, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 26, paddingBottom: 12, shadowColor: '#000', shadowOpacity: 0.16, shadowOffset: { width: 0, height: 8 }, shadowRadius: 18, elevation: 10 },
  topBlobOne: { position: 'absolute', width: 210, height: 210, borderRadius: 110, left: -52, top: -76, backgroundColor: 'rgba(104,188,69,0.22)' },
  topBlobTwo: { position: 'absolute', width: 160, height: 160, borderRadius: 80, right: -28, bottom: -54, backgroundColor: 'rgba(0,47,113,0.12)' },
  topShine: { position: 'absolute', width: 126, height: 30, borderRadius: 999, left: 120, top: 22, backgroundColor: 'rgba(255,255,255,0.46)' },
  bouncingSpriteBox: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', borderBottomLeftRadius: 26, borderBottomRightRadius: 26, zIndex: 1 },
  bouncingSprite: { position: 'absolute', opacity: 0.34 },
  bouncingSpriteImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, zIndex: 3 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: BM.deepBlue, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#0A0908' },
  avatarText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
  helloText: { fontSize: 17, fontWeight: '900' },
  roleText: { fontSize: 10.5, fontWeight: '800', marginTop: 2 },
  metricCluster: { flexDirection: 'row', alignItems: 'center', gap: 7, marginLeft: 8, zIndex: 3 },
  metricPill: { minWidth: 82, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1.5, borderColor: '#0A0908', paddingHorizontal: 8, paddingVertical: 6, alignItems: 'center' },
  metricValue: { fontWeight: '900', color: BM.deepBlue, fontSize: 13, marginTop: 1 },
  metricLabel: { fontWeight: '800', color: '#596B56', fontSize: 8, marginTop: -1 },
  metricPillSmall: { borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#0A0908', minHeight: 44, minWidth: 44, paddingHorizontal: 7, alignItems: 'center', justifyContent: 'center' },
  metricValueSmall: { color: BM.green, fontWeight: '900', fontSize: 9, marginTop: 1 },
  nav: { position: 'absolute', bottom: 0, left: 0, right: 0, minHeight: 96, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start', paddingTop: 14, paddingHorizontal: 8, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: -5 }, shadowRadius: 15, elevation: 12 },
  tab: { alignItems: 'center', justifyContent: 'center', flex: 1, gap: 4, minHeight: 56 },
  iconWrap: { width: 40, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  activeIconWrap: { backgroundColor: 'rgba(104,188,69,0.14)' },
  text: { fontSize: 11, color: '#FFFFFF', fontWeight: '600' },
  activeText: { color: BM.green, fontWeight: '900' },
  homeIndicator: { position: 'absolute', bottom: 8, alignSelf: 'center', width: 126, height: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.55)' },
  quickPanelWrap: { position: 'absolute', right: 0, bottom: 120, zIndex: 90 },
  quickPanel: { flexDirection: 'row', alignItems: 'stretch', borderWidth: 1.5, borderTopLeftRadius: 18, borderBottomLeftRadius: 18, borderTopRightRadius: 0, borderBottomRightRadius: 0, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.14, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, elevation: 10 },
  quickHandle: { width: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: BM.deepBlue },
  quickPanelInner: { width: 162, paddingHorizontal: 12, paddingVertical: 12 },
  quickTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  quickTitle: { fontSize: 13, fontWeight: '900' },
  quickRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 38 },
  quickLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
  quickLabel: { fontSize: 11.5, fontWeight: '800' },
  languageToggle: { backgroundColor: BM.green, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1.5, borderColor: '#0A0908' },
  languageToggleText: { color: '#FFFFFF', fontWeight: '900', fontSize: 10.5 },
  quickHint: { fontSize: 9.5, fontWeight: '700', marginTop: 6, lineHeight: 13 },
});
