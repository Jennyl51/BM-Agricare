import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Navbar from '@/components/Navbar';
import { BM } from '@/constants/theme';
import { BackgroundBlobs, BounceButton, FadeIn, InsetOverlay, ProductCard } from '@/components/AgricareUI';
import { useApp } from '@/components/AppContext';
import { getProductsList } from '@/services/productsApi';
import { getInvoiceDraft, setInvoiceDraft } from '@/services/invoiceApi';

type Product = { product_id: string; name: string; category: string; image_url: string; points_factor: number; description?: string; price?: number };

export default function ProductsRetailer() {
  const { theme } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<Product | null>(null);
  const [units, setUnits] = useState('1');
  const [notice, setNotice] = useState('');

  useEffect(() => { getProductsList().then((data) => Array.isArray(data) && setProducts(data)).catch(() => null); }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 1800);
    return () => clearTimeout(timer);
  }, [notice]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map((p) => p.category)))], [products]);
  const filtered = products.filter((p) => (category === 'All' || p.category === category) && (p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase())));
  const currentUnits = Math.max(1, Number(units || 1));
  const selectedPoints = (selected?.points_factor || 0) * currentUnits;

  const addToInvoice = async () => {
    if (!selected) return;
    const draft = await getInvoiceDraft().catch(() => []);
    const next = Array.isArray(draft) ? [...draft] : [];
    const existingIndex = next.findIndex((item: any) => item.product_id === selected.product_id);
    if (existingIndex >= 0) {
      const oldQty = Number(next[existingIndex].quantity || 0);
      next[existingIndex] = { ...next[existingIndex], quantity: oldQty + currentUnits };
    } else {
      next.push({
        product_id: selected.product_id,
        name: selected.name,
        quantity: currentUnits,
        price: Number(selected.price || 0),
        points_factor: selected.points_factor,
      });
    }
    await setInvoiceDraft(next);
    setNotice(`${selected.name} added to invoice`);
    setSelected(null);
    setUnits('1');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <BackgroundBlobs />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primary }]}>Products</Text>
        <View style={[styles.search, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Feather name="search" size={18} color={BM.green} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search products" placeholderTextColor="#91A189" style={[styles.searchInput, { color: theme.text }]} />
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {categories.map((c) => <Pressable key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.chipActive]}><Text style={[styles.chipText, category === c && { color: '#fff' }]}>{c}</Text></Pressable>)}
        </ScrollView>
        <View style={styles.grid}>{filtered.map((product, i) => <FadeIn key={product.product_id} delay={i * 40} style={styles.productWrap}><ProductCard product={product} onPress={() => { setSelected(product); setUnits('1'); }} /></FadeIn>)}</View>
      </ScrollView>

      <InsetOverlay visible={!!selected} onClose={() => setSelected(null)} align="bottom">
        <View style={[styles.modalCard, { backgroundColor: theme.card }]}> 
          <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: theme.text }]}>{selected?.name}</Text><Pressable onPress={() => setSelected(null)}><Feather name="x" size={22} color={theme.text} /></Pressable></View>
          <Text style={styles.points}>{selected?.points_factor} points per unit</Text>
          <Text style={[styles.description, { color: theme.muted }]}>{selected?.description || 'Tap add to invoice to place this product into the invoice draft before uploading the final PDF.'}</Text>

          <View style={styles.invoicePanel}>
            <Text style={[styles.panelTitle, { color: theme.text }]}>Add to invoice</Text>
            <View style={styles.unitsRow}>
              <Text style={[styles.unitsLabel, { color: theme.muted }]}>Units</Text>
              <View style={styles.stepperWrap}>
                <Pressable style={styles.stepperButton} onPress={() => setUnits(String(Math.max(1, currentUnits - 1)))}><Feather name="minus" size={16} color="#fff" /></Pressable>
                <TextInput value={units} onChangeText={(value) => setUnits(value.replace(/[^0-9]/g, '') || '1')} keyboardType="number-pad" style={[styles.unitsInput, { color: theme.text, borderColor: theme.border }]} />
                <Pressable style={styles.stepperButton} onPress={() => setUnits(String(currentUnits + 1))}><Feather name="plus" size={16} color="#fff" /></Pressable>
              </View>
            </View>
            <View style={styles.pointsMeterTrack}><View style={[styles.pointsMeterFill, { width: `${Math.min(100, Math.max(16, selectedPoints))}%` }]} /></View>
            <Text style={styles.pointsMeterLabel}>{selectedPoints} estimated points</Text>
            <BounceButton style={styles.addButton} onPress={addToInvoice}><Text style={styles.addButtonText}>Add to Invoice</Text></BounceButton>
          </View>
        </View>
      </InsetOverlay>

      {!!notice ? <View style={styles.notice}><Text style={styles.noticeText}>{notice}</Text></View> : null}
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 12 },
  title: { fontSize: 31, fontWeight: '900', marginBottom: 12 },
  search: { height: 46, borderRadius: 17, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 3 },
  searchInput: { flex: 1, fontWeight: '800' },
  content: { paddingHorizontal: 22, paddingTop: 140, paddingBottom: 126 },
  categories: { gap: 8, marginBottom: 16, paddingRight: 20 },
  chip: { backgroundColor: '#DBEAFE', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive: { backgroundColor: BM.deepBlue },
  chipText: { color: BM.deepBlue, fontWeight: '900', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },
  productWrap: { width: '48%', alignItems: 'center' },
  modalCard: { width: '100%', borderRadius: 26, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  modalTitle: { flex: 1, fontSize: 24, fontWeight: '900' },
  points: { color: BM.green, fontWeight: '900', fontSize: 18, marginTop: 10 },
  description: { fontWeight: '700', lineHeight: 21, marginTop: 8 },
  invoicePanel: { marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  panelTitle: { fontSize: 18, fontWeight: '900', marginBottom: 12 },
  unitsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  unitsLabel: { fontWeight: '800', fontSize: 13 },
  stepperWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepperButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: BM.deepBlue },
  unitsInput: { width: 64, height: 40, borderWidth: 1, borderRadius: 12, textAlign: 'center', fontWeight: '900', backgroundColor: '#FFFFFF' },
  pointsMeterTrack: { height: 12, borderRadius: 999, backgroundColor: '#E5E7EB', overflow: 'hidden', marginTop: 16 },
  pointsMeterFill: { height: 12, borderRadius: 999, backgroundColor: BM.green },
  pointsMeterLabel: { color: BM.deepBlue, fontWeight: '900', marginTop: 8 },
  addButton: { marginTop: 14, height: 50, borderRadius: 16, backgroundColor: BM.deepBlue, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
  notice: { position: 'absolute', left: 22, right: 22, bottom: 108, backgroundColor: BM.green, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.14, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 6 },
  noticeText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '900' },
});
