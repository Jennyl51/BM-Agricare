import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Navbar from '@/components/Navbar';
import { BackgroundBlobs, BounceButton, FadeIn } from '@/components/AgricareUI';
import { BM } from '@/constants/theme';
import { useApp } from '@/components/AppContext';
import { getTCERetailer, type RetailerInvoice, type RetailerReward } from '@/constants/tceRetailers';

function statusColor(status: string) {
  if (status === 'Approved' || status === 'Eligible') return BM.green;
  if (status === 'Pending' || status === 'Shipping') return '#F2A14A';
  if (status === 'Flagged' || status === 'Rejected') return '#F04438';
  if (status === 'Redeemed') return BM.deepBlue;
  return BM.grey;
}

function InfoTile({ icon, label, value }: { icon: keyof typeof Feather.glyphMap; label: string; value: string | number }) {
  const { theme } = useApp();
  return (
    <View style={[styles.infoTile, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}> 
      <Feather name={icon} size={17} color={BM.green} />
      <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.infoLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

function InvoiceCard({ invoice }: { invoice: RetailerInvoice }) {
  const { theme } = useApp();
  return (
    <View style={[styles.invoiceCard, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}> 
      <View style={styles.invoiceTop}>
        <View>
          <Text style={[styles.invoiceId, { color: theme.text }]}>{invoice.id}</Text>
          <Text style={[styles.invoiceDate, { color: theme.muted }]}>{invoice.date} · ₫{invoice.total.toLocaleString()}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusColor(invoice.status) }]}><Text style={styles.statusText}>{invoice.status}</Text></View>
      </View>
      {invoice.items.map((item) => (
        <View key={`${invoice.id}-${item.name}`} style={[styles.itemLine, { borderColor: theme.border }]}> 
          <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.itemMeta, { color: theme.muted }]}>{item.units} units</Text>
          <Text style={styles.itemPoints}>{item.points} pts</Text>
        </View>
      ))}
    </View>
  );
}

function RewardCard({ reward }: { reward: RetailerReward }) {
  const { theme } = useApp();
  return (
    <View style={[styles.rewardCard, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}> 
      <View style={[styles.rewardIcon, { backgroundColor: statusColor(reward.status) }]}><Feather name="gift" size={16} color="#FFFFFF" /></View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rewardTitle, { color: theme.text }]}>{reward.title}</Text>
        <Text style={[styles.rewardMeta, { color: theme.muted }]}>{reward.points.toLocaleString()} pts{reward.date ? ` · ${reward.date}` : ''}</Text>
      </View>
      <Text style={[styles.rewardStatus, { color: statusColor(reward.status) }]}>{reward.status}</Text>
    </View>
  );
}

export default function RetailerDetail() {
  const { theme } = useApp();
  const { retailerId } = useLocalSearchParams();
  const retailer = getTCERetailer(retailerId);
  const approvedInvoices = retailer.invoices.filter((invoice) => invoice.status === 'Approved').length;
  const invoiceRate = Math.round((approvedInvoices / Math.max(retailer.invoices.length, 1)) * 100);

  const openMaps = () => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(retailer.address)}`).catch(() => undefined);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <BackgroundBlobs />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeIn style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          <View style={styles.heroTop}>
            <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.cardSoft }]}><Feather name="arrow-left" size={21} color={theme.text} /></Pressable>
            <View style={[styles.tierBadge, { backgroundColor: statusColor(retailer.tier === 'Starter' ? 'Eligible' : 'Redeemed') }]}><Text style={styles.tierText}>{retailer.tier}</Text></View>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>{retailer.name}</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>{retailer.owner} · {retailer.region}</Text>
          <View style={styles.addressRow}><Feather name="map-pin" size={15} color={BM.green} /><Text style={[styles.address, { color: theme.text }]}>{retailer.address}</Text></View>
          <View style={styles.heroActions}>
            <BounceButton onPress={openMaps} style={styles.primaryAction}><Feather name="navigation" size={15} color="#FFFFFF" /><Text style={styles.primaryActionText}>Open location</Text></BounceButton>
            <BounceButton style={[styles.secondaryAction, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}><Feather name="phone" size={15} color={BM.deepBlue} /><Text style={styles.secondaryActionText}>{retailer.phone}</Text></BounceButton>
          </View>
        </FadeIn>

        <FadeIn delay={90} style={styles.infoGrid}>
          <InfoTile icon="gift" label="reward points" value={retailer.points.toLocaleString()} />
          <InfoTile icon="file-text" label="total invoices" value={retailer.invoiceCount} />
          <InfoTile icon="clock" label="pending review" value={retailer.pendingInvoices} />
          <InfoTile icon="trending-up" label="monthly sales" value={`₫${Math.round(retailer.monthlySales / 1000)}k`} />
        </FadeIn>

        <FadeIn delay={150} style={[styles.noteCard, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>TCE Notes</Text>
            <View style={[styles.priorityPill, retailer.priority === 'High' && styles.priorityHigh]}><Text style={styles.priorityText}>{retailer.priority}</Text></View>
          </View>
          <Text style={[styles.noteText, { color: theme.muted }]}>{retailer.notes}</Text>
          <View style={styles.productChips}>{retailer.favoriteProducts.map((product) => <View key={product} style={[styles.productChip, { backgroundColor: theme.cardSoft }]}><Text style={[styles.productChipText, { color: theme.text }]}>{product}</Text></View>)}</View>
        </FadeIn>

        <FadeIn delay={210} style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          <View style={styles.sectionTitleRow}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Past Invoice Info</Text>
              <Text style={[styles.sectionSub, { color: theme.muted }]}>{invoiceRate}% approved in recent records</Text>
            </View>
            <Feather name="file-text" size={22} color={BM.green} />
          </View>
          {retailer.invoices.map((invoice) => <InvoiceCard key={invoice.id} invoice={invoice} />)}
        </FadeIn>

        <FadeIn delay={270} style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          <View style={styles.sectionTitleRow}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Rewards</Text>
              <Text style={[styles.sectionSub, { color: theme.muted }]}>{retailer.rewardCount} reward activities / opportunities</Text>
            </View>
            <Feather name="gift" size={22} color={BM.green} />
          </View>
          {retailer.rewards.map((reward) => <RewardCard key={reward.id} reward={reward} />)}
        </FadeIn>

        <FadeIn delay={330} style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recommended TCE Follow-up</Text>
          <View style={styles.followRow}><View style={styles.checkDot}><Feather name="check" size={12} color="#FFFFFF" /></View><Text style={[styles.followText, { color: theme.text }]}>Verify pending invoices and compare uploaded product units with receipt totals.</Text></View>
          <View style={styles.followRow}><View style={styles.checkDot}><Feather name="check" size={12} color="#FFFFFF" /></View><Text style={[styles.followText, { color: theme.text }]}>Recommend guides for their top product categories before the next field visit.</Text></View>
          <View style={styles.followRow}><View style={styles.checkDot}><Feather name="check" size={12} color="#FFFFFF" /></View><Text style={[styles.followText, { color: theme.text }]}>Check reward eligibility and help submit redemption if the retailer is qualified.</Text></View>
        </FadeIn>
      </ScrollView>
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 150, paddingBottom: 126 },
  heroCard: { borderWidth: 1, borderRadius: 28, padding: 18, shadowColor: '#000', shadowOpacity: 0.14, shadowOffset: { width: 0, height: 7 }, shadowRadius: 16, elevation: 5 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  tierBadge: { borderRadius: 999, paddingHorizontal: 13, paddingVertical: 7 },
  tierText: { color: '#FFFFFF', fontWeight: '900', fontSize: 11 },
  title: { fontSize: 31, fontWeight: '900', marginTop: 14 },
  subtitle: { fontSize: 13, fontWeight: '800', marginTop: 3 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 13 },
  address: { flex: 1, fontSize: 12, fontWeight: '800', lineHeight: 17 },
  heroActions: { flexDirection: 'row', gap: 9, marginTop: 16 },
  primaryAction: { flex: 1, backgroundColor: BM.deepBlue, borderRadius: 16, paddingVertical: 13, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  primaryActionText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  secondaryAction: { flex: 1, borderWidth: 1, borderRadius: 16, paddingVertical: 13, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  secondaryActionText: { color: BM.deepBlue, fontWeight: '900', fontSize: 11 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  infoTile: { width: '48.5%', borderWidth: 1, borderRadius: 20, padding: 14, minHeight: 106, justifyContent: 'center' },
  infoValue: { fontSize: 20, fontWeight: '900', marginTop: 7 },
  infoLabel: { fontSize: 10, fontWeight: '900', marginTop: 2 },
  noteCard: { borderWidth: 1, borderRadius: 24, padding: 16, marginTop: 14, shadowColor: '#000', shadowOpacity: 0.10, shadowOffset: { width: 0, height: 5 }, shadowRadius: 12, elevation: 3 },
  sectionCard: { borderWidth: 1, borderRadius: 24, padding: 16, marginTop: 14, shadowColor: '#000', shadowOpacity: 0.10, shadowOffset: { width: 0, height: 5 }, shadowRadius: 12, elevation: 3 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '900' },
  sectionSub: { fontSize: 10.5, fontWeight: '800', marginTop: 2 },
  priorityPill: { borderRadius: 999, backgroundColor: '#8BA0B8', paddingHorizontal: 10, paddingVertical: 5 },
  priorityHigh: { backgroundColor: '#F04438' },
  priorityText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  noteText: { fontSize: 12, fontWeight: '800', lineHeight: 18 },
  productChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  productChip: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7 },
  productChipText: { fontSize: 10.5, fontWeight: '900' },
  invoiceCard: { borderWidth: 1, borderRadius: 18, padding: 12, marginTop: 10 },
  invoiceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  invoiceId: { fontSize: 15, fontWeight: '900' },
  invoiceDate: { fontSize: 10.5, fontWeight: '800', marginTop: 2 },
  statusPill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  statusText: { color: '#FFFFFF', fontSize: 8.5, fontWeight: '900' },
  itemLine: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingTop: 9, marginTop: 9, gap: 8 },
  itemName: { flex: 1, fontSize: 12, fontWeight: '900' },
  itemMeta: { fontSize: 10, fontWeight: '800' },
  itemPoints: { color: BM.green, fontSize: 11, fontWeight: '900' },
  rewardCard: { borderWidth: 1, borderRadius: 17, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  rewardIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  rewardTitle: { fontSize: 13, fontWeight: '900' },
  rewardMeta: { fontSize: 10, fontWeight: '800', marginTop: 2 },
  rewardStatus: { fontSize: 10, fontWeight: '900' },
  followRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 11 },
  checkDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: BM.green, alignItems: 'center', justifyContent: 'center' },
  followText: { flex: 1, fontSize: 12, fontWeight: '800', lineHeight: 18 },
});
