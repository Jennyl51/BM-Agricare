import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Navbar from '@/components/Navbar';
import { BM } from '@/constants/theme';
import { BackgroundBlobs, BounceButton, FadeIn, FarmHero } from '@/components/AgricareUI';
import { useApp } from '@/components/AppContext';
import { getUserMe } from '@/services/userApi';
import { getInvoices } from '@/services/invoiceApi';
import { getPointsHistory, getPointsSummary } from '@/services/rewardApi';

type Profile = { name: string; region?: string; tier?: string; total_points?: number; pending_invoices?: number; completed_invoices?: number; total_invoices?: number };

export default function UsersRetailers() {
  const { theme } = useApp();
  const [profile, setProfile] = useState<Profile>({ name: 'Tin Bao Tran', region: 'Tin Berry Farm | Mekong Delta', tier: 'Gold', total_points: 0, pending_invoices: 0, completed_invoices: 0, total_invoices: 0 });
  const [invoices, setInvoices] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const refresh = () => Promise.all([getUserMe(), getInvoices(), getPointsSummary(), getPointsHistory()]).then(([user, invoiceData, summary, historyData]: any[]) => {
    setProfile((prev) => ({ ...prev, ...user, total_points: summary?.total_points ?? user?.total_points ?? prev.total_points, tier: summary?.tier ?? user?.tier ?? prev.tier }));
    setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
    setHistory(Array.isArray(historyData) ? historyData : []);
  });
  useEffect(() => { refresh().catch(() => null); }, []);

  const points = profile.total_points ?? 0;
  const pending = profile.pending_invoices ?? invoices.filter((i) => (i.status || i.submission_status) !== 'completed').length;
  const completed = profile.completed_invoices ?? invoices.filter((i) => (i.status || i.submission_status) === 'completed').length;
  const progress = Math.min(100, Math.round((points / 9000) * 100));

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}> 
      <BackgroundBlobs />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <FarmHero height={336} image="crops">
          <View style={styles.topRow}><Text style={styles.profileTitle}>User Page</Text></View>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' }} style={styles.avatar} />
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.location}>{profile.region}</Text>
        </FarmHero>

        <FadeIn delay={120} style={[styles.statsRow, { backgroundColor: BM.deepBlue }]}> 
          <View style={styles.stat}><Feather name="award" size={18} color="#FFFFFF" /><Text style={styles.statValue}>{profile.tier} Tier</Text><Text style={styles.statLabel}>tier earned</Text></View>
          <View style={styles.stat}><Feather name="trending-up" size={18} color="#FFFFFF" /><Text style={styles.statValue}>Top {Math.max(1, 100 - progress)}%</Text><Text style={styles.statLabel}>among retailers</Text></View>
          <View style={styles.stat}><Feather name="file-text" size={18} color="#FFFFFF" /><Text style={styles.statValue}>{completed}</Text><Text style={styles.statLabel}>invoices approved</Text></View>
        </FadeIn>

        <FadeIn delay={180} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>Account</Text>
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}> 
            <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: theme.muted }]}>Name</Text><Text style={styles.infoValue}>{profile.name}</Text></View>
            <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: theme.muted }]}>Region</Text><Text style={styles.infoValue}>{profile.region}</Text></View>
            <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: theme.muted }]}>Tier</Text><Text style={styles.infoValue}>{profile.tier}</Text></View>
            <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: theme.muted }]}>Available points</Text><Text style={styles.infoValue}>{points.toLocaleString()}</Text></View>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
            <Text style={[styles.progressText, { color: theme.muted }]}>{progress}% of the way to Premium Tier</Text>
          </View>
        </FadeIn>

        <FadeIn delay={220} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>Invoice Status</Text>
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}> 
            <View style={styles.invoiceSummaryRow}>
              <View style={styles.summaryStat}><Text style={styles.summaryBig}>{invoices.length}</Text><Text style={styles.summaryLabel}>total</Text></View>
              <View style={styles.summaryStat}><Text style={styles.summaryBig}>{pending}</Text><Text style={styles.summaryLabel}>pending</Text></View>
              <View style={styles.summaryStat}><Text style={styles.summaryBig}>{completed}</Text><Text style={styles.summaryLabel}>approved</Text></View>
            </View>
            {invoices.length === 0 ? <Text style={[styles.emptyCopy, { color: theme.muted }]}>No invoices yet. Head over to the upload page to submit your first one.</Text> : invoices.slice(0, 5).map((inv, i) => <View key={i} style={styles.invoiceInfoRow}><Text style={[styles.invoiceId, { color: theme.text }]}>{inv.invoice_id}</Text><Text style={styles.infoValue}>{inv.status || inv.submission_status}</Text></View>)}
          </View>
        </FadeIn>

        <FadeIn delay={260} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>About AgriCare</Text>
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}> 
            <Text style={[styles.aboutCopy, { color: theme.muted }]}>Behn Meyer AgriCare helps retailers submit invoices, track points, learn product guidelines, and redeem rewards from verified purchases. Quick settings are now fixed on the side of the app, while this page holds the deeper account details.</Text>
          </View>
        </FadeIn>

        <FadeIn delay={300} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>Recent Point Activity</Text>
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}> 
            {history.length === 0 ? <Text style={[styles.emptyCopy, { color: theme.muted }]}>No point activity yet.</Text> : history.slice(0, 5).map((entry, idx) => <View key={idx} style={styles.invoiceInfoRow}><View style={{ flex: 1 }}><Text style={[styles.invoiceId, { color: theme.text }]}>{entry.description || 'Point activity'}</Text><Text style={[styles.smallDate, { color: theme.muted }]}>{entry.occurred_at || 'Today'}</Text></View><Text style={styles.infoValue}>{entry.points_earned ? `+${entry.points_earned}` : entry.points_redeemed ? `-${entry.points_redeemed}` : '0'}</Text></View>)}
          </View>
        </FadeIn>

        <BounceButton style={styles.logoutButton} onPress={() => router.replace('/login')}><Text style={styles.logoutText}>Log out</Text></BounceButton>
      </ScrollView>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 126 },
  topRow: { position: 'absolute', top: 40, left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 },
  profileTitle: { color: '#FFFFFF', fontSize: 25, fontWeight: '900' },
  avatar: { width: 126, height: 126, borderRadius: 63, borderWidth: 4, borderColor: '#FFFFFF', marginTop: 42 },
  name: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginTop: 10 },
  location: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', opacity: 0.96, marginTop: 2 },
  statsRow: { flexDirection: 'row', marginHorizontal: 23, marginTop: -44, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.16, shadowOffset: { width: 0, height: 8 }, shadowRadius: 17, elevation: 6 },
  stat: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 96, padding: 10, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.18)' },
  statValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', marginTop: 6, textAlign: 'center' },
  statLabel: { color: '#DCEBFF', fontSize: 8, fontWeight: '700', textAlign: 'center', marginTop: 3 },
  section: { marginHorizontal: 24, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 10 },
  infoCard: { borderRadius: 22, padding: 18, shadowColor: '#000', shadowOpacity: 0.11, shadowOffset: { width: 0, height: 6 }, shadowRadius: 14, elevation: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEF2F7', gap: 14 },
  infoLabel: { fontWeight: '800', flex: 1 },
  infoValue: { color: BM.deepBlue, fontWeight: '900', flex: 1, textAlign: 'right' },
  progressTrack: { height: 12, backgroundColor: '#E5E7EB', borderRadius: 999, overflow: 'hidden', marginTop: 18 },
  progressFill: { height: 12, backgroundColor: BM.green, borderRadius: 999 },
  progressText: { fontWeight: '800', fontSize: 11, marginTop: 8 },
  invoiceSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryStat: { flex: 1, alignItems: 'center' },
  summaryBig: { fontSize: 28, color: BM.green, fontWeight: '900' },
  summaryLabel: { color: '#64748B', fontWeight: '800', fontSize: 10 },
  invoiceInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB', gap: 10 },
  invoiceId: { fontWeight: '900', flex: 1 },
  aboutCopy: { fontWeight: '700', lineHeight: 21 },
  emptyCopy: { fontWeight: '700', lineHeight: 20 },
  smallDate: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  logoutButton: { backgroundColor: '#0A0908', borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginHorizontal: 24, marginTop: 20 },
  logoutText: { color: '#FFFFFF', fontWeight: '900' },
});
