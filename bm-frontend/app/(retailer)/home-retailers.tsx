import React, { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Navbar from '@/components/Navbar';
import { BM } from '@/constants/theme';
import { BackgroundBlobs, BounceButton, EmptyState, FadeIn, FarmHero, ProductCard, StatusPill } from '@/components/AgricareUI';
import { useApp } from '@/components/AppContext';
import { getInvoices } from '@/services/invoiceApi';
import { getProductsList } from '@/services/productsApi';
import { getUserMe } from '@/services/userApi';
import { getPointsSummary } from '@/services/rewardApi';

type Product = { product_id: string; name: string; category: string; image_url: string; points_factor: number; description?: string };
type Invoice = { invoice_id: string; invoice_timestamp?: string; date?: string; status?: string; submission_status?: string; points_awarded?: number; points?: number; items?: any[] };

function formatDate(value?: string) {
  if (!value) return 'Just now';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function HomeRetailers() {
  const { theme, t } = useApp();
  const [points, setPoints] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [query, setQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [name, setName] = useState('Retailer');

  useEffect(() => {
    Promise.all([
      getUserMe().catch(() => null),
      getPointsSummary().catch(() => null),
      getProductsList().catch(() => []),
      getInvoices().catch(() => []),
    ]).then(([user, summary, productData, invoiceData]: any[]) => {
      if (user?.name) setName(user.name);
      setPoints(Number(summary?.total_points ?? user?.total_points ?? 0));
      setProducts(Array.isArray(productData) ? productData : []);
      setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
    });
  }, []);

  const filteredProducts = useMemo(() => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase())), [products, query]);
  const pendingCount = invoices.filter((i) => (i.status || i.submission_status) !== 'completed').length;
  const completedCount = invoices.filter((i) => (i.status || i.submission_status) === 'completed').length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <BackgroundBlobs />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <FarmHero height={500} image="field_house">
          <FadeIn delay={80} style={styles.heroContent}>
            <Text style={styles.memberText}>Hi {name.split(' ')[0]}, you’re part of our AgriCare network!</Text>
            <View style={styles.pointsCircle}>
              <Text style={styles.pointsSmall}>You have earned</Text>
              <Text style={styles.pointsBig}>{points.toLocaleString()}</Text>
              <Text style={styles.pointsLabel}>POINTS</Text>
            </View>
            <View style={styles.heroActions}>
              <BounceButton style={styles.invoiceButton} onPress={() => router.push('/points-transaction')}>
                <Text style={styles.invoiceButtonText}>{t('submitInvoice')}</Text><Feather name="plus" size={15} color={BM.deepBlue} />
              </BounceButton>
              <BounceButton style={styles.productButton} onPress={() => router.push('/products-retailer')}>
                <Text style={styles.productButtonText}>{t('viewProducts')}</Text><Feather name="arrow-up-right" size={15} color="#FFFFFF" />
              </BounceButton>
            </View>
          </FadeIn>
        </FarmHero>

        <FadeIn delay={170} style={[styles.quickStats, { backgroundColor: theme.card }]}> 
          <View style={styles.quickStat}><Text style={styles.quickNumber}>{invoices.length}</Text><Text style={styles.quickLabel}>total invoices</Text></View>
          <View style={styles.quickStat}><Text style={styles.quickNumber}>{pendingCount}</Text><Text style={styles.quickLabel}>pending</Text></View>
          <View style={styles.quickStat}><Text style={styles.quickNumber}>{completedCount}</Text><Text style={styles.quickLabel}>completed</Text></View>
        </FadeIn>

        {products[0] ? (
          <FadeIn delay={230} style={[styles.seasonCard, { backgroundColor: theme.card }]}> 
            <View style={styles.seasonCopy}>
              <Text style={[styles.seasonTitle, { color: theme.text }]}>PRODUCT{`\n`}OF THE SEASON</Text>
              <Text style={[styles.seasonDesc, { color: theme.muted }]}>Tap through to compare products and point value.</Text>
              <BounceButton style={styles.miniGreen} onPress={() => router.push('/products-retailer')}><Text style={styles.miniGreenText}>Search products</Text></BounceButton>
            </View>
            <Image source={{ uri: products[2]?.image_url || products[0].image_url }} style={styles.seasonImage} />
          </FadeIn>
        ) : null}

        <FadeIn delay={280} style={[styles.activityCard, { backgroundColor: theme.card }]}> 
          <View style={styles.titleRowNoMargin}><Text style={[styles.sectionTitle, { color: theme.primary }]}>RECENT ACTIVITY</Text><Pressable onPress={() => router.push('/InvoiceHistory')}><Text style={styles.viewAll}>All invoices</Text></Pressable></View>
          {invoices.length === 0 ? (
            <EmptyState title={t('noInvoices')} subtitle="Submitted invoices will show status, product units, and points here." action={t('submitInvoice')} onPress={() => router.push('/points-transaction')} />
          ) : invoices.slice(0, 4).map((invoice) => (
            <Pressable key={invoice.invoice_id} style={[styles.invoiceRow, { borderColor: theme.border }]} onPress={() => setSelectedInvoice(invoice)}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.invoiceTitle, { color: theme.text }]}>Invoice {invoice.invoice_id}</Text>
                <Text style={[styles.invoiceDate, { color: theme.muted }]}>{formatDate(invoice.invoice_timestamp || invoice.date)} · {(invoice.items || []).length} items</Text>
              </View>
              <StatusPill status={(invoice.status || invoice.submission_status || 'pending') as string} />
            </Pressable>
          ))}
        </FadeIn>

        <FadeIn delay={330}>
          <View style={styles.titleRow}>
            <Text style={[styles.blueHeading, { color: theme.primary }]}>Recent Purchases</Text>
            <Pressable onPress={() => router.push('/products-retailer')}><Text style={styles.viewAll}>Search products →</Text></Pressable>
          </View>
          {invoices.length === 0 ? <EmptyState title={t('noPurchases')} subtitle="Once invoices are submitted, product purchases and points will appear here." /> : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
              {filteredProducts.slice(0, 5).map((product) => <ProductCard key={product.product_id} product={product} compact onPress={() => router.push('/products-retailer')} />)}
            </ScrollView>
          )}
        </FadeIn>

        <FadeIn delay={390}>
          <View style={styles.titleRow}>
            <Text style={[styles.blueHeading, { color: theme.primary }]}>Recommendations</Text>
            <Pressable onPress={() => router.push('/products-retailer')}><Text style={styles.viewAll}>View all →</Text></Pressable>
          </View>
          <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TextInput value={query} onChangeText={setQuery} placeholder="Search crop nutrition products" placeholderTextColor="#91A189" style={[styles.searchInput, { color: theme.text }]} />
            <Feather name="search" size={18} color={BM.green} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
            {filteredProducts.slice(0, 5).map((product) => <ProductCard key={`rec-${product.product_id}`} product={product} compact onPress={() => router.push('/products-retailer')} />)}
          </ScrollView>
        </FadeIn>
      </ScrollView>
      <Modal visible={!!selectedInvoice} transparent animationType="fade" onRequestClose={() => setSelectedInvoice(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}> 
            <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: theme.text }]}>Invoice details</Text><Pressable onPress={() => setSelectedInvoice(null)}><Feather name="x" size={22} color={theme.text} /></Pressable></View>
            <Text style={[styles.modalSub, { color: theme.muted }]}>ID: {selectedInvoice?.invoice_id}</Text>
            {(selectedInvoice?.items || []).map((item, i) => <View key={i} style={styles.modalLine}><Text style={[styles.modalText, { color: theme.text }]}>{item.name || item.product_id}</Text><Text style={styles.modalQty}>{item.quantity} units</Text></View>)}
            <View style={styles.modalPoints}><Text style={styles.modalPointsText}>Approx. points: {(selectedInvoice?.points_awarded || selectedInvoice?.points || 0).toLocaleString()}</Text></View>
          </View>
        </View>
      </Modal>
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 0, paddingBottom: 126 },
  heroContent: { paddingTop: 150, alignItems: 'center', marginTop: 0, paddingHorizontal: 20, paddingBottom: 28 },
  memberText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12, marginBottom: 10, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.24)', textShadowRadius: 5 },
  pointsCircle: { width: 138, height: 138, borderRadius: 69, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(104,188,69,0.55)', shadowColor: '#000', shadowOpacity: 0.14, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 5 },
  pointsSmall: { color: BM.deepBlue, fontSize: 10, fontWeight: '800' },
  pointsBig: { color: BM.deepBlue, fontSize: 29, fontWeight: '900', lineHeight: 32 },
  pointsLabel: { color: BM.ink, fontSize: 13, fontWeight: '900' },
  heroActions: { marginTop: 22, gap: 12, alignItems: 'center', paddingBottom: 22 },
  invoiceButton: { width: 202, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  invoiceButtonText: { fontSize: 13, color: BM.deepBlue, fontWeight: '900' },
  productButton: { width: 202, height: 42, borderRadius: 21, backgroundColor: BM.deepBlue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  productButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  quickStats: { marginHorizontal: 22, marginTop: 16, borderRadius: 22, flexDirection: 'row', paddingVertical: 14, shadowColor: '#000', shadowOpacity: 0.13, shadowOffset: { width: 0, height: 7 }, shadowRadius: 15, elevation: 5 },
  quickStat: { flex: 1, alignItems: 'center' },
  quickNumber: { color: BM.green, fontSize: 21, fontWeight: '900' },
  quickLabel: { color: '#7A8794', fontSize: 10, fontWeight: '800' },
  seasonCard: { marginTop: 18, marginHorizontal: 22, borderRadius: 26, padding: 16, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 5 }, shadowRadius: 12, elevation: 4 },
  seasonCopy: { flex: 1 },
  seasonTitle: { fontWeight: '900', fontSize: 19, lineHeight: 22, marginBottom: 8 },
  seasonDesc: { fontSize: 11, fontWeight: '700', lineHeight: 16 },
  seasonImage: { width: 118, height: 118, borderRadius: 20, marginLeft: 10 },
  miniGreen: { alignSelf: 'flex-start', backgroundColor: BM.green, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8, marginTop: 12 },
  miniGreenText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  activityCard: { marginTop: 18, marginHorizontal: 22, borderRadius: 22, padding: 14, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 5 }, shadowRadius: 12, elevation: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '900' },
  titleRowNoMargin: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  invoiceRow: { minHeight: 56, borderRadius: 15, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  invoiceTitle: { fontSize: 12, fontWeight: '900' },
  invoiceDate: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  titleRow: { marginTop: 20, marginHorizontal: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  blueHeading: { fontSize: 17, fontWeight: '900' },
  viewAll: { color: BM.green, fontSize: 11, fontWeight: '900' },
  horizontalCards: { paddingLeft: 22, paddingRight: 12, paddingTop: 10, paddingBottom: 6 },
  searchBox: { marginHorizontal: 22, marginTop: 10, borderWidth: 1, height: 44, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8 },
  searchInput: { flex: 1, fontSize: 13, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.42)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 380, borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 10 }, shadowRadius: 22, elevation: 9 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '900' },
  modalSub: { fontSize: 12, fontWeight: '700', marginTop: 4, marginBottom: 12 },
  modalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalText: { fontWeight: '800' },
  modalQty: { color: BM.deepBlue, fontWeight: '900' },
  modalPoints: { backgroundColor: BM.green, borderRadius: 16, padding: 13, marginTop: 16, alignItems: 'center' },
  modalPointsText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
