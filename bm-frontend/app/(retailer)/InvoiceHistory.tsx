import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Navbar from '@/components/Navbar';
import { BM } from '@/constants/theme';
import { BackgroundBlobs, EmptyState, StatusPill } from '@/components/AgricareUI';
import { useApp } from '@/components/AppContext';
import { getInvoices } from '@/services/invoiceApi';

export default function InvoiceHistory() {
  const { theme } = useApp();
  const [query, setQuery] = useState('');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  useEffect(() => { getInvoices().then((data) => Array.isArray(data) && setInvoices(data)).catch(() => null); }, []);
  const filtered = useMemo(() => invoices.filter((inv) => `${inv.invoice_id} ${(inv.items || []).map((i:any)=>i.name || i.product_id).join(' ')}`.toLowerCase().includes(query.toLowerCase())), [invoices, query]);
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}> 
      <BackgroundBlobs />
      <View style={styles.header}><Text style={[styles.title, { color: theme.primary }]}>Invoice History</Text><Text style={[styles.subtitle, { color: theme.muted }]}>Search submitted invoices and tap any row for details.</Text></View>
      <View style={[styles.searchRow, { backgroundColor: theme.card, borderColor: theme.border }]}><MaterialCommunityIcons name="clipboard-text-search-outline" size={24} color={BM.green} /><TextInput style={[styles.input, { color: theme.text }]} value={query} onChangeText={setQuery} placeholder="Search by invoice or product" placeholderTextColor="#91A189" /></View>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? <EmptyState title="No invoices found" subtitle="Submit invoices from the upload tab and they will be saved here." /> : filtered.map((inv) => <Pressable key={inv.invoice_id} style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => setSelected(inv)}><View style={{ flex: 1 }}><Text style={[styles.rowTitle, { color: theme.text }]}>{inv.invoice_id}</Text><Text style={[styles.rowSub, { color: theme.muted }]}>{new Date(inv.invoice_timestamp).toLocaleDateString()} · {(inv.items || []).length} items</Text></View><StatusPill status={inv.status || inv.submission_status || 'pending'} /></Pressable>)}
      </ScrollView>
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBackdrop}><View style={[styles.modalCard, { backgroundColor: theme.card }]}> 
          <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: theme.text }]}>Invoice detail</Text><Pressable onPress={() => setSelected(null)}><Feather name="x" size={23} color={theme.text} /></Pressable></View>
          {(selected?.items || []).map((item:any, i:number) => <View key={i} style={styles.line}><Text style={[styles.lineName, { color: theme.text }]}>{item.name || item.product_id}</Text><Text style={styles.lineQty}>{item.quantity} units</Text></View>)}
          <View style={styles.points}><Text style={styles.pointsText}>Approx. points: {(selected?.points_awarded || 0).toLocaleString()}</Text></View>
        </View></View>
      </Modal>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 52, paddingBottom: 16 },
  title: { fontSize: 30, fontWeight: '900' },
  subtitle: { fontWeight: '700', fontSize: 12, marginTop: 4 },
  searchRow: { marginHorizontal: 24, height: 48, borderWidth: 1, borderRadius: 18, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 3 },
  input: { flex: 1, fontWeight: '800' },
  list: { padding: 24, paddingTop: 150, paddingBottom: 126 },
  row: { minHeight: 66, borderRadius: 18, borderWidth: 1, padding: 13, marginBottom: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.07, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 3 },
  rowTitle: { fontWeight: '900' },
  rowSub: { fontSize: 11, fontWeight: '700', marginTop: 3 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 380, borderRadius: 26, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 23, fontWeight: '900' },
  line: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingVertical: 11 },
  lineName: { fontWeight: '900' },
  lineQty: { color: BM.green, fontWeight: '900' },
  points: { backgroundColor: BM.deepBlue, borderRadius: 16, padding: 14, alignItems: 'center', marginTop: 16 },
  pointsText: { color: '#fff', fontWeight: '900' },
});
