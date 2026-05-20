import React, { useCallback, useMemo, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Navbar from '@/components/Navbar';
import { BackgroundBlobs, BounceButton, FadeIn, InsetOverlay } from '@/components/AgricareUI';
import FallingSprites from '@/components/FallingSprites';
import { BM } from '@/constants/theme';
import { useApp } from '@/components/AppContext';

const initialInvoices = [
  { id: 'INV-1357', product: 'Entec 25KG - Wholesaler #37', submittedBy: 'Minh', submittedAt: '04/25/2026 11:12PM', quantity: '50 units (25KG)', location: 'Ta Nang, Lam Dong', status: 'unchecked' },
  { id: 'INV-1358', product: 'Basfoliar Aktiv SL x3 - Tier-Up Gift', submittedBy: 'Bao', submittedAt: '04/25/2026 10:59PM', quantity: '3 bottles', location: 'Da Lat, Lam Dong', status: 'unchecked' },
  { id: 'INV-1359', product: 'Novatec Suprem - Wholesaler #13', submittedBy: 'Linh', submittedAt: '04/25/2026 10:18PM', quantity: '24 units', location: 'Duc Trong, Lam Dong', status: 'unchecked' },
  { id: 'INV-1349', product: 'Fruit-Ace Purchase - Wholesaler #57', submittedBy: 'Retailer #2054', submittedAt: '04/24/2026 6:14PM', quantity: '12 units', location: 'Bao Loc, Lam Dong', status: 'checked' },
  { id: 'INV-1341', product: 'Entec 25KG - Wholesaler #37', submittedBy: 'Retailer #0137', submittedAt: '04/24/2026 2:42PM', quantity: '40 units', location: 'Ta Nang, Lam Dong', status: 'checked' },
];

type Invoice = (typeof initialInvoices)[number];

export default function TCEInvoices() {
  const { theme } = useApp();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [checkFallKey, setCheckFallKey] = useState(0);
  const heroImage = require('@/assets/fields/rice_plains.jpg');

  const unchecked = useMemo(() => invoices.filter((invoice) => invoice.status === 'unchecked'), [invoices]);
  const checked = useMemo(() => invoices.filter((invoice) => invoice.status === 'checked'), [invoices]);
  const goal = 12;
  const progress = Math.min(100, Math.round((checked.length / goal) * 100));

  const finishCheckFall = useCallback(() => setCheckFallKey(0), []);

  const mark = (id: string, status: 'checked' | 'rejected') => {
    setInvoices((current) => current.map((invoice) => invoice.id === id ? { ...invoice, status } : invoice));
    setCheckFallKey((current) => current + 1);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <BackgroundBlobs />
      <FallingSprites key={`checked-fall-${checkFallKey}`} variant="crops" count={200} duration={2600} loop={false} active={checkFallKey > 0} onComplete={finishCheckFall} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ImageBackground source={heroImage} style={styles.hero} imageStyle={styles.heroImage}>
          <View style={styles.heroOverlay} />
          <Text style={styles.heroTitle}>Invoices</Text>
          <View style={[styles.counterCard, { backgroundColor: theme.card }]}> 
            <Text style={[styles.counterLabel, { color: theme.text }]}>Unchecked Invoices</Text>
            <Text style={[styles.counterNumber, { color: theme.text }]}>{unchecked.length}</Text>
          </View>
        </ImageBackground>

        <FadeIn delay={100} style={[styles.motivationCard, { backgroundColor: theme.card }]}> 
          <View style={styles.titleRowInline}>
            <View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Checked invoice tracker</Text>
              <Text style={[styles.cardSub, { color: theme.muted }]}>{checked.length}/{goal} verified today · keep the queue moving</Text>
            </View>
            <View style={styles.progressBubble}><Text style={styles.progressText}>{progress}%</Text></View>
          </View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
        </FadeIn>

        <FadeIn delay={160}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>UNPROCESSED INVOICES</Text>
          {unchecked.map((invoice) => (
            <Pressable key={invoice.id} onPress={() => setSelected(invoice)} style={[styles.invoiceCard, { backgroundColor: theme.card, borderColor: theme.border }]}> 
              <Text style={[styles.invoiceTitle, { color: theme.text }]}>{invoice.product}</Text>
              <Text style={[styles.invoiceMeta, { color: theme.muted }]}>Submitted By {invoice.submittedBy} · {invoice.submittedAt}</Text>
              <View style={styles.factRow}><Feather name="package" size={12} color={theme.text} /><Text style={[styles.factText, { color: theme.text }]}>Quantity: {invoice.quantity}</Text></View>
              <View style={styles.factRow}><Feather name="map-pin" size={12} color={theme.text} /><Text style={[styles.factText, { color: theme.text }]}>Location: {invoice.location}</Text></View>
              <View style={styles.actionsRow}>
                <BounceButton style={styles.acceptButton} onPress={() => mark(invoice.id, 'checked')}><Text style={styles.actionText}>Accept</Text></BounceButton>
                <BounceButton style={styles.rejectButton} onPress={() => mark(invoice.id, 'rejected')}><Text style={styles.actionText}>Reject</Text></BounceButton>
              </View>
            </Pressable>
          ))}
        </FadeIn>

        <FadeIn delay={230}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 16 }]}>CHECKED INVOICES</Text>
          {checked.map((invoice) => (
            <Pressable key={invoice.id} onPress={() => setSelected(invoice)} style={[styles.checkedRow, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}> 
              <Feather name="check-circle" size={18} color={BM.green} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.checkedTitle, { color: theme.text }]}>{invoice.product}</Text>
                <Text style={[styles.invoiceMeta, { color: theme.muted }]}>{invoice.location}</Text>
              </View>
              <Text style={styles.checkedTag}>checked</Text>
            </Pressable>
          ))}
        </FadeIn>
      </ScrollView>

      <InsetOverlay visible={!!selected} onClose={() => setSelected(null)} align="bottom">
        <View style={[styles.modalCard, { backgroundColor: theme.card }]}> 
          <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: theme.text }]}>Invoice detail</Text><Pressable onPress={() => setSelected(null)}><Feather name="x" size={22} color={theme.text} /></Pressable></View>
          <Text style={[styles.modalBody, { color: theme.muted }]}>This card is ready for the detailed invoice page: products, invoice items, location, attached PDF/image, approval log, notes, and status updates.</Text>
          <Text style={[styles.modalProduct, { color: theme.text }]}>{selected?.product}</Text>
          <Text style={[styles.modalLine, { color: theme.text }]}>Requester: {selected?.submittedBy}</Text>
          <Text style={[styles.modalLine, { color: theme.text }]}>Quantity: {selected?.quantity}</Text>
          <Text style={[styles.modalLine, { color: theme.text }]}>Location: {selected?.location}</Text>
          <View style={styles.fakePdf}><Feather name="image" size={22} color={BM.grey} /><Text style={styles.fakePdfText}>Invoice PDF / image preview area</Text></View>
        </View>
      </InsetOverlay>
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingBottom: 126 },
  hero: { marginHorizontal: 14, marginTop: 4, height: 250, borderBottomLeftRadius: 42, borderBottomRightRadius: 42, overflow: 'hidden', alignItems: 'center', paddingTop: 42 },
  heroImage: { resizeMode: 'cover' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,47,113,0.12)' },
  heroTitle: { color: '#FFFFFF', fontSize: 36, fontWeight: '900', textDecorationLine: 'underline', marginBottom: 24 },
  counterCard: { width: 270, borderRadius: 28, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, elevation: 5 },
  counterLabel: { fontSize: 18, fontWeight: '700' },
  counterNumber: { fontSize: 43, fontWeight: '900', marginTop: 8 },
  motivationCard: { marginHorizontal: 24, marginTop: 16, borderRadius: 18, padding: 14, shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 5 }, shadowRadius: 11, elevation: 4 },
  titleRowInline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: '900' },
  cardSub: { fontSize: 10.5, fontWeight: '700', marginTop: 3 },
  progressBubble: { width: 45, height: 45, borderRadius: 23, backgroundColor: BM.deepBlue, alignItems: 'center', justifyContent: 'center' },
  progressText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  progressTrack: { marginTop: 13, height: 9, borderRadius: 999, backgroundColor: '#E4EEDC', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: BM.green },
  sectionTitle: { marginHorizontal: 24, marginTop: 18, marginBottom: 8, fontSize: 15, fontWeight: '900' },
  invoiceCard: { marginHorizontal: 24, marginBottom: 10, borderWidth: 1, borderRadius: 14, padding: 12, shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 5 }, shadowRadius: 10, elevation: 4 },
  invoiceTitle: { fontSize: 14, fontWeight: '900', marginBottom: 3 },
  invoiceMeta: { fontSize: 9, fontWeight: '700', marginBottom: 5 },
  factRow: { flexDirection: 'row', gap: 5, alignItems: 'center', marginTop: 1 },
  factText: { fontSize: 9.5, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', justifyContent: 'center', gap: 22, marginTop: 9 },
  acceptButton: { backgroundColor: BM.green, minWidth: 118, borderRadius: 999, paddingVertical: 8, alignItems: 'center' },
  rejectButton: { backgroundColor: '#C85E62', minWidth: 118, borderRadius: 999, paddingVertical: 8, alignItems: 'center' },
  actionText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  checkedRow: { marginHorizontal: 24, marginBottom: 8, borderRadius: 14, borderWidth: 1, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 9 },
  checkedTitle: { fontSize: 12, fontWeight: '900' },
  checkedTag: { color: BM.green, fontSize: 10, fontWeight: '900' },
  modalCard: { borderRadius: 26, padding: 18 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  modalBody: { fontSize: 12, fontWeight: '700', lineHeight: 18, marginBottom: 12 },
  modalProduct: { fontSize: 15, fontWeight: '900', marginBottom: 10 },
  modalLine: { fontSize: 12, fontWeight: '800', marginBottom: 6 },
  fakePdf: { height: 120, borderRadius: 18, backgroundColor: '#EFEFEF', alignItems: 'center', justifyContent: 'center', marginTop: 10, gap: 6 },
  fakePdfText: { color: BM.grey, fontSize: 12, fontWeight: '900' },
});
