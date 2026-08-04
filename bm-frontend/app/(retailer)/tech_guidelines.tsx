import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Navbar from '@/components/Navbar';
import { getGuidelinesList, getNewsList } from '@/services/guidelinesApi';
import { BM } from '@/constants/theme';
import { BackgroundBlobs, BounceButton, EmptyState, FadeIn, InsetOverlay } from '@/components/AgricareUI';
import { useApp } from '@/components/AppContext';
type Guide = { guideline_id?: string | number; title: string; category?: string; body?: string; thumbnail_url?: string; hotlink?: string };
const categories = ['All', 'News', 'Articles', 'Products'];
export default function TechGuidelinesScreen() {
  const { theme } = useApp();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [active, setActive] = useState('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Guide | null>(null);
  useEffect(() => { getGuidelinesList().then((data) => Array.isArray(data) && setGuides(data)).catch(() => setGuides([])); }, []);
  const filtered = useMemo(() => guides.filter((g) => {
    const matchesCat = active === 'All' || (g.category || '').toLowerCase().includes(active.toLowerCase());
    const q = query.toLowerCase();
    const matchesQuery = !q || g.title.toLowerCase().includes(q) || (g.body || '').toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  }), [guides, active, query]);
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <BackgroundBlobs />
      <View style={styles.greenHeader}><Text style={styles.headerText}>LOOK FOR GUIDES</Text><Text style={styles.headerSub}>Real app guides from the /guidelines API</Text></View>
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TextInput placeholder="Search" placeholderTextColor="#91A189" value={query} onChangeText={setQuery} style={[styles.searchInput, { color: theme.text }]} />
          <Feather name="search" size={20} color={BM.green} />
        </View>
        <BounceButton style={styles.filterButton}><Feather name="sliders" size={20} color="#FFFFFF" /></BounceButton>
      </View>
      <View style={styles.categoryRow}>{categories.map((cat) => <Pressable key={cat} onPress={() => setActive(cat)} style={[styles.chip, active === cat && styles.chipActive]}><Text style={[styles.chipText, active === cat && { color: '#fff' }]}>{cat}</Text></Pressable>)}</View>
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? <View style={{ width: '100%' }}><EmptyState title="No guides found" subtitle="Try a different category or search term." /></View> : filtered.map((guide, i) => (
          <FadeIn key={`${guide.guideline_id || guide.title}`} delay={60 + i * 45} style={styles.cardWrap}>
            <Pressable style={[styles.guideCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => setSelected(guide)}>
              <Image source={{ uri: guide.thumbnail_url || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80' }} style={styles.cardImage} />
              <Text numberOfLines={3} style={[styles.cardTitle, { color: theme.text }]}>{guide.title}</Text>
              <View style={styles.tag}><Text style={styles.tagText}>{guide.category || 'Guide'}</Text></View>
            </Pressable>
          </FadeIn>
        ))}
      </ScrollView>
      <InsetOverlay visible={!!selected} onClose={() => setSelected(null)} align="bottom">
  <View style={[styles.mobileGuideSheet, { backgroundColor: theme.card }]}>
    <View style={styles.sheetHandle} />
    <View style={styles.modalHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.guideLabel}>{selected?.category || 'Guide'}</Text>
        <Text style={[styles.modalTitle, { color: theme.text }]}>{selected?.title}</Text>
      </View>
      <Pressable onPress={() => setSelected(null)} style={styles.closeButton}>
        <Feather name="x" size={22} color={theme.text} />
      </Pressable>
    </View>
    <ScrollView style={styles.guideBodyScroll} showsVerticalScrollIndicator={false}>
      <Image
        source={{
          uri:
            selected?.thumbnail_url ||
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80',
        }}
        style={styles.modalImage}
      />
      <Text style={[styles.modalBody, { color: theme.muted }]}>
        {selected?.body || 'No guide description available yet.'}
      </Text>
    </ScrollView>
    <BounceButton
      style={styles.modalAction}
      onPress={() => {
        const link = selected?.hotlink || '/products-retailer';
        setSelected(null);
        router.push(link as any);
      }}
    >
      <Text style={styles.modalActionText}>Open related page →</Text>
    </BounceButton>
  </View>
</InsetOverlay>
      <Navbar />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  greenHeader: { height: 196, backgroundColor: '#8DB955', borderBottomLeftRadius: 56, borderBottomRightRadius: 56, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 130, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 7 }, shadowRadius: 14 },
  headerText: { color: '#FFFFFF', fontSize: 21, fontWeight: '900', letterSpacing: 0.8 },
  headerSub: { color: '#F8FFF1', fontWeight: '800', fontSize: 10, marginTop: 5 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, marginTop: 18 },
  searchBox: { flex: 1, height: 46, borderRadius: 17, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 3 },
  searchInput: { flex: 1, fontSize: 13, fontWeight: '800' },
  filterButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: BM.deepBlue, alignItems: 'center', justifyContent: 'center' },
  categoryRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 24, marginTop: 14, flexWrap: 'wrap' },
  chip: { minWidth: 64, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#BEE8EA', alignItems: 'center' },
  chipActive: { backgroundColor: BM.deepBlue },
  chipText: { color: BM.deepBlue, fontSize: 11, fontWeight: '900' },
  grid: { paddingHorizontal: 24, paddingTop: 26, paddingBottom: 126, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },
  cardWrap: { width: '48%' },
  guideCard: { borderRadius: 17, overflow: 'hidden', minHeight: 184, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 3 },
  cardImage: { width: '100%', height: 82, backgroundColor: '#D9EAC9' },
  cardTitle: { fontSize: 10.5, fontWeight: '900', lineHeight: 15, paddingHorizontal: 10, paddingTop: 10, minHeight: 58 },
  tag: { alignSelf: 'flex-start', marginLeft: 10, marginTop: 4, backgroundColor: '#BEE8EA', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { color: '#14606B', fontSize: 9, fontWeight: '900' },
  mobileGuideSheet: {
  width: '100%',
  maxHeight: 560,
  borderRadius: 28,
  padding: 18,
  shadowColor: '#000',
  shadowOpacity: 0.18,
  shadowOffset: { width: 0, height: 10 },
  shadowRadius: 22,
  elevation: 10,
},
sheetHandle: {
  width: 46,
  height: 5,
  borderRadius: 999,
  backgroundColor: '#CBD5E1',
  alignSelf: 'center',
  marginBottom: 14,
},
closeButton: {
  width: 38,
  height: 38,
  borderRadius: 19,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(148,163,184,0.16)',
},
guideLabel: {
  color: BM.green,
  fontSize: 11,
  fontWeight: '900',
  textTransform: 'uppercase',
  marginBottom: 4,
},
guideBodyScroll: {
  maxHeight: 330,
  marginTop: 10,
},
modalImage: {
  width: '100%',
  height: 150,
  borderRadius: 20,
  marginBottom: 14,
  backgroundColor: '#D9EAC9',
},
modalTitle: {
  flex: 1,
  fontSize: 19,
  fontWeight: '900',
  lineHeight: 24,
},
modalBody: {
  lineHeight: 21,
  fontWeight: '700',
  fontSize: 13,
},
modalAction: {
  backgroundColor: BM.deepBlue,
  borderRadius: 18,
  paddingVertical: 15,
  paddingHorizontal: 18,
  marginTop: 16,
  alignItems: 'center',
},
modalActionText: {
  color: '#fff',
  fontWeight: '900',
  fontSize: 14,
},
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' },
});