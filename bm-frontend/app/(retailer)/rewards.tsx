import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Navbar from '@/components/Navbar';
import { BM } from '@/constants/theme';
import { BackgroundBlobs, BounceButton, FadeIn, ProductCard } from '@/components/AgricareUI';
import FallingSprites, { getRewardFallVariant } from '@/components/FallingSprites';
import { useApp } from '@/components/AppContext';
import { getPointsHistory, getPointsSummary, getRewardsList, redeemReward } from '@/services/rewardApi';
import { getProductsList } from '@/services/productsApi';

// type Reward = { reward_id: string; name: string; description?: string; points_needed: number; tier_requirement: string; quantity_available?: number | null };

type Reward = {
  reward_id: string;
  rwd_id?: number | null;
  name: string;
  description?: string | null;
  points_needed: number;
  tier_requirement: string;
  quantity_available?: number | null;
  related_product?: string | null;
  image_url?: string | null;
  is_pinned?: boolean;
  is_seasonal?: boolean;
  is_visible?: boolean;
};

type History = { id?: string; points_earned?: number; points_redeemed?: number; description?: string; occurred_at?: string };

function Confetti({ play }: { play: boolean }) {
  const fall = useRef(new Animated.Value(0)).current;
  useEffect(() => { if (play) { fall.setValue(0); Animated.timing(fall, { toValue: 1, duration: 1200, useNativeDriver: true }).start(); } }, [play, fall]);
  if (!play) return null;
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>{Array.from({ length: 14 }).map((_, i) => <Animated.View key={i} style={[styles.confetti, { left: 20 + (i * 27) % 360, backgroundColor: i % 3 === 0 ? BM.green : i % 3 === 1 ? BM.orange : BM.teal, transform: [{ translateY: fall.interpolate({ inputRange: [0, 1], outputRange: [-40, 420] }) }, { rotate: `${i * 22}deg` }] }]} />)}</View>;
}

export default function RewardsScreen() {
  const { theme } = useApp();
  const [points, setPoints] = useState(0);
  const [tier, setTier] = useState('Starter');
  const [nextTier, setNextTier] = useState(9000);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState<Reward | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [introFall, setIntroFall] = useState(true);
  const [tierFallReady, setTierFallReady] = useState(false);

  // const refresh = () => Promise.all([
  //   getRewardsList(), getPointsSummary(), getPointsHistory(), getProductsList(),
  // ]).then(([rewardData, summary, historyData, productData]: any[]) => {
  //   setRewards(Array.isArray(rewardData) ? rewardData : []);
  //   setPoints(Number(summary?.total_points || 0));
  //   setTier(summary?.tier || 'Starter');
  //   setNextTier(Number(summary?.next_tier_points || 0));
  //   setHistory(Array.isArray(historyData) ? historyData : []);
  //   setProducts(Array.isArray(productData) ? productData : []);
  // });
  const refresh = () =>
  getRewardsList().then((rewardData: any[]) => {
    setRewards(Array.isArray(rewardData) ? rewardData : []);

    // Temporary local display values while testing rewards API only.
    // This prevents /points/history, /points/summary, and /products from firing.
    setPoints(100);
    setTier('Diamond');
    setNextTier(0);
    setHistory([]);
    setProducts([]);
  });

  useEffect(() => { refresh().catch(() => null); }, []);

  // const redeem = async (reward: Reward) => {
  //   if (points < reward.points_needed) return;
  //   await redeemReward(reward.reward_id, 1);
  //   setSelected(null);
  //   setConfetti(true);
  //   setTimeout(() => setConfetti(false), 3900);
  //   refresh().catch(() => null);
  // };
  const redeem = async (reward: Reward) => {
    if (points < reward.points_needed) return;
  
    // Temporary demo behavior:
    // Rewards are loaded from backend SQL, but redemption POST is mocked locally for now.
    setSelected(null);
    setConfetti(true);
    setSuccessMessage(`Redeemed successfully: ${reward.name}`);
  
    setTimeout(() => setConfetti(false), 3900);
    setTimeout(() => setSuccessMessage(''), 3200);
  
    setHistory((current: any[]) => [
      {
        id: `demo-redemption-${Date.now()}`,
        points_earned: 0,
        points_redeemed: reward.points_needed,
        description: `Demo redemption request: ${reward.name}`,
        occurred_at: new Date().toISOString().slice(0, 10),
      },
      ...current,
    ]);
  
    setPoints((current) => Math.max(0, Number(current || 0) - reward.points_needed));
  };

  const startTierFall = useCallback(() => setTierFallReady(true), []);
  const finishIntroFall = useCallback(() => setIntroFall(false), []);

  const progress = Math.min(100, Math.round((points / 9000) * 100));
  const rewardFallVariant = getRewardFallVariant(points, tier);
  const unlocked = rewards.filter((r) => points >= r.points_needed).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}> 
      <BackgroundBlobs />
      <FallingSprites variant="all" count={200} duration={2600} loop={false} active={introFall} onEmitComplete={startTierFall} onComplete={finishIntroFall} />
      <FallingSprites variant={rewardFallVariant} count={28} duration={5600} active={tierFallReady} />
      <FallingSprites variant="all" count={200} duration={2500} loop={false} active={confetti} />
      <Confetti play={confetti} />
      {successMessage ? (
        <View style={styles.successToast}>
          <Text style={styles.successIcon}>✓</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.successTitle}>Redeem successful</Text>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        </View>
      ) : null}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>Reward Center</Text>
          <Text style={styles.heroTitle}>{points.toLocaleString()} pts</Text>
          <Text style={styles.heroSub}>{tier} Tier · {nextTier > 0 ? `${nextTier.toLocaleString()} pts to Premium` : 'Premium unlocked!'}</Text>
          <View style={styles.tierTrack}><View style={[styles.tierFill, { width: `${progress}%` }]} /></View>
        </View>

        <FadeIn delay={100} style={[styles.statsRow, { backgroundColor: theme.card }]}> 
          <View style={styles.statCard}><Feather name="gift" size={19} color={BM.green} /><Text style={[styles.statNumber, { color: theme.text }]}>{unlocked}</Text><Text style={styles.statLabel}>rewards unlocked</Text></View>
          <View style={styles.statCard}><Feather name="zap" size={19} color={BM.orange} /><Text style={[styles.statNumber, { color: theme.text }]}>{history.length}</Text><Text style={styles.statLabel}>point events</Text></View>
          <View style={styles.statCard}><Feather name="trending-up" size={19} color={BM.teal} /><Text style={[styles.statNumber, { color: theme.text }]}>{progress}%</Text><Text style={styles.statLabel}>tier progress</Text></View>
        </FadeIn>

        <FadeIn delay={180} style={[styles.cardSection, { backgroundColor: theme.card }]}> 
          <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: theme.primary }]}>Reward Shop ✨</Text><Text style={styles.helperText}>tap to redeem</Text></View>
          {rewards.map((reward) => {
            const canRedeem = points >= reward.points_needed;
            return <Pressable key={reward.reward_id} style={[styles.rewardRow, { borderColor: theme.border }]} onPress={() => setSelected(reward)}>
              <View style={[styles.rewardIcon, !canRedeem && { backgroundColor: '#AAB7A7' }]}><Feather name={canRedeem ? 'gift' : 'lock'} size={22} color="#FFFFFF" /></View>
              <View style={{ flex: 1 }}><Text style={[styles.rewardName, { color: theme.text }]}>{reward.name}</Text>
              {/* <Text style={[styles.rewardDesc, { color: theme.muted }]}>{reward.description}</Text> */}
              <Text style={[styles.rewardDesc, { color: theme.muted }]}>
                {reward.related_product ? `Product: ${reward.related_product}` : reward.description}
              </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}><Text style={styles.rewardPoints}>{reward.points_needed.toLocaleString()}</Text><Text style={styles.rewardTier}>{reward.tier_requirement}</Text></View>
            </Pressable>;
          })}
        </FadeIn>

        <FadeIn delay={240} style={[styles.cardSection, { backgroundColor: theme.card }]}> 
          <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: theme.primary }]}>Point Activity</Text><Text style={styles.helperText}>live account history</Text></View>
          {history.length === 0 ? <Text style={[styles.emptyText, { color: theme.muted }]}>No point activity yet. Submit an invoice or redeem a reward to start tracking.</Text> : history.slice(0, 5).map((item, index) => {
            const amount = Number(item.points_earned || 0) - Number(item.points_redeemed || 0);
            return <View key={item.id || index} style={[styles.historyRow, { borderColor: theme.border }]}>
              <View><Text style={[styles.historyTitle, { color: theme.text }]}>{item.description || 'Point update'}</Text><Text style={styles.historyDate}>{item.occurred_at || 'Today'}</Text></View>
              <Text style={[styles.historyPts, amount >= 0 ? styles.positive : styles.negative]}>{amount >= 0 ? '+' : ''}{amount.toLocaleString()}</Text>
            </View>;
          })}
        </FadeIn>

        <FadeIn delay={300} style={[styles.cardSection, { backgroundColor: theme.card }]}> 
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>Recent Purchases & Point Potential</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>{products.map((p) => <ProductCard key={p.product_id} product={p} compact />)}</ScrollView>
        </FadeIn>
      </ScrollView>

      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBackdrop}><View style={[styles.modalCard, { backgroundColor: theme.card }]}> 
          <View style={styles.modalTop}><Text style={[styles.modalTitle, { color: theme.text }]}>{selected?.name}</Text><Pressable onPress={() => setSelected(null)}><Feather name="x" size={23} color={theme.text} /></Pressable></View>
          <View style={styles.bigGift}><Feather name="gift" size={46} color="#fff" /></View>
          <Text style={[styles.modalDesc, { color: theme.muted }]}>{selected?.description}</Text>
          <Text style={styles.modalCost}>{selected?.points_needed.toLocaleString()} points</Text>
          <BounceButton style={[styles.redeemButton, points < (selected?.points_needed || 0) && { opacity: 0.45 }]} onPress={() => selected && redeem(selected)}>
            <Text style={styles.redeemText}>{points >= (selected?.points_needed || 0) ? 'Redeem reward 🎉' : 'Not enough points yet'}</Text>
          </BounceButton>
        </View></View>
      </Modal>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 0, paddingBottom: 128 },
  hero: { height: 350, justifyContent: 'center', alignItems: 'center', backgroundColor: BM.deepBlue, borderBottomLeftRadius: 38, borderBottomRightRadius: 38, paddingHorizontal: 28, paddingTop: 118 },
  heroKicker: { color: '#DDF2CF', fontWeight: '900', fontSize: 14 },
  heroTitle: { color: '#FFFFFF', fontSize: 44, fontWeight: '900', marginTop: 4 },
  heroSub: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', opacity: 0.9, marginTop: 4 },
  tierTrack: { width: '100%', height: 12, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.22)', marginTop: 20, overflow: 'hidden' },
  tierFill: { height: 12, borderRadius: 999, backgroundColor: BM.green },
  statsRow: { flexDirection: 'row', marginHorizontal: 22, marginTop: -34, borderRadius: 22, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.14, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, elevation: 5 },
  statCard: { flex: 1, minHeight: 96, padding: 10, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: 'rgba(0,0,0,0.06)' },
  statNumber: { fontWeight: '900', fontSize: 20, marginTop: 5 },
  statLabel: { color: '#7A8794', fontWeight: '800', fontSize: 9, textAlign: 'center', marginTop: 3 },
  cardSection: { marginHorizontal: 22, marginTop: 18, borderRadius: 22, padding: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 6 }, shadowRadius: 14, elevation: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontWeight: '900', fontSize: 18 },
  helperText: { color: '#94A3B8', fontSize: 10, fontWeight: '900' },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, borderBottomWidth: 1 },
  rewardIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: BM.green, alignItems: 'center', justifyContent: 'center' },
  rewardName: { fontWeight: '900', fontSize: 13 },
  rewardDesc: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  rewardPoints: { color: BM.deepBlue, fontWeight: '900', fontSize: 14 },
  rewardTier: { color: BM.green, fontWeight: '900', fontSize: 9 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  historyTitle: { fontWeight: '900', fontSize: 12 },
  historyDate: { color: '#94A3B8', fontSize: 10, marginTop: 2, fontWeight: '700' },
  historyPts: { fontWeight: '900', fontSize: 14 },
  positive: { color: BM.green },
  negative: { color: '#EF4444' },
  horizontalCards: { paddingVertical: 10, paddingRight: 12 },
  emptyText: { fontSize: 12, lineHeight: 18, fontWeight: '700', paddingVertical: 14 },
  confetti: { position: 'absolute', top: 0, width: 10, height: 18, borderRadius: 3 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 380, borderRadius: 26, padding: 20, alignItems: 'center' },
  modalTop: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 23, fontWeight: '900', flex: 1 },
  bigGift: { width: 90, height: 90, borderRadius: 45, backgroundColor: BM.green, alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  modalDesc: { fontWeight: '700', textAlign: 'center', lineHeight: 20 },
  modalCost: { color: BM.deepBlue, fontWeight: '900', fontSize: 22, marginTop: 16 },
  redeemButton: { backgroundColor: BM.deepBlue, borderRadius: 17, paddingHorizontal: 24, paddingVertical: 15, marginTop: 16 },
  redeemText: { color: '#fff', fontWeight: '900' },
  successToast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 110,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(122, 193, 67, 0.45)',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  successIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#7AC143',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 34,
    fontSize: 20,
    fontWeight: '900',
  },
  successTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#06357A',
  },
  successText: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
});
