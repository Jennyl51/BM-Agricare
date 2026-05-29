import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Navbar from '@/components/Navbar';
import { BackgroundBlobs, BounceButton, FadeIn, InsetOverlay } from '@/components/AgricareUI';
import { BM } from '@/constants/theme';
import { useApp } from '@/components/AppContext';

const requests = [
  { id: 'REQ-076', title: 'Citrus Parasites Inspection', requester: 'An Yên Farm', region: 'Duc Trong', priority: 'high', time: 'Today 11:06 AM', status: 'Assigned' },
  { id: 'REQ-082', title: 'Soil Health Check', requester: 'Anh’s Farm', region: 'Ta Nang', priority: 'medium', time: 'Today 9:00 AM', status: 'Scheduled' },
  { id: 'REQ-091', title: 'Product Inquiry: Basfoliar Aktiv', requester: 'Van Tin', region: 'Da Lat', priority: 'low', time: 'Tomorrow 1:00 PM', status: 'Call' },
  { id: 'REQ-095', title: 'Crop Nutrition Follow-Up', requester: 'Retailer #2054', region: 'Bao Loc', priority: 'medium', time: 'Apr 23 3:30 PM', status: 'Pending' },
] as const;

type RequestItem = (typeof requests)[number];

export default function ConsultationRequest() {
  const { theme } = useApp();
  const [selected, setSelected] = useState<RequestItem | null>(null);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <BackgroundBlobs />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeIn style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Consultation Requests</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>Work queue for field visits, product questions, and retailer/farm support.</Text>
        </FadeIn>

        <FadeIn delay={100} style={styles.kpiRow}>
          <View style={[styles.kpi, { backgroundColor: theme.card }]}><Text style={styles.kpiNumber}>8</Text><Text style={[styles.kpiLabel, { color: theme.text }]}>open</Text></View>
          <View style={[styles.kpi, { backgroundColor: theme.card }]}><Text style={styles.kpiNumber}>3</Text><Text style={[styles.kpiLabel, { color: theme.text }]}>urgent</Text></View>
          <View style={[styles.kpi, { backgroundColor: theme.card }]}><Text style={styles.kpiNumber}>5</Text><Text style={[styles.kpiLabel, { color: theme.text }]}>today</Text></View>
        </FadeIn>

        <FadeIn delay={160} style={[styles.routeCard, { backgroundColor: theme.cardSoft }]}> 
          <Feather name="navigation" size={22} color={BM.deepBlue} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.routeTitle, { color: theme.text }]}>Suggested field route</Text>
            <Text style={[styles.routeText, { color: theme.muted }]}>Group An Yên Farm + Ta Nang requests after clearing the high-priority invoice queue.</Text>
          </View>
        </FadeIn>

        <FadeIn delay={220}>
          {requests.map((request) => (
            <Pressable key={request.id} onPress={() => setSelected(request)} style={[styles.requestCard, { backgroundColor: theme.card, borderColor: theme.border }]}> 
              <View style={styles.requestTop}>
                <View style={styles.iconBox}><Feather name="message-circle" size={18} color={BM.deepBlue} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.requestTitle, { color: theme.text }]}>{request.title}</Text>
                  <Text style={[styles.requestMeta, { color: theme.muted }]}>{request.requester} · {request.region}</Text>
                </View>
                <View style={[styles.priorityPill, request.priority === 'high' ? styles.high : request.priority === 'medium' ? styles.medium : styles.low]}><Text style={styles.priorityText}>{request.priority}</Text></View>
              </View>
              <View style={styles.requestBottom}>
                <Text style={[styles.timeText, { color: theme.muted }]}>{request.time}</Text>
                <Text style={styles.statusText}>{request.status}</Text>
              </View>
            </Pressable>
          ))}
        </FadeIn>
      </ScrollView>

      <InsetOverlay visible={!!selected} onClose={() => setSelected(null)} align="bottom">
        <View style={[styles.modalCard, { backgroundColor: theme.card }]}> 
          <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: theme.text }]}>Request detail</Text><Pressable onPress={() => setSelected(null)}><Feather name="x" size={22} color={theme.text} /></Pressable></View>
          <Text style={[styles.modalRequest, { color: theme.text }]}>{selected?.title}</Text>
          <Text style={[styles.modalLine, { color: theme.muted }]}>Requester: {selected?.requester}</Text>
          <Text style={[styles.modalLine, { color: theme.muted }]}>Region: {selected?.region}</Text>
          <Text style={[styles.modalLine, { color: theme.muted }]}>Scheduled: {selected?.time}</Text>
          <Text style={[styles.modalCopy, { color: theme.muted }]}>Future detailed log: assigned employee, approval/reassignment log, notes/comments, status updates, and visit results.</Text>
          <View style={styles.modalActions}>
            <BounceButton style={styles.accept}><Text style={styles.actionText}>Accept</Text></BounceButton>
            <BounceButton style={styles.secondary}><Text style={styles.secondaryText}>Reschedule</Text></BounceButton>
          </View>
        </View>
      </InsetOverlay>
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 150, paddingBottom: 126 },
  header: { marginBottom: 14 },
  title: { fontSize: 30, fontWeight: '900' },
  subtitle: { fontSize: 12, fontWeight: '700', lineHeight: 18, marginTop: 4 },
  kpiRow: { flexDirection: 'row', gap: 10 },
  kpi: { flex: 1, borderRadius: 18, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 9, elevation: 3 },
  kpiNumber: { color: BM.deepBlue, fontSize: 30, fontWeight: '900' },
  kpiLabel: { fontSize: 11, fontWeight: '900' },
  routeCard: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', borderRadius: 18, padding: 14, marginTop: 14, borderWidth: 1, borderColor: 'rgba(0,47,113,0.12)' },
  routeTitle: { fontSize: 14, fontWeight: '900' },
  routeText: { fontSize: 11, fontWeight: '700', lineHeight: 17, marginTop: 3 },
  requestCard: { borderWidth: 1, borderRadius: 18, padding: 13, marginTop: 11, shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 4 }, shadowRadius: 9, elevation: 3 },
  requestTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 36, height: 36, borderRadius: 13, backgroundColor: '#E8F5FF', alignItems: 'center', justifyContent: 'center' },
  requestTitle: { fontSize: 14, fontWeight: '900' },
  requestMeta: { fontSize: 10.5, fontWeight: '700', marginTop: 2 },
  priorityPill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  high: { backgroundColor: '#C85E62' },
  medium: { backgroundColor: '#F2A14A' },
  low: { backgroundColor: BM.green },
  priorityText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  requestBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, borderTopWidth: 1, borderTopColor: '#E8E8E8', paddingTop: 9 },
  timeText: { fontSize: 10.5, fontWeight: '800' },
  statusText: { fontSize: 10.5, fontWeight: '900', color: BM.green },
  modalCard: { borderRadius: 26, padding: 18 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  modalRequest: { fontSize: 17, fontWeight: '900', marginTop: 12, marginBottom: 8 },
  modalLine: { fontSize: 12, fontWeight: '800', marginBottom: 5 },
  modalCopy: { fontSize: 12, fontWeight: '700', lineHeight: 18, marginTop: 8 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  accept: { flex: 1, backgroundColor: BM.green, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  secondary: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BM.green, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '900' },
  secondaryText: { color: BM.green, fontWeight: '900' },
});
