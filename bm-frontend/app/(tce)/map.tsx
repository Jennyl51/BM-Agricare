import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Navbar from '@/components/Navbar';
import { BackgroundBlobs, BounceButton, FadeIn } from '@/components/AgricareUI';
import { BM } from '@/constants/theme';
import { useApp } from '@/components/AppContext';

const points = [
  { id: 'INV-1357', left: '58%', top: '28%', title: 'Entec 25KG Invoice', retailer: 'Wholesaler #37', location: 'Ta Nang, Lam Dong', type: 'invoice' },
  { id: 'REQ-076', left: '32%', top: '43%', title: 'Citrus Parasites Inspection', retailer: 'An Yên Farm', location: 'Duc Trong', type: 'consultation' },
  { id: 'INV-1359', left: '68%', top: '58%', title: 'Novatec Suprem Purchase', retailer: 'Wholesaler #13', location: 'Da Lat', type: 'invoice' },
  { id: 'INV-1349', left: '43%', top: '68%', title: 'Fruit-Ace Purchase', retailer: 'Wholesaler #57', location: 'Bao Loc', type: 'invoice' },
] as const;

type Point = (typeof points)[number];

export default function TCEMap() {
  const { theme } = useApp();
  const [selected, setSelected] = useState<Point>(points[0]);

  const openGoogleMaps = () => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.location)}`).catch(() => undefined);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <BackgroundBlobs />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeIn style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>TCE Map</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>Map API placeholder: invoice pins use the GPS / retailer-location fields from invoice creation.</Text>
        </FadeIn>

        <FadeIn delay={100} style={[styles.mapCard, { backgroundColor: theme.card }]}> 
          <View style={styles.mockMap}>
            <View style={styles.mapGridOne} />
            <View style={styles.mapGridTwo} />
            <View style={styles.river} />
            <Text style={styles.regionLabel}>Lam Dong</Text>
            {points.map((point) => (
              <Pressable key={point.id} onPress={() => setSelected(point)} style={[styles.pin, { left: point.left, top: point.top, backgroundColor: point.id === selected.id ? BM.deepBlue : point.type === 'invoice' ? BM.green : '#79B6FF' }]}> 
                <Feather name={point.type === 'invoice' ? 'file-text' : 'message-circle'} size={13} color="#FFFFFF" />
              </Pressable>
            ))}
          </View>
          <View style={styles.mapLegend}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: BM.green }]} /><Text style={styles.legendText}>invoice</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#79B6FF' }]} /><Text style={styles.legendText}>consultation</Text></View>
          </View>
        </FadeIn>

        <FadeIn delay={170} style={[styles.detailCard, { backgroundColor: theme.card }]}> 
          <View style={styles.detailHeader}>
            <View>
              <Text style={[styles.detailTitle, { color: theme.text }]}>{selected.title}</Text>
              <Text style={[styles.detailSub, { color: theme.muted }]}>{selected.id} · {selected.retailer}</Text>
            </View>
            <View style={styles.typePill}><Text style={styles.typeText}>{selected.type}</Text></View>
          </View>
          <View style={styles.locationRow}><Feather name="map-pin" size={16} color={BM.green} /><Text style={[styles.locationText, { color: theme.text }]}>{selected.location}</Text></View>
          <BounceButton style={styles.openMapButton} onPress={openGoogleMaps}><Text style={styles.openMapText}>Open in Google Maps</Text><Feather name="external-link" size={15} color="#fff" /></BounceButton>
        </FadeIn>

        <FadeIn delay={240}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Nearby work queue</Text>
          {points.map((point) => (
            <Pressable key={`row-${point.id}`} onPress={() => setSelected(point)} style={[styles.queueRow, { backgroundColor: theme.cardSoft, borderColor: selected.id === point.id ? BM.green : theme.border }]}> 
              <Feather name={point.type === 'invoice' ? 'file-text' : 'message-circle'} size={17} color={point.type === 'invoice' ? BM.green : '#79B6FF'} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.queueTitle, { color: theme.text }]}>{point.title}</Text>
                <Text style={[styles.queueMeta, { color: theme.muted }]}>{point.location}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={theme.muted} />
            </Pressable>
          ))}
        </FadeIn>

        <FadeIn delay={300} style={[styles.schemaNote, { backgroundColor: theme.card }]}> 
          <Text style={[styles.schemaTitle, { color: theme.text }]}>Database note</Text>
          <Text style={[styles.schemaText, { color: theme.muted }]}>Invoices should store gps_lat, gps_lon, retailer_id, store_name, region, city/province, and optional address_text so pins can be rendered accurately. Retailer create-invoice flow should request or infer this location.</Text>
        </FadeIn>
      </ScrollView>
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 126 },
  header: { marginBottom: 14 },
  title: { fontSize: 32, fontWeight: '900' },
  subtitle: { fontSize: 12, fontWeight: '700', lineHeight: 18, marginTop: 4 },
  mapCard: { borderRadius: 28, padding: 12, shadowColor: '#000', shadowOpacity: 0.16, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, elevation: 5 },
  mockMap: { height: 390, borderRadius: 22, overflow: 'hidden', backgroundColor: '#C7E8AD', position: 'relative' },
  mapGridOne: { position: 'absolute', width: 360, height: 360, borderRadius: 180, backgroundColor: 'rgba(255,255,255,0.28)', left: -110, top: -70 },
  mapGridTwo: { position: 'absolute', width: 270, height: 270, borderRadius: 135, backgroundColor: 'rgba(0,47,113,0.09)', right: -70, bottom: -60 },
  river: { position: 'absolute', width: 520, height: 62, backgroundColor: 'rgba(121,182,255,0.75)', transform: [{ rotate: '-18deg' }], left: -80, top: 165, borderRadius: 999 },
  regionLabel: { position: 'absolute', left: 20, top: 18, fontSize: 26, fontWeight: '900', color: 'rgba(10,9,8,0.45)' },
  pin: { position: 'absolute', width: 34, height: 34, marginLeft: -17, marginTop: -17, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 5 },
  mapLegend: { flexDirection: 'row', gap: 14, marginTop: 10, paddingHorizontal: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, fontWeight: '800', color: BM.grey },
  detailCard: { marginTop: 16, borderRadius: 22, padding: 16, shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 5 }, shadowRadius: 12, elevation: 4 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  detailTitle: { fontSize: 17, fontWeight: '900', maxWidth: 250 },
  detailSub: { fontSize: 11, fontWeight: '700', marginTop: 3 },
  typePill: { backgroundColor: BM.green, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  typeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14 },
  locationText: { fontSize: 13, fontWeight: '800' },
  openMapButton: { marginTop: 14, backgroundColor: BM.deepBlue, borderRadius: 15, paddingVertical: 13, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  openMapText: { color: '#fff', fontWeight: '900' },
  sectionTitle: { fontSize: 17, fontWeight: '900', marginTop: 20, marginBottom: 10 },
  queueRow: { borderRadius: 16, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 9 },
  queueTitle: { fontSize: 13, fontWeight: '900' },
  queueMeta: { fontSize: 10.5, fontWeight: '700', marginTop: 2 },
  schemaNote: { marginTop: 10, borderRadius: 18, padding: 14 },
  schemaTitle: { fontSize: 14, fontWeight: '900' },
  schemaText: { fontSize: 11.2, fontWeight: '700', lineHeight: 17, marginTop: 5 },
});
