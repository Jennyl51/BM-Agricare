import React from 'react';
import { ImageBackground, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Navbar from '@/components/Navbar';
import { BackgroundBlobs, BounceButton, FadeIn } from '@/components/AgricareUI';
import { BM } from '@/constants/theme';
import { useApp } from '@/components/AppContext';

const invoiceQueue = [
  { id: '#1357', title: 'Entec 25KG Purchase at Wholesaler #37', store: 'retailer #0137', time: '10:59', status: 'Approved', color: BM.green },
  { id: '#076', title: 'Citrus Parasites Inspection', store: 'An Yên Farm', time: '11:06', status: 'Assigned', color: '#86CFE1' },
  { id: '#557', title: 'Fruit-Ace Purchase at Wholesaler #57', store: 'retailer #2054', time: '10:50', status: 'Denied', color: '#C65D60' },
  { id: '#120', title: 'Basfoliar Aktiv SL x3 Gift Approval', store: 'retailer #0798', time: '10:19', status: 'Gift shipped', color: '#F5D267' },
];

const events = [
  { hour: '9AM', title: 'Soil Health Check at Anh’s Farm', place: '40 Phú Trọng, Tiền Bình', type: 'field' },
  { hour: '11AM', title: 'Meeting with Tran', place: 'Settlement Office', type: 'meeting' },
  { hour: '1PM', title: 'Product Inquiry Call with Van Tin', place: 'AgriCare Support', type: 'call' },
];

function openGoogleCalendar() {
  const url = 'https://calendar.google.com/calendar/u/0/r';
  Linking.openURL(url).catch(() => undefined);
}

export default function TCEDashboard() {
  const { theme, darkMode } = useApp();
  const heroImage = require('@/assets/fields/field_house.jpg');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <BackgroundBlobs />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ImageBackground source={heroImage} style={styles.hero} imageStyle={styles.heroImage}>
          <View style={styles.heroOverlay} />
          <FadeIn style={styles.heroCopy}>
            <Text style={styles.heroSmall}>Today is</Text>
            <Text style={styles.heroTitle}>Monday</Text>
            <Text style={styles.heroDate}>April 20th, 2026</Text>
          </FadeIn>
        </ImageBackground>

        <FadeIn delay={120} style={styles.sectionTight}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Pending Actions</Text>
          <View style={styles.statGrid}>
            <Pressable onPress={() => router.push('/invoices' as any)} style={[styles.statCard, { backgroundColor: theme.card }]}> 
              <Feather name="file-text" size={24} color="#78C8D9" />
              <Text style={[styles.statNumber, { color: theme.text }]}>8</Text>
              <Text style={[styles.statLabel, { color: theme.text }]}>INVOICES</Text>
              <Text style={[styles.statSub, { color: theme.muted }]}>Last updated 04/18 13:57</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/consulation-request' as any)} style={[styles.statCard, { backgroundColor: theme.card }]}> 
              <Feather name="folder" size={24} color={BM.green} />
              <Text style={[styles.statNumber, { color: theme.text }]}>8</Text>
              <Text style={[styles.statLabel, { color: theme.text }]}>CONSULTATION{`\n`}REQUESTS</Text>
              <Text style={[styles.statSub, { color: theme.muted }]}>Last updated 04/18 13:57</Text>
            </Pressable>
          </View>
        </FadeIn>

        <FadeIn delay={190} style={[styles.calendarCard, { backgroundColor: theme.card }]}> 
          <View style={styles.titleRow}>
            <View style={styles.titleIconRow}><Feather name="calendar" size={17} color={BM.grey} /><Text style={[styles.cardTitle, { color: theme.text }]}>Upcoming Events</Text></View>
            <BounceButton onPress={openGoogleCalendar} style={styles.calendarButton}><Text style={styles.calendarButtonText}>Google</Text></BounceButton>
          </View>
          <View style={styles.timeline}>
            {events.map((event) => (
              <View key={event.title} style={styles.timelineRow}>
                <Text style={[styles.timeLabel, { color: theme.muted }]}>{event.hour}</Text>
                <View style={[styles.eventPill, { backgroundColor: event.type === 'field' ? '#F4FBEF' : '#EAF6FF', borderColor: event.type === 'field' ? BM.green : '#74A7E6' }]}> 
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventPlace}>{event.place}</Text>
                </View>
              </View>
            ))}
          </View>
        </FadeIn>

        <FadeIn delay={260}>
          <View style={styles.titleRow}><Text style={[styles.sectionTitle, { color: theme.text }]}>RECENT ACTIVITIES</Text><Text style={styles.linkText}>slide →</Text></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slider}>
            {invoiceQueue.map((item) => (
              <Pressable key={item.id} onPress={() => item.title.includes('Purchase') ? router.push('/invoices' as any) : router.push('/consulation-request' as any)} style={[styles.activityCard, { backgroundColor: darkMode ? '#102617' : '#FFFFFF' }]}> 
                <View style={styles.activityHeader}><Text style={[styles.activityType, { color: theme.muted }]}>{item.title.includes('Purchase') ? 'Invoice' : 'Consultation'}</Text><Feather name="more-vertical" size={16} color={theme.muted} /></View>
                <Text style={[styles.activityTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.activityMeta, { color: theme.muted }]}>Submitted by {item.store} · Last updated at {item.time}</Text>
                <View style={[styles.statusPill, { backgroundColor: item.color }]}><Text style={styles.statusText}>{item.status}</Text></View>
              </Pressable>
            ))}
          </ScrollView>
        </FadeIn>

        <FadeIn delay={330} style={[styles.tipCard, { backgroundColor: theme.cardSoft }]}> 
          <Feather name="zap" size={20} color={BM.green} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.tipTitle, { color: theme.text }]}>Daily workflow</Text>
            <Text style={[styles.tipText, { color: theme.muted }]}>Clear urgent invoices first, then open the map to group nearby retailer visits and consultation requests.</Text>
          </View>
        </FadeIn>
      </ScrollView>
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingBottom: 126 },
  hero: { height: 250, marginHorizontal: 8, marginTop: 4, borderBottomLeftRadius: 42, borderBottomRightRadius: 42, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  heroImage: { resizeMode: 'cover' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(236,248,221,0.18)' },
  heroCopy: { alignItems: 'center', marginTop: 24 },
  heroSmall: { fontSize: 19, fontWeight: '900', color: '#0A0908' },
  heroTitle: { fontSize: 43, lineHeight: 47, fontWeight: '900', color: '#0A0908' },
  heroDate: { fontSize: 15, fontWeight: '900', color: '#0A0908' },
  sectionTight: { marginTop: -28, paddingHorizontal: 22 },
  sectionTitle: { fontSize: 17, fontWeight: '900', marginBottom: 10 },
  statGrid: { flexDirection: 'row', gap: 18 },
  statCard: { flex: 1, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 12, minHeight: 136, shadowColor: '#000', shadowOpacity: 0.18, shadowOffset: { width: 0, height: 6 }, shadowRadius: 11, elevation: 5 },
  statNumber: { fontSize: 34, fontWeight: '900', textAlign: 'center', marginTop: 8 },
  statLabel: { fontSize: 12, fontWeight: '900', textAlign: 'center' },
  statSub: { fontSize: 8.5, fontWeight: '700', textAlign: 'center', marginTop: 5 },
  calendarCard: { marginHorizontal: 22, marginTop: 20, borderRadius: 18, padding: 14, shadowColor: '#000', shadowOpacity: 0.14, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 4 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 22, marginTop: 18, marginBottom: 8 },
  titleIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { fontSize: 13, fontWeight: '900' },
  calendarButton: { backgroundColor: BM.deepBlue, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  calendarButtonText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  timeline: { gap: 8, marginTop: 10 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeLabel: { width: 34, fontSize: 11, fontWeight: '800' },
  eventPill: { flex: 1, borderWidth: 1.5, borderRadius: 13, paddingVertical: 8, paddingHorizontal: 10 },
  eventTitle: { color: '#0A0908', fontSize: 11, fontWeight: '900' },
  eventPlace: { color: '#48525C', fontSize: 9.5, fontWeight: '700', marginTop: 2 },
  linkText: { fontSize: 11, color: BM.green, fontWeight: '900' },
  slider: { paddingHorizontal: 22, paddingRight: 34, gap: 10 },
  activityCard: { width: 305, borderRadius: 14, padding: 12, shadowColor: '#000', shadowOpacity: 0.13, shadowOffset: { width: 0, height: 4 }, shadowRadius: 9, elevation: 3 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  activityType: { fontSize: 9, fontWeight: '800' },
  activityTitle: { fontSize: 13, fontWeight: '900', marginTop: 3 },
  activityMeta: { fontSize: 8.5, fontWeight: '700', marginTop: 2 },
  statusPill: { alignSelf: 'flex-start', marginTop: 7, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  statusText: { fontSize: 8.5, fontWeight: '900', color: '#FFFFFF' },
  tipCard: { margin: 22, borderRadius: 18, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start', borderWidth: 1, borderColor: 'rgba(104,188,69,0.25)' },
  tipTitle: { fontSize: 13, fontWeight: '900' },
  tipText: { fontSize: 11, fontWeight: '700', lineHeight: 16, marginTop: 3 },
});
