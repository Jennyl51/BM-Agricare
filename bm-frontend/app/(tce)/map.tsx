import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Navbar from '@/components/Navbar';
import { BackgroundBlobs, BounceButton, FadeIn } from '@/components/AgricareUI';
import { BM } from '@/constants/theme';
import { useApp } from '@/components/AppContext';
import { tceRetailers, type TCERetailer } from '@/constants/tceRetailers';

const filters = ['All', 'High', 'Pending', 'Gold+'] as const;
type Filter = (typeof filters)[number];

function tierColor(tier: string) {
  if (tier === 'Diamond') return '#7C89FF';
  if (tier === 'Emerald') return '#21A67A';
  if (tier === 'Gold') return '#E0A82E';
  return BM.green;
}

function RetailerCard({ retailer, onPress }: { retailer: TCERetailer; onPress: () => void }) {
  const { theme } = useApp();
  const completionRate = Math.max(8, Math.min(100, Math.round(((retailer.invoiceCount - retailer.pendingInvoices) / retailer.invoiceCount) * 100)));

  return (
    <BounceButton onPress={onPress} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> 
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: tierColor(retailer.tier) }]}> 
          <Text style={styles.avatarText}>{retailer.name.split(' ').map((word) => word[0]).slice(0, 2).join('')}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>{retailer.name}</Text>
            <View style={[styles.priorityPill, retailer.priority === 'High' && styles.priorityHigh]}><Text style={styles.priorityText}>{retailer.priority}</Text></View>
          </View>
          <Text style={[styles.meta, { color: theme.muted }]}>{retailer.owner} · {retailer.region}</Text>
        </View>
        <Feather name="chevron-right" size={20} color={theme.muted} />
      </View>

      <View style={styles.statGrid}>
        <View style={[styles.statBox, { backgroundColor: theme.cardSoft }]}><Text style={styles.statValue}>{retailer.points.toLocaleString()}</Text><Text style={[styles.statLabel, { color: theme.muted }]}>points</Text></View>
        <View style={[styles.statBox, { backgroundColor: theme.cardSoft }]}><Text style={styles.statValue}>{retailer.invoiceCount}</Text><Text style={[styles.statLabel, { color: theme.muted }]}>invoices</Text></View>
        <View style={[styles.statBox, { backgroundColor: theme.cardSoft }]}><Text style={styles.statValue}>{retailer.pendingInvoices}</Text><Text style={[styles.statLabel, { color: theme.muted }]}>pending</Text></View>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}><Text style={[styles.progressText, { color: theme.muted }]}>invoice review progress</Text><Text style={styles.progressPercent}>{completionRate}%</Text></View>
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}><View style={[styles.progressFill, { width: `${completionRate}%` }]} /></View>
      </View>

      <View style={styles.bottomRow}>
        <View style={[styles.tierPill, { backgroundColor: tierColor(retailer.tier) }]}><Text style={styles.tierText}>{retailer.tier}</Text></View>
        <Text style={[styles.lastVisit, { color: theme.muted }]}>Last visit: {retailer.lastVisit}</Text>
      </View>
    </BounceButton>
  );
}

export default function TCERetailerList() {
  const { theme } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const filteredRetailers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tceRetailers.filter((retailer) => {
      const matchesQuery = `${retailer.name} ${retailer.owner} ${retailer.region} ${retailer.tier}`.toLowerCase().includes(q);
      const matchesFilter = filter === 'All'
        || (filter === 'High' && retailer.priority === 'High')
        || (filter === 'Pending' && retailer.pendingInvoices > 0)
        || (filter === 'Gold+' && ['Gold', 'Emerald', 'Diamond'].includes(retailer.tier));
      return matchesQuery && matchesFilter;
    });
  }, [filter, query]);

  const totalPending = tceRetailers.reduce((sum, retailer) => sum + retailer.pendingInvoices, 0);
  const totalPoints = tceRetailers.reduce((sum, retailer) => sum + retailer.points, 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <BackgroundBlobs />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeIn style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Retailer List</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>Tap a retailer to open their field profile, invoice history, rewards, products, and TCE follow-up notes.</Text>
        </FadeIn>

        <FadeIn delay={80} style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: BM.deepBlue }]}><Text style={styles.summaryValue}>{tceRetailers.length}</Text><Text style={styles.summaryLabel}>assigned retailers</Text></View>
          <View style={[styles.summaryCard, { backgroundColor: BM.green }]}><Text style={styles.summaryValue}>{totalPending}</Text><Text style={styles.summaryLabel}>pending invoices</Text></View>
          <View style={[styles.summaryCard, { backgroundColor: '#F2A14A' }]}><Text style={styles.summaryValue}>{Math.round(totalPoints / 1000)}k</Text><Text style={styles.summaryLabel}>total points</Text></View>
        </FadeIn>

        <FadeIn delay={130} style={[styles.searchWrap, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          <Feather name="search" size={21} color={BM.green} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search retailers, owner, tier, region..." placeholderTextColor={theme.muted} style={[styles.searchInput, { color: theme.text }]} />
        </FadeIn>

        <FadeIn delay={170}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {filters.map((item) => (
              <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filterChip, { backgroundColor: filter === item ? BM.deepBlue : theme.cardSoft, borderColor: filter === item ? BM.deepBlue : theme.border }]}> 
                <Text style={[styles.filterText, { color: filter === item ? '#fff' : theme.text }]}>{item}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </FadeIn>

        <FadeIn delay={220}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{filteredRetailers.length} Retailers</Text>
            <Text style={[styles.sectionSub, { color: theme.muted }]}>formerly TCE map</Text>
          </View>
          {filteredRetailers.map((retailer, index) => (
            <FadeIn key={retailer.id} delay={250 + index * 50}>
              <RetailerCard retailer={retailer} onPress={() => router.push({ pathname: '/retailer-detail', params: { retailerId: retailer.id } } as any)} />
            </FadeIn>
          ))}
        </FadeIn>
      </ScrollView>
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 150, paddingBottom: 126 },
  header: { marginBottom: 14 },
  title: { fontSize: 32, fontWeight: '900' },
  subtitle: { fontSize: 12, fontWeight: '700', lineHeight: 18, marginTop: 4 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  summaryCard: { flex: 1, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 10, shadowColor: '#000', shadowOpacity: 0.14, shadowOffset: { width: 0, height: 5 }, shadowRadius: 12, elevation: 4 },
  summaryValue: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  summaryLabel: { color: 'rgba(255,255,255,0.86)', fontSize: 9.5, fontWeight: '900', marginTop: 3 },
  searchWrap: { minHeight: 54, borderRadius: 22, borderWidth: 1, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOpacity: 0.10, shadowOffset: { width: 0, height: 5 }, shadowRadius: 12, elevation: 3 },
  searchInput: { flex: 1, fontSize: 13, fontWeight: '800', paddingVertical: 12 },
  filterRow: { gap: 9, paddingVertical: 14 },
  filterChip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 18, paddingVertical: 9 },
  filterText: { fontSize: 12, fontWeight: '900' },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 19, fontWeight: '900' },
  sectionSub: { fontSize: 10.5, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 24, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 5 }, shadowRadius: 12, elevation: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  avatarText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  name: { flex: 1, fontSize: 16, fontWeight: '900' },
  meta: { fontSize: 11, fontWeight: '800', marginTop: 3 },
  priorityPill: { borderRadius: 999, backgroundColor: '#8BA0B8', paddingHorizontal: 8, paddingVertical: 4 },
  priorityHigh: { backgroundColor: '#F04438' },
  priorityText: { color: '#FFFFFF', fontSize: 8.5, fontWeight: '900' },
  statGrid: { flexDirection: 'row', gap: 8, marginTop: 13 },
  statBox: { flex: 1, borderRadius: 15, paddingVertical: 10, alignItems: 'center' },
  statValue: { color: BM.deepBlue, fontSize: 17, fontWeight: '900' },
  statLabel: { fontSize: 9, fontWeight: '900', marginTop: 2 },
  progressWrap: { marginTop: 13 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  progressText: { fontSize: 10, fontWeight: '800' },
  progressPercent: { color: BM.green, fontSize: 10, fontWeight: '900' },
  progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: BM.green },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 12 },
  tierPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  tierText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  lastVisit: { flex: 1, textAlign: 'right', fontSize: 10, fontWeight: '800' },
});
