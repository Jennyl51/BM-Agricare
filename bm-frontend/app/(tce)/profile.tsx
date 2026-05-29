import React, { useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Navbar from '@/components/Navbar';
import { BackgroundBlobs, BounceButton, FadeIn, InsetOverlay } from '@/components/AgricareUI';
import { BM } from '@/constants/theme';
import { useApp } from '@/components/AppContext';

const setupSteps = [
  { key: 'photo', title: 'Profile photo', placeholder: 'Upload required photo' },
  { key: 'first', title: 'First name', placeholder: 'Tin' },
  { key: 'last', title: 'Last name', placeholder: 'Van' },
  { key: 'region', title: 'Region / location', placeholder: 'Lam Dong' },
  { key: 'phone', title: 'Phone number', placeholder: '+84 000 000 000' },
  { key: 'username', title: 'Username', placeholder: 'tin.van@bm-agricare.com' },
  { key: 'password', title: 'Password', placeholder: '••••••••' },
];

type SetupStep = (typeof setupSteps)[number];

export default function TCEProfile() {
  const { theme } = useApp();
  const [active, setActive] = useState<SetupStep | null>(null);
  const [form, setForm] = useState({ first: 'Tin', last: 'Van', region: 'Lam Dong', phone: '+84 000 000 000', username: 'tin.van@bm-agricare.com' });
  const heroImage = require('@/assets/fields/crops.jpg');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top']}>
      <BackgroundBlobs />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ImageBackground source={heroImage} style={styles.hero} imageStyle={styles.heroImage}>
          <View style={styles.heroShade} />
          <Text style={styles.heroTitle}>Profile</Text>
          <View style={styles.avatar}><Feather name="user" size={64} color={BM.grey} /></View>
          <BounceButton style={styles.photoButton} onPress={() => setActive(setupSteps[0])}><Text style={styles.photoText}>Upload Photo</Text></BounceButton>
        </ImageBackground>

        <FadeIn delay={120} style={styles.infoBlock}>
          <View style={[styles.field, { backgroundColor: theme.card }]}><Text style={[styles.fieldLabel, { color: theme.text }]}>Name/User</Text><Text style={[styles.fieldValue, { color: theme.muted }]}>{form.first} {form.last}</Text></View>
          <View style={[styles.field, { backgroundColor: theme.card }]}><Text style={[styles.fieldLabel, { color: theme.text }]}>Region</Text><Text style={[styles.fieldValue, { color: theme.muted }]}>{form.region}</Text></View>
          <View style={[styles.field, { backgroundColor: theme.card }]}><Text style={[styles.fieldLabel, { color: theme.text }]}>Email</Text><Text style={[styles.fieldValue, { color: theme.muted }]}>{form.username}</Text></View>
          <View style={[styles.field, { backgroundColor: theme.card }]}><Text style={[styles.fieldLabel, { color: theme.text }]}>Phone #</Text><Text style={[styles.fieldValue, { color: theme.muted }]}>{form.phone}</Text></View>

          <View style={[styles.assignedBox, { backgroundColor: theme.card }]}> 
            <Text style={[styles.assignedTitle, { color: theme.text }]}>Assigned Retailers</Text>
            {['Wholesaler #37 — Ta Nang', 'Retailer #0137 — Lam Dong', 'An Yên Farm — Duc Trong', 'Retailer #2054 — Bao Loc'].map((retailer) => (
              <View key={retailer} style={styles.assignedLine}><Text style={[styles.assignedText, { color: theme.text }]}>{retailer}</Text></View>
            ))}
          </View>
        </FadeIn>

        <FadeIn delay={190} style={styles.buttonStack}>
          <BounceButton style={styles.primaryButton}><Text style={styles.primaryText}>View Past Activities</Text></BounceButton>
          <BounceButton style={styles.greenButton} onPress={() => setActive(setupSteps[1])}><Text style={styles.greenText}>Edit User Settings</Text></BounceButton>
        </FadeIn>

        <FadeIn delay={260} style={[styles.setupCard, { backgroundColor: theme.card }]}> 
          <Text style={[styles.setupTitle, { color: theme.text }]}>Profile setup checklist</Text>
          <Text style={[styles.setupSub, { color: theme.muted }]}>Every TCE user should complete these formal account steps before field work.</Text>
          {setupSteps.map((step, index) => (
            <Pressable key={step.key} onPress={() => setActive(step)} style={[styles.setupRow, { borderColor: theme.border }]}> 
              <View style={styles.stepCircle}><Text style={styles.stepNumber}>{index + 1}</Text></View>
              <Text style={[styles.stepTitle, { color: theme.text }]}>{step.title}</Text>
              <Feather name="chevron-right" size={17} color={theme.muted} />
            </Pressable>
          ))}
        </FadeIn>

        <BounceButton style={styles.logoutButton} onPress={() => router.replace('/login')}>
          <Feather name="log-out" size={17} color="#FFFFFF" />
          <Text style={styles.logoutText}>Log out</Text>
        </BounceButton>
      </ScrollView>

      <InsetOverlay visible={!!active} onClose={() => setActive(null)} align="bottom">
        <View style={[styles.modalCard, { backgroundColor: theme.card }]}> 
          <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: theme.text }]}>{active?.title}</Text><Pressable onPress={() => setActive(null)}><Feather name="x" size={22} color={theme.text} /></Pressable></View>
          <Text style={[styles.modalCopy, { color: theme.muted }]}>Use this as a dedicated setup page or mobile-friendly popup. It stays inside the phone frame.</Text>
          {active?.key === 'photo' ? (
            <View style={styles.uploadDrop}><Feather name="camera" size={30} color={BM.green} /><Text style={styles.uploadText}>Tap to add official employee photo</Text></View>
          ) : (
            <TextInput style={[styles.modalInput, { color: theme.text, borderColor: theme.border }]} placeholder={active?.placeholder} placeholderTextColor="#91A189" secureTextEntry={active?.key === 'password'} value={(form as any)[active?.key || ''] || ''} onChangeText={(value) => active && setForm((current) => ({ ...current, [active.key]: value }))} />
          )}
          <BounceButton style={styles.saveButton} onPress={() => setActive(null)}><Text style={styles.saveText}>Save</Text></BounceButton>
        </View>
      </InsetOverlay>
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingTop: 0, paddingBottom: 126 },
  hero: { height: 486, justifyContent: 'flex-start', alignItems: 'center', overflow: 'hidden', paddingTop: 148 },
  heroImage: { resizeMode: 'cover' },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.20)' },
  heroTitle: { color: '#fff', fontSize: 30, fontWeight: '900', marginBottom: 18, marginTop: 0 },
  avatar: { width: 150, height: 150, borderRadius: 75, backgroundColor: '#E3E3E3', alignItems: 'center', justifyContent: 'center' },
  photoButton: { marginTop: 18, backgroundColor: '#9BE36D', borderRadius: 10, paddingHorizontal: 22, paddingVertical: 9 },
  photoText: { color: '#0A0908', fontSize: 18, fontWeight: '900' },
  infoBlock: { paddingHorizontal: 26, marginTop: 22, gap: 10 },
  field: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, flexDirection: 'row', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 3 },
  fieldLabel: { fontSize: 15, fontWeight: '900' },
  fieldValue: { fontSize: 11, fontWeight: '700', maxWidth: 180 },
  assignedBox: { borderRadius: 12, padding: 14, shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 3 },
  assignedTitle: { fontSize: 15, fontWeight: '900', marginBottom: 5 },
  assignedLine: { borderBottomWidth: 1, borderBottomColor: '#111', paddingVertical: 8 },
  assignedText: { fontSize: 12, fontWeight: '800' },
  buttonStack: { alignItems: 'center', gap: 10, marginTop: 12 },
  primaryButton: { minWidth: 230, alignItems: 'center', backgroundColor: BM.deepBlue, borderRadius: 11, paddingVertical: 11 },
  primaryText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  greenButton: { minWidth: 220, alignItems: 'center', backgroundColor: '#9CD879', borderRadius: 11, paddingVertical: 9 },
  greenText: { color: '#0A0908', fontSize: 18, fontWeight: '900' },
  setupCard: { margin: 22, borderRadius: 22, padding: 16, shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 5 }, shadowRadius: 12, elevation: 4 },
  setupTitle: { fontSize: 18, fontWeight: '900' },
  setupSub: { fontSize: 11, fontWeight: '700', lineHeight: 17, marginTop: 3, marginBottom: 10 },
  setupRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, paddingVertical: 10 },
  stepCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: BM.deepBlue, alignItems: 'center', justifyContent: 'center' },
  stepNumber: { color: '#fff', fontSize: 11, fontWeight: '900' },
  stepTitle: { flex: 1, fontSize: 13, fontWeight: '900' },
  modalCard: { borderRadius: 26, padding: 18 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  modalCopy: { fontSize: 12, fontWeight: '700', lineHeight: 18, marginVertical: 12 },
  modalInput: { borderWidth: 1, borderRadius: 14, padding: 13, fontSize: 15, fontWeight: '800', backgroundColor: 'rgba(255,255,255,0.08)' },
  uploadDrop: { height: 140, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', borderColor: BM.green, alignItems: 'center', justifyContent: 'center', gap: 8 },
  uploadText: { color: BM.green, fontWeight: '900' },
  saveButton: { backgroundColor: BM.deepBlue, borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 14 },
  saveText: { color: '#fff', fontWeight: '900' },
  logoutButton: { backgroundColor: '#0A0908', borderRadius: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginHorizontal: 24, marginTop: 2, marginBottom: 8 },
  logoutText: { color: '#FFFFFF', fontWeight: '900' },
});
