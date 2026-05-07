import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BM } from '@/constants/theme';
import { useApp } from '@/components/AppContext';

type Product = { product_id: string; name: string; category: string; image_url: string; points_factor: number; description?: string; price?: number };

type InsetOverlayProps = {
  visible: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  align?: 'center' | 'bottom';
};

export function FadeIn({ children, delay = 0, y = 16, style }: { children: React.ReactNode; delay?: number; y?: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(y)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 380, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, useNativeDriver: true, speed: 16, bounciness: 8 }),
    ]).start();
  }, [delay, opacity, translateY]);
  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

export function BounceButton({ children, style, onPress, disabled }: { children: React.ReactNode; style?: any; onPress?: () => void; disabled?: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const press = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 1, duration: 80, useNativeDriver: false }),
      ]),
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 11 }),
        Animated.timing(glow, { toValue: 0, duration: 250, useNativeDriver: false }),
      ]),
    ]).start();
    onPress?.();
  };
  const shadowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.16, 0.35] });
  return (
    <Pressable disabled={disabled} onPress={press} onHoverIn={() => Animated.spring(scale, { toValue: 1.025, useNativeDriver: true }).start()} onHoverOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}>
      <Animated.View style={[styles.buttonShadow, style, disabled && { opacity: 0.55 }, { transform: [{ scale }], shadowOpacity }]}>{children}</Animated.View>
    </Pressable>
  );
}

export function ScreenShell({ children, padded = false }: { children: React.ReactNode; padded?: boolean }) {
  const { theme } = useApp();
  return <View style={[styles.shell, { backgroundColor: theme.bg }, padded && { paddingHorizontal: 20 }]}>{children}</View>;
}

export function BackgroundBlobs() {
  const spin = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 11000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 3600,
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 3600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [spin, float]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const reverseRotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const floatY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 28],
  });

  const floatX = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          styles.blobOne,
          {
            transform: [
              { rotate },
              { translateY: floatY },
              { translateX: floatX },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.blobTwo,
          {
            transform: [
              { rotate: reverseRotate },
              { translateY: Animated.multiply(floatY, -1) },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.blobThree,
          {
            transform: [
              { translateY: Animated.multiply(floatY, 0.65) },
              { translateX: Animated.multiply(floatX, -1) },
              { rotate },
            ],
          },
        ]}
      />
    </View>
  );
}

export function StatusPill({ status }: { status: string }) {
  const normalized = status === 'in_process' ? 'In Process' : status === 'completed' ? 'Completed' : status === 'pending' ? 'Pending' : 'Rejected';
  const color = status === 'completed' ? BM.green : status === 'rejected' ? '#EF4444' : '#F4D35E';
  return (
    <View style={[styles.pill, { backgroundColor: color }]}>
      <Text style={styles.pillText}>{normalized}</Text>
    </View>
  );
}

export function ProductCard({ product, onPress, compact = false }: { product: Product; onPress?: () => void; compact?: boolean }) {
  const { theme } = useApp();
  return (
    <BounceButton onPress={onPress} style={[styles.productCard, { backgroundColor: theme.card, borderColor: theme.border }, compact && styles.productCompact]}>
      <Text style={styles.productMeta}>Earn {product.points_factor} pts / unit</Text>
      <Text numberOfLines={1} style={[styles.productName, { color: theme.text }]}>{product.name}</Text>
      <Image source={{ uri: product.image_url }} style={styles.productImage} />
      <Text numberOfLines={1} style={[styles.productCategory, { color: theme.muted }]}>{product.category}</Text>
      <View style={styles.productFooter}>
        <Feather name="plus-circle" size={12} color={BM.green} />
        <Text style={[styles.productFooterText, { color: theme.muted }]}>tap to add invoice</Text>
        <Text style={styles.pointsBubble}>{product.points_factor}</Text>
      </View>
    </BounceButton>
  );
}

export function FarmHero({ children, height = 250, image = 'field_house' }: { children?: React.ReactNode; height?: number; image?: 'field_house' | 'rice' | 'crops' | 'overview' }) {
  const imageSets: Record<string, any[]> = useMemo(() => ({
    field_house: [
      require('@/assets/fields/field_house.jpg'),
      require('@/assets/fields/field_overview_1.jpg'),
      require('@/assets/fields/field_overview_2.jpg'),
      require('@/assets/fields/field_overview_3.jpg'),
      require('@/assets/fields/field_overview_4.jpg'),
    ],
    rice: [
      require('@/assets/fields/rice_plains.jpg'),
      require('@/assets/fields/wet_fields.jpg'),
      require('@/assets/fields/field_overview_5.jpg'),
      require('@/assets/fields/field_overview_6.jpg'),
    ],
    crops: [
      require('@/assets/fields/crops.jpg'),
      require('@/assets/fields/tractor_crops.jpg'),
      require('@/assets/fields/field_woman.jpg'),
      require('@/assets/fields/field_kids.jpg'),
    ],
    overview: [
      require('@/assets/fields/field_overview_7.jpg'),
      require('@/assets/fields/field_overview_8.jpg'),
      require('@/assets/fields/field_overview_9.jpg'),
      require('@/assets/fields/field_overview_10.jpg'),
      require('@/assets/fields/field_overview_2.jpg'),
    ],
  }), []);
  const sources = imageSets[image] || imageSets.overview;
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (sources.length <= 1) return;
    const timer = setInterval(() => setHeroIndex((prev) => (prev + 1) % sources.length), 4500);
    return () => clearInterval(timer);
  }, [sources]);

  return (
    <ImageBackground source={sources[heroIndex]} style={[styles.farmHero, { height }]} imageStyle={styles.farmHeroImage}>
      <View style={styles.heroOverlay} />
      {children}
    </ImageBackground>
  );
}

export function HeaderAction({ title, subtitle, icon = 'menu', onPress }: { title: string; subtitle?: string; icon?: keyof typeof Feather.glyphMap; onPress?: () => void }) {
  const { theme } = useApp();
  return (
    <View style={styles.headerAction}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.headerSubtitle, { color: theme.muted }]}>{subtitle}</Text> : null}
      </View>
      <BounceButton onPress={onPress} style={[styles.roundIcon, { backgroundColor: theme.card }]}><Feather name={icon} size={22} color={BM.deepBlue} /></BounceButton>
    </View>
  );
}

export function EmptyState({ title, subtitle, action, onPress }: { title: string; subtitle?: string; action?: string; onPress?: () => void }) {
  const { theme } = useApp();
  return (
    <View style={[styles.empty, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Feather name="inbox" size={30} color={BM.green} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.emptySubtitle, { color: theme.muted }]}>{subtitle}</Text> : null}
      {action ? <BounceButton onPress={onPress} style={styles.emptyAction}><Text style={styles.emptyActionText}>{action}</Text></BounceButton> : null}
    </View>
  );
}

export function InsetOverlay({ visible, onClose, children, align = 'center' }: InsetOverlayProps) {
  if (!visible) return null;
  return (
    <View style={[styles.overlayBackdrop, align === 'bottom' && styles.overlayBackdropBottom]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={[styles.overlaySheet, align === 'bottom' && styles.overlaySheetBottom]}>{children}</View>
    </View>
  );
}

// kept as a safe no-op because older screens imported it before the quick settings redesign.
export function FloatingAvatar() {
  return null;
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  buttonShadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowRadius: 12, elevation: 5 },
  blobOne: { position: 'absolute', width: 320, height: 520, borderRadius: 180, backgroundColor: 'rgba(104,188,69,0.22)', left: -175, top: 40 },
  blobTwo: { position: 'absolute', width: 260, height: 380, borderRadius: 170, backgroundColor: 'rgba(149,211,214,0.20)', right: -145, top: 130 },
  blobThree: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(104,188,69,0.14)', right: 40, bottom: 70 },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center', justifyContent: 'center' },
  pillText: { fontSize: 10, color: '#334155', fontWeight: '800' },
  productCard: { width: 142, borderRadius: 18, padding: 10, marginRight: 10, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.11, shadowOffset: { width: 0, height: 7 }, shadowRadius: 14, elevation: 4 },
  productCompact: { width: 132 },
  productMeta: { color: BM.orange, fontSize: 9, fontWeight: '900' },
  productName: { fontSize: 11, fontWeight: '900', marginVertical: 4 },
  productImage: { width: '100%', height: 84, borderRadius: 12, backgroundColor: '#EEF2F7' },
  productCategory: { fontSize: 9, marginTop: 6, fontWeight: '700' },
  productFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  productFooterText: { fontSize: 8, fontWeight: '700', flex: 1 },
  pointsBubble: { overflow: 'hidden', borderRadius: 999, backgroundColor: BM.green, color: '#fff', paddingHorizontal: 7, paddingVertical: 2, fontSize: 8, fontWeight: '900' },
  farmHero: { width: '100%', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  farmHeroImage: { resizeMode: 'cover' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,31,18,0.28)' },
  headerAction: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, paddingTop: Platform.OS === 'web' ? 22 : 18, paddingBottom: 10, gap: 12 },
  headerTitle: { fontSize: 28, fontWeight: '900', letterSpacing: 0.2 },
  headerSubtitle: { fontSize: 13, fontWeight: '600', marginTop: 4, lineHeight: 18 },
  roundIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  empty: { borderRadius: 20, borderWidth: 1, alignItems: 'center', padding: 18, marginVertical: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '900', marginTop: 8 },
  emptySubtitle: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 4, lineHeight: 18 },
  emptyAction: { backgroundColor: BM.deepBlue, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 11, marginTop: 12 },
  emptyActionText: { color: '#fff', fontWeight: '900' },
  overlayBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.44)', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 80 },
  overlayBackdropBottom: { justifyContent: 'flex-end' },
  overlaySheet: { width: '100%', maxWidth: 390, borderRadius: 26, overflow: 'hidden' },
  overlaySheetBottom: { marginBottom: 110 },
});
