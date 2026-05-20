import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Navbar from '@/components/Navbar';
import { BM } from '@/constants/theme';
import { BackgroundBlobs, BounceButton, FadeIn, HeaderAction, InsetOverlay } from '@/components/AgricareUI';
import { useApp } from '@/components/AppContext';
import FallingSprites from '@/components/FallingSprites';
import { clearInvoiceDraft, getInvoiceDraft, setInvoiceDraft, submitInvoice } from '@/services/invoiceApi';
import { getProductsList } from '@/services/productsApi';

type Product = { product_id: string; name: string; price?: number; points_factor: number; category?: string };
type InvoiceItem = { product_id: string; name: string; quantity: string; price: string; points_factor?: number };

const fallbackItem: InvoiceItem = { product_id: 'esta-kieserite', name: 'ESTA Kieserite', quantity: '1', price: '120', points_factor: 20 };

export default function UploadInvoiceScreen() {
  const { theme, darkMode } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<InvoiceItem[]>([fallbackItem]);
  const [pdfFile, setPdfFile] = useState<{ name?: string; uri?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([getProductsList(), getInvoiceDraft()])
      .then(([productData, draftData]) => {
        if (Array.isArray(productData)) setProducts(productData);
        if (Array.isArray(draftData) && draftData.length) {
          setItems(draftData.map((item: any) => ({
            product_id: item.product_id,
            name: item.name,
            quantity: String(item.quantity ?? 1),
            price: String(item.price ?? 0),
            points_factor: item.points_factor,
          })));
        }
      })
      .catch(() => null);
  }, []);

  const approxPoints = useMemo(() => items.reduce((sum, item) => {
    const product = products.find((p) => p.product_id === item.product_id || p.name.toLowerCase() === item.name.toLowerCase());
    return sum + Number(item.quantity || 0) * Number(item.points_factor || product?.points_factor || 10);
  }, 0), [items, products]);

  const syncDraft = (next: InvoiceItem[]) => {
    setItems(next);
    setInvoiceDraft(next.map((item) => ({ ...item, quantity: Number(item.quantity || 0), price: Number(item.price || 0) }))).catch(() => null);
  };

  const updateItem = (index: number, patch: Partial<InvoiceItem>) => {
    const next = items.map((item, i) => i === index ? { ...item, ...patch } : item);
    syncDraft(next);
  };

  const removeItem = (index: number) => {
    const next = items.length === 1 ? items : items.filter((_, i) => i !== index);
    syncDraft(next.length ? next : [fallbackItem]);
  };

  const addItem = () => {
    const p = products[0] || { product_id: 'manual', name: '', price: 0, points_factor: 0 };
    syncDraft([...items, { product_id: p.product_id, name: p.name, quantity: '1', price: String(p.price || 0), points_factor: p.points_factor || 0 }]);
  };

  const chooseProduct = (index: number, product: Product) => {
    updateItem(index, { product_id: product.product_id, name: product.name, price: String(product.price || 0), points_factor: product.points_factor || 0 });
    setPickerIndex(null);
  };

  const validate = () => items.length > 0 && items.every((item) => item.name.trim() && Number(item.quantity) > 0);

  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true, multiple: false });
      if (!result.canceled) {
        const file = result.assets?.[0];
        setPdfFile({ name: file?.name, uri: file?.uri });
      }
    } catch {
      setPdfFile({ name: 'invoice-demo.pdf', uri: 'demo-invoice.pdf' });
    }
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const response = await submitInvoice({
        items: items.map((item) => ({ ...item, quantity: Number(item.quantity), price: Number(item.price || 0) })),
        invoice_photo_url: pdfFile?.uri || 'typed-invoice-demo.pdf',
      });
      setReviewOpen(false);
      setSuccess(response);
      await clearInvoiceDraft().catch(() => null);
      setItems([fallbackItem]);
      setPdfFile(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}> 
      <BackgroundBlobs />
      <FallingSprites key={`submit-fall-${success?.invoice_id || success?.id || success?.status || success?.submission_status || 'success'}`} variant="all" count={200} duration={2800} loop={false} active={!!success} />
      <View style={styles.fieldBackdrop} />
      <View style={styles.topPanel}>
        <HeaderAction title="Create Invoice" subtitle="Enter product quantities, attach the invoice PDF, then review before submitting." icon="upload-cloud" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <FadeIn delay={90} style={[styles.invoiceCard, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          <View style={styles.itemCounterRow}>
            <Text style={[styles.counterTitle, { color: theme.text }]}>Number of Invoice Items:</Text>
            <Text style={styles.counterBubble}>{items.length}</Text>
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 1, color: theme.text }]}>Product Name</Text>
            <Text style={[styles.headerCell, { width: 74, color: theme.text }]}>Units</Text>
          </View>

          {items.map((item, index) => (
            <FadeIn key={`${item.product_id}-${index}`} delay={130 + index * 35} style={styles.itemRow}>
              <Pressable onPress={() => removeItem(index)} style={styles.removeButton}><Feather name="x" size={18} color={theme.muted} /></Pressable>
              <Pressable style={[styles.productInput, { borderColor: theme.border }]} onPress={() => setPickerIndex(index)}>
                <Text numberOfLines={1} style={styles.inputText}>{item.name || 'Select product'}</Text>
              </Pressable>
              <TextInput value={item.quantity} onChangeText={(quantity) => updateItem(index, { quantity: quantity.replace(/[^0-9]/g, '') })} keyboardType="number-pad" style={[styles.unitInput, { borderColor: theme.border }]} />
            </FadeIn>
          ))}

          <Pressable onPress={addItem} style={styles.addInline}><Text style={styles.addInlineText}>Add Invoice Item</Text></Pressable>

          <View style={styles.workflowRow}>
            <BounceButton style={[styles.workflowChip, pdfFile && styles.workflowDone]} onPress={pickPdf}>
              <Feather name={pdfFile ? 'check-circle' : 'upload'} size={17} color="#fff" />
              <Text style={styles.workflowText}>{pdfFile ? 'PDF attached' : 'Attach PDF'}</Text>
            </BounceButton>
            <View style={styles.workflowArrow}><Feather name="arrow-right" size={18} color={BM.green} /></View>
            <BounceButton style={[styles.workflowChip, validate() && styles.workflowDone]} onPress={() => validate() && setReviewOpen(true)}>
              <Feather name="eye" size={17} color="#fff" />
              <Text style={styles.workflowText}>Review</Text>
            </BounceButton>
          </View>

          <Text style={styles.pdfStatus}>{pdfFile?.name ? `Selected PDF: ${pdfFile.name}` : 'No PDF selected yet — tap “Attach PDF” to choose one.'}</Text>

          <View style={[styles.previewBox, { backgroundColor: darkMode ? '#102617' : '#F4FBEF' }]}> 
            <Text style={[styles.previewLabel, { color: theme.text }]}>Submission Preview</Text>
            <View style={styles.previewPaper}>
              <View style={styles.paperHeader}><Text style={styles.previewInvoice}>INVOICE</Text><Text style={styles.paperDate}>{new Date().toLocaleDateString()}</Text></View>
              {items.slice(0, 5).map((item, i) => <View key={i} style={styles.previewLine}><Text style={styles.previewText}>{item.name}</Text><Text style={styles.previewText}>{item.quantity}</Text></View>)}
            </View>
            <Text style={styles.previewPoints}>Approx. Points: {approxPoints.toLocaleString()}</Text>
          </View>

          <View style={styles.readyBlock}>
            <Text style={[styles.readyTitle, { color: theme.text }]}>ONCE YOU’RE READY</Text>
            <Text style={[styles.readyBody, { color: theme.muted }]}>Review the invoice before sending. After submission, BM/TCE review may take up to 5 business days. Submitted invoices are saved to your account.</Text>
          </View>

          <BounceButton style={[styles.submitButton, !validate() && { opacity: 0.55 }]} onPress={() => validate() && setReviewOpen(true)}>
            <Feather name="check-square" size={22} color="#fff" />
            <Text style={styles.submitText}>Review & Submit</Text>
          </BounceButton>
        </FadeIn>
      </ScrollView>

      <InsetOverlay visible={pickerIndex !== null} onClose={() => setPickerIndex(null)} align="bottom">
        <View style={[styles.overlayCard, { backgroundColor: theme.card }]}> 
          <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: theme.text }]}>Choose product</Text><Pressable onPress={() => setPickerIndex(null)}><Feather name="x" size={22} color={theme.text} /></Pressable></View>
          <ScrollView style={{ maxHeight: 310 }} showsVerticalScrollIndicator={false}>
            {products.map((p) => (
              <Pressable key={p.product_id} style={styles.productChoice} onPress={() => pickerIndex !== null && chooseProduct(pickerIndex, p)}>
                <Text style={[styles.choiceName, { color: theme.text }]}>{p.name}</Text>
                <Text style={styles.choicePts}>{p.points_factor} pts/unit</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </InsetOverlay>

      <InsetOverlay visible={reviewOpen} onClose={() => setReviewOpen(false)} align="bottom">
        <View style={[styles.overlayCard, { backgroundColor: theme.card }]}> 
          <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: theme.text }]}>Verify invoice</Text><Pressable onPress={() => setReviewOpen(false)}><Feather name="x" size={22} color={theme.text} /></Pressable></View>
          <Text style={[styles.reviewCopy, { color: theme.muted }]}>Confirm product units, PDF attachment, and point preview before sending.</Text>
          {items.map((item, i) => <View key={i} style={styles.reviewLine}><Text style={[styles.choiceName, { color: theme.text }]}>{item.name}</Text><Text style={styles.choicePts}>{item.quantity} units</Text></View>)}
          <Text style={[styles.reviewCopy, { color: theme.muted, marginTop: 10 }]}>{pdfFile?.name ? `PDF: ${pdfFile.name}` : 'No PDF selected'}</Text>
          <View style={styles.totalPoints}><Text style={styles.totalText}>Approx. {approxPoints.toLocaleString()} points</Text></View>
          <BounceButton style={styles.submitButton} onPress={submit} disabled={submitting}><Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit Invoice'}</Text></BounceButton>
        </View>
      </InsetOverlay>

      <InsetOverlay visible={!!success} onClose={() => setSuccess(null)}>
        <View style={[styles.overlayCard, styles.successCard, { backgroundColor: theme.card }]}> 
          <View style={styles.successIcon}><Feather name="check" size={36} color="#fff" /></View>
          <Text style={[styles.modalTitle, { color: theme.text, textAlign: 'center' }]}>Invoice submitted!</Text>
          <Text style={[styles.reviewCopy, { color: theme.muted, textAlign: 'center' }]}>Status: {success?.status || success?.submission_status || 'pending'} · Approx. points: {(success?.points_awarded || approxPoints).toLocaleString()}</Text>
          <BounceButton style={styles.submitButton} onPress={() => { setSuccess(null); router.push('/home-retailers'); }}><Text style={styles.submitText}>Back to Home</Text></BounceButton>
        </View>
      </InsetOverlay>

      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fieldBackdrop: { position: 'absolute', left: 0, right: 0, top: 130, bottom: 0, opacity: 0.26, backgroundColor: '#9FD47B' },
  topPanel: { position: 'absolute', left: 0, right: 0, top: 0, backgroundColor: 'rgba(149,211,214,0.92)', borderBottomLeftRadius: 52, borderBottomRightRadius: 52, paddingBottom: 74, zIndex: 0 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 126, paddingBottom: 126 },
  invoiceCard: { borderRadius: 32, padding: 17, borderWidth: 2, shadowColor: '#000', shadowOpacity: 0.13, shadowOffset: { width: 0, height: 10 }, shadowRadius: 20, elevation: 6, zIndex: 3 },
  itemCounterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 },
  counterTitle: { fontSize: 16, fontWeight: '900', textDecorationLine: 'underline' },
  counterBubble: { overflow: 'hidden', backgroundColor: '#91BE57', color: BM.ink, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, fontWeight: '900' },
  tableHeader: { flexDirection: 'row', paddingLeft: 30, marginBottom: 7 },
  headerCell: { fontSize: 13, fontWeight: '900', textAlign: 'center' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 9 },
  removeButton: { width: 24, alignItems: 'center' },
  productInput: { flex: 1, height: 42, borderWidth: 1, borderRadius: 11, justifyContent: 'center', paddingHorizontal: 10, backgroundColor: '#fff' },
  inputText: { textAlign: 'center', fontWeight: '800', color: '#4B5563', fontSize: 12 },
  unitInput: { width: 66, height: 42, borderWidth: 1, borderRadius: 11, textAlign: 'center', fontWeight: '800', color: '#4B5563', backgroundColor: '#FFFFFF' },
  addInline: { alignSelf: 'flex-end', marginVertical: 8 },
  addInlineText: { color: BM.deepBlue, fontWeight: '900', textDecorationLine: 'underline' },
  workflowRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 14, marginBottom: 8 },
  workflowChip: { minWidth: 124, height: 45, borderRadius: 16, backgroundColor: BM.deepBlue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 12 },
  workflowDone: { backgroundColor: BM.green },
  workflowText: { color: '#fff', fontWeight: '900', fontSize: 11 },
  workflowArrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  pdfStatus: { color: '#64748B', fontWeight: '700', fontSize: 11, textAlign: 'center', marginBottom: 8 },
  previewBox: { marginTop: 8, borderRadius: 20, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#DBEAD3' },
  previewLabel: { fontWeight: '900', marginBottom: 7, fontSize: 15 },
  previewPaper: { width: '86%', backgroundColor: '#FFFFFF', padding: 12, minHeight: 130, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8 },
  paperHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  previewInvoice: { color: BM.ink, fontSize: 14, fontWeight: '900' },
  paperDate: { color: '#94A3B8', fontSize: 8, fontWeight: '800' },
  previewLine: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingVertical: 5 },
  previewText: { fontSize: 9, color: '#334155', fontWeight: '700' },
  previewPoints: { color: BM.deepBlue, marginTop: 10, fontWeight: '900' },
  readyBlock: { marginTop: 20 },
  readyTitle: { fontSize: 26, fontWeight: '900', letterSpacing: 0.6, lineHeight: 31 },
  readyBody: { fontWeight: '700', fontSize: 12.5, lineHeight: 18, marginTop: 8 },
  submitButton: { alignSelf: 'center', marginTop: 18, minWidth: 190, height: 56, borderRadius: 18, backgroundColor: BM.deepBlue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 20 },
  submitText: { color: '#fff', fontSize: 17, fontWeight: '900' },
  overlayCard: { width: '100%', borderRadius: 26, padding: 18 },
  successCard: { alignItems: 'center', maxWidth: 360, alignSelf: 'center' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { fontSize: 23, fontWeight: '900' },
  productChoice: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  choiceName: { fontWeight: '900', flex: 1 },
  choicePts: { color: BM.green, fontWeight: '900' },
  reviewCopy: { fontWeight: '700', lineHeight: 19, marginBottom: 10 },
  reviewLine: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingVertical: 10 },
  totalPoints: { backgroundColor: BM.green, borderRadius: 17, padding: 15, alignItems: 'center', marginTop: 8 },
  totalText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  successIcon: { width: 70, height: 70, borderRadius: 35, backgroundColor: BM.green, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
});
