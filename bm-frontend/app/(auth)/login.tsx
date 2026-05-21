import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Alert, Image, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BM } from '@/constants/theme';
import { BackgroundBlobs, BounceButton, FadeIn } from '@/components/AgricareUI';
import { useApp } from '@/components/AppContext';
import { signup } from '@/services/authApi';

type Role = 'retailer' | 'tce' | null;

type CountryOption = {
  label: string;
  dialCode: string;
  flag: string;
  example: string;
  minDigits: number;
};

const COUNTRY_OPTIONS: CountryOption[] = [
  { label: 'Vietnam', dialCode: '+84', flag: '🇻🇳', example: '38 405 7680', minDigits: 8 },
  { label: 'United States', dialCode: '+1', flag: '🇺🇸', example: '415 555 0123', minDigits: 10 },
  { label: 'Philippines', dialCode: '+63', flag: '🇵🇭', example: '917 555 0123', minDigits: 10 },
  { label: 'Malaysia', dialCode: '+60', flag: '🇲🇾', example: '12 345 6789', minDigits: 8 },
  { label: 'Singapore', dialCode: '+65', flag: '🇸🇬', example: '8123 4567', minDigits: 8 },
  { label: 'Indonesia', dialCode: '+62', flag: '🇮🇩', example: '812 3456 7890', minDigits: 9 },
  { label: 'Thailand', dialCode: '+66', flag: '🇹🇭', example: '81 234 5678', minDigits: 8 },
];

type SignupState = {
  role: Role;
  phoneCountryCode: string;
  phone: string;
  code: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  storeName: string;
  storeLocation: string;
  region: string;
  terms: boolean;
  updates: boolean;
  photoReady: boolean;
};

const initialSignup: SignupState = {
  role: null,
  phoneCountryCode: '+84',
  phone: '',
  code: '',
  firstName: '',
  lastName: '',
  username: '',
  password: '',
  storeName: '',
  storeLocation: '',
  region: '',
  terms: false,
  updates: false,
  photoReady: false,
};

const DEMO_VERIFICATION_CODE = '123456';

export default function LoginScreen() {
  const backgroundImage = require('@/assets/images/LoginBackgroundOne.png');
  const brandImage = require('@/assets/images/brand_name.png');
  const roleRetailer = require('@/assets/fields/field_woman.jpg');
  const roleTce = require('@/assets/fields/tractor_crops.jpg');
  const { theme, toggleDarkMode, darkMode } = useApp();
  const pulse = useRef(new Animated.Value(0)).current;
  const codeInputRef = useRef<TextInput>(null);
  const [signupOpen, setSignupOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<SignupState>(initialSignup);
  const [submitting, setSubmitting] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 2500, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 2500, useNativeDriver: true }),
    ])).start();
  }, [pulse]);

  useEffect(() => {
    if (signupOpen && step === 2) {
      const timer = setTimeout(() => codeInputRef.current?.focus(), 250);
      return () => clearTimeout(timer);
    }
  }, [signupOpen, step]);

  const logoScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] });
  const fullName = useMemo(() => `${form.firstName} ${form.lastName}`.trim(), [form.firstName, form.lastName]);
  const selectedCountry = useMemo(
    () => COUNTRY_OPTIONS.find((country) => country.dialCode === form.phoneCountryCode) || COUNTRY_OPTIONS[0],
    [form.phoneCountryCode]
  );
  const fullPhoneNumber = useMemo(() => `${selectedCountry.dialCode} ${form.phone}`.trim(), [selectedCountry.dialCode, form.phone]);

  const patch = (updates: Partial<SignupState>) => setForm((prev) => ({ ...prev, ...updates }));

  const closeSignup = () => {
    setSignupOpen(false);
    setStep(0);
    setForm(initialSignup);
    setCountryDropdownOpen(false);
  };

  const validateStep = () => {
    if (step === 0 && !form.role) return 'Please pick Retailer or TCE first.';
    if (step === 1 && form.phone.replace(/\D/g, '').length < selectedCountry.minDigits) return `Please enter a valid ${selectedCountry.label} phone number.`;
    if (step === 2 && form.code !== DEMO_VERIFICATION_CODE) return `Invalid verification code. For demo, use ${DEMO_VERIFICATION_CODE}.`;
    if (step === 3 && (!form.firstName.trim() || !form.lastName.trim())) return 'Please enter your first and last name.';
    if (step === 4) {
      if (!form.username.trim() || !form.password.trim()) return 'Please enter a username and password.';
      if (form.role === 'retailer' && (!form.storeName.trim() || !form.storeLocation.trim())) return 'Retailers need store name and store location.';
      if (form.role === 'tce' && !form.region.trim()) return 'TCE users need their assigned region/location.';
      if (!form.terms) return 'Please agree to the Terms & Privacy Policy.';
    }
    if (step === 5 && !form.photoReady) return 'Please add or confirm a profile photo placeholder.';
    return '';
  };

  const next = () => {
    const error = validateStep();
    if (error) {
      Alert.alert('Missing information', error);
      return;
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const goBack = () => {
    if (step === 0) closeSignup();
    else setStep((prev) => prev - 1);
  };

  const completeSignup = async () => {
    const error = validateStep();
    if (error) {
      Alert.alert('Missing information', error);
      return;
    }
    setSubmitting(true);
    try {
      const username = form.username.trim() || `${fullPhoneNumber.replace(/\D/g, '')}@bm.local`;
      await signup({
        username,
        password: form.password,
        name: fullName,
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: username.includes('@') ? username : `${username}@bm-agricare.local`,
        phone_number: fullPhoneNumber,
        user_type: form.role,
        store_name: form.storeName,
        store_location: form.storeLocation,
        region: form.role === 'tce' ? form.region : form.storeLocation,
        accepts_terms: form.terms,
        receives_updates: form.updates,
        profile_photo_status: form.photoReady ? 'placeholder_confirmed' : 'missing',
        verified: true,
      });
      router.replace(form.role === 'tce' ? '/tce-dashboard' : '/home-retailers');
    } catch (err: any) {
      Alert.alert('Signup issue', err?.message || 'The signup could not be completed.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSignupStep = () => {
    if (step === 0) {
      return (
        <>
          <Text style={styles.onboardingTitle}>What role are you?</Text>
          <View style={styles.roleStack}>
            <Pressable style={[styles.roleCard, form.role === 'retailer' && styles.roleCardActive]} onPress={() => patch({ role: 'retailer' })}>
              <ImageBackground source={roleRetailer} style={styles.roleImage} imageStyle={styles.roleImageRadius}>
                <View style={styles.roleOverlay} /><Text style={styles.roleText}>RETAILER</Text>
              </ImageBackground>
            </Pressable>
            <Pressable style={[styles.roleCard, form.role === 'tce' && styles.roleCardActive]} onPress={() => patch({ role: 'tce' })}>
              <ImageBackground source={roleTce} style={styles.roleImage} imageStyle={styles.roleImageRadius}>
                <View style={styles.roleOverlay} /><Text style={styles.roleText}>Technical Commercial Expert{`\n`}(TCE)</Text>
              </ImageBackground>
            </Pressable>
          </View>
          <BounceButton style={styles.blueButton} onPress={next}><Text style={styles.blueButtonText}>Continue</Text></BounceButton>
        </>
      );
    }

    if (step === 1) {
      return (
        <>
          <Text style={styles.onboardingTitle}>What is your phone number?</Text>
          <Text style={styles.onboardingSub}>A 6-digits verification code will be sent to your phone soon, please fill in the code within 15 minutes.</Text>
          <View style={styles.phoneInputRow}>
            <Pressable style={styles.countryDropdownButton} onPress={() => setCountryDropdownOpen(true)}>
              <Text style={styles.countryCode}>{selectedCountry.flag} {selectedCountry.dialCode}</Text>
              <Feather name="chevron-down" size={17} color="#7A7A7A" />
            </Pressable>
            <View style={styles.phoneDivider} />
            <TextInput
              style={styles.phoneInput}
              value={form.phone}
              onChangeText={(v) => patch({ phone: v.replace(/[^\d\s-]/g, '') })}
              keyboardType="phone-pad"
              placeholder={selectedCountry.example}
              placeholderTextColor="#A0A0A0"
            />
          </View>
          <Modal visible={countryDropdownOpen} transparent animationType="fade" onRequestClose={() => setCountryDropdownOpen(false)}>
            <Pressable style={styles.dropdownBackdrop} onPress={() => setCountryDropdownOpen(false)}>
              <View style={styles.countryMenu}>
                <Text style={styles.countryMenuTitle}>Select country code</Text>
                {COUNTRY_OPTIONS.map((country) => (
                  <Pressable
                    key={country.dialCode}
                    style={[styles.countryOption, country.dialCode === form.phoneCountryCode && styles.countryOptionActive]}
                    onPress={() => {
                      patch({ phoneCountryCode: country.dialCode, phone: '' });
                      setCountryDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.countryOptionText}>{country.flag} {country.label}</Text>
                    <Text style={styles.countryOptionCode}>{country.dialCode}</Text>
                  </Pressable>
                ))}
              </View>
            </Pressable>
          </Modal>
          <BounceButton style={styles.blueButton} onPress={next}><Text style={styles.blueButtonText}>Send code</Text></BounceButton>
        </>
      );
    }

    if (step === 2) {
      const digits = form.code.padEnd(6, ' ').slice(0, 6).split('');
      return (
        <>
          <Text style={styles.onboardingTitle}>Please enter the verification code</Text>
          <Text style={styles.onboardingSub}>Code has been sent to {fullPhoneNumber || `${selectedCountry.dialCode} ${selectedCountry.example}`}</Text>
          <Text style={styles.demoCodeText}>Demo code: {DEMO_VERIFICATION_CODE}</Text>
          <Pressable style={styles.codeInputArea} onPress={() => codeInputRef.current?.focus()}>
            <View style={styles.codeBoxes}>
              {digits.map((d, i) => (
                <View key={i} style={[styles.codeBox, i === form.code.length && form.code.length < 6 && styles.codeBoxActive]}>
                  <Text style={styles.codeText}>{d.trim()}</Text>
                </View>
              ))}
            </View>
            <TextInput
              ref={codeInputRef}
              value={form.code}
              onChangeText={(v) => patch({ code: v.replace(/\D/g, '').slice(0, 6) })}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              caretHidden
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              style={styles.codeCaptureInput}
            />
          </Pressable>
          <Pressable><Text style={styles.resendText}>Resend verification code (56)</Text></Pressable>
          <BounceButton style={styles.blueButton} onPress={next}><Text style={styles.blueButtonText}>Submit code</Text></BounceButton>
          <Image source={brandImage} style={styles.stepLogo} resizeMode="contain" />
        </>
      );
    }

    if (step === 3) {
      return (
        <>
          <Text style={styles.onboardingTitle}>What is your name?</Text>
          <TextInput style={styles.largeInput} value={form.firstName} onChangeText={(v) => patch({ firstName: v })} placeholder="First name" placeholderTextColor="#8A8A8A" />
          <TextInput style={styles.largeInput} value={form.lastName} onChangeText={(v) => patch({ lastName: v })} placeholder="Last name" placeholderTextColor="#8A8A8A" />
          <BounceButton style={styles.blueButton} onPress={next}><Text style={styles.blueButtonText}>Enter name</Text></BounceButton>
          <Image source={brandImage} style={styles.nameLogo} resizeMode="contain" />
        </>
      );
    }

    if (step === 4) {
      const isRetailer = form.role === 'retailer';
      return (
        <>
          <Text style={styles.onboardingTitle}>Hi, {form.firstName || 'there'}</Text>
          <Text style={styles.onboardingSub}>Set up your {isRetailer ? 'retailer' : 'TCE'} account below</Text>
          <Text style={styles.fieldLabel}>Username</Text>
          <TextInput style={styles.formInput} value={form.username} onChangeText={(v) => patch({ username: v })} placeholder="name@example.com" placeholderTextColor="#8A8A8A" autoCapitalize="none" />
          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput style={styles.formInput} value={form.password} onChangeText={(v) => patch({ password: v })} placeholder="Create password" placeholderTextColor="#8A8A8A" secureTextEntry />
          {isRetailer ? (
            <>
              <Text style={styles.fieldLabel}>Store Name</Text>
              <TextInput style={styles.formInput} value={form.storeName} onChangeText={(v) => patch({ storeName: v })} placeholder="Placeholder text" placeholderTextColor="#8A8A8A" />
              <Text style={styles.fieldLabel}>Store Location</Text>
              <TextInput style={styles.formInput} value={form.storeLocation} onChangeText={(v) => patch({ storeLocation: v })} placeholder="1234 Street, Highland, Vietnam" placeholderTextColor="#8A8A8A" />
            </>
          ) : (
            <>
              <Text style={styles.fieldLabel}>Region / Location</Text>
              <TextInput style={styles.formInput} value={form.region} onChangeText={(v) => patch({ region: v })} placeholder="Assigned region" placeholderTextColor="#8A8A8A" />
              <Text style={styles.fieldLabel}>Employee ID / TCE Code</Text>
              <TextInput style={styles.formInput} value={form.storeName} onChangeText={(v) => patch({ storeName: v })} placeholder="TCE verification code" placeholderTextColor="#8A8A8A" />
            </>
          )}
          <Pressable style={styles.checkRow} onPress={() => patch({ terms: !form.terms })}><View style={[styles.checkbox, form.terms && styles.checkboxActive]} /> <Text style={styles.checkText}>I agree to the <Text style={styles.underline}>Terms & Privacy Policy</Text></Text></Pressable>
          <Pressable style={styles.checkRow} onPress={() => patch({ updates: !form.updates })}><View style={[styles.checkbox, form.updates && styles.checkboxActive]} /> <Text style={styles.checkText}>Receive updates about rewards and approvals</Text></Pressable>
          <BounceButton style={styles.blueButton} onPress={next}><Text style={styles.blueButtonText}>Submit info</Text></BounceButton>
        </>
      );
    }

    return (
      <>
        <Text style={styles.onboardingTitle}>Add your profile photo</Text>
        <Text style={styles.onboardingSub}>Every verified BM user needs a profile image for invoice review and support handoffs.</Text>
        <Pressable style={[styles.photoCircle, form.photoReady && styles.photoCircleActive]} onPress={() => patch({ photoReady: true })}>
          <Feather name={form.photoReady ? 'check' : 'camera'} size={42} color={form.photoReady ? '#FFFFFF' : BM.deepBlue} />
        </Pressable>
        <BounceButton style={styles.greenPhotoButton} onPress={() => patch({ photoReady: true })}><Text style={styles.greenPhotoText}>{form.photoReady ? 'Photo Confirmed' : 'Upload Photo'}</Text></BounceButton>
        <BounceButton style={styles.blueButton} onPress={completeSignup} disabled={submitting}><Text style={styles.blueButtonText}>{submitting ? 'Creating account...' : 'Enter App'}</Text></BounceButton>
      </>
    );
  };

  if (signupOpen) {
    return (
      <ImageBackground source={backgroundImage} style={[styles.background, { backgroundColor: theme.bg }]} resizeMode="cover">
        <BackgroundBlobs />
        <View style={styles.mobileFrame}>
          <Pressable style={styles.backButton} onPress={goBack}><Feather name="arrow-left" size={30} color="#0A0908" /></Pressable>
          <ScrollView contentContainerStyle={styles.onboardingContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {renderSignupStep()}
          </ScrollView>
          <View style={styles.stepDots}>{[0,1,2,3,4,5].map((x) => <View key={x} style={[styles.dot, x === step && styles.dotActive]} />)}</View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={backgroundImage} style={[styles.background, { backgroundColor: theme.bg }]} resizeMode="cover">
      <BackgroundBlobs />
      <View style={[styles.scrim, darkMode && { backgroundColor: 'rgba(0,0,0,0.32)' }]} />
      <Pressable style={styles.darkToggle} onPress={toggleDarkMode}><Feather name={darkMode ? 'sun' : 'moon'} size={18} color={BM.deepBlue} /></Pressable>
      <View style={styles.container}>
        <FadeIn delay={80} y={28} style={styles.brandWrap}>
          <Animated.Image source={brandImage} style={[styles.logo, { transform: [{ scale: logoScale }] }]} resizeMode="contain" />
          <Text style={[styles.caption, { color: darkMode ? '#E9FBE3' : '#385F32' }]}>Invoice rewards for every verified purchase.</Text>
        </FadeIn>

        <FadeIn delay={240} y={24} style={[styles.portalCard, { backgroundColor: darkMode ? 'rgba(16,38,23,0.78)' : 'rgba(255,255,255,0.62)' }]}> 
          <Text style={[styles.portalTitle, { color: theme.text }]}>Welcome back</Text>
          <Text style={[styles.portalSub, { color: theme.muted }]}>Choose your portal to continue.</Text>
          <BounceButton style={styles.primaryButton} onPress={() => router.push('/RetailerLoginPage')}>
            <Feather name="shopping-bag" size={19} color="#FFFFFF" />
            <Text style={styles.buttonText}>Log in as RETAILER</Text>
          </BounceButton>
          <BounceButton style={styles.primaryButton} onPress={() => router.push('/TCELoginPage')}>
            <Feather name="briefcase" size={19} color="#FFFFFF" />
            <Text style={styles.buttonText}>Log in as TCE</Text>
          </BounceButton>
          <BounceButton style={styles.signupButton} onPress={() => setSignupOpen(true)}>
            <Feather name="user-plus" size={18} color={BM.deepBlue} />
            <Text style={styles.signupButtonText}>Create verified BM account</Text>
          </BounceButton>
        </FadeIn>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.18)' },
  darkToggle: { position: 'absolute', right: 22, top: 22, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.78)', alignItems: 'center', justifyContent: 'center', zIndex: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, borderWidth: 1.5, borderColor: '#0A0908' },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  brandWrap: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 258, height: 98, alignSelf: 'center' },
  caption: { marginTop: -8, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  portalCard: { gap: 13, borderRadius: 30, padding: 18, borderWidth: 1.5, borderColor: '#0A0908', shadowColor: '#000', shadowOpacity: 0.14, shadowOffset: { width: 0, height: 10 }, shadowRadius: 22, elevation: 6 },
  portalTitle: { textAlign: 'center', fontSize: 25, fontWeight: '900' },
  portalSub: { textAlign: 'center', fontSize: 12, fontWeight: '700', marginTop: -8, marginBottom: 4 },
  primaryButton: { width: '100%', minHeight: 58, borderRadius: 17, backgroundColor: BM.deepBlue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  buttonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12.5, letterSpacing: 0.2 },
  signupButton: { width: '100%', minHeight: 52, borderRadius: 17, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  signupButtonText: { color: BM.deepBlue, fontWeight: '900', fontSize: 12.5 },
  mobileFrame: { flex: 1, paddingTop: 54, paddingHorizontal: 38 },
  backButton: { position: 'absolute', left: 34, top: 62, zIndex: 5 },
  onboardingContent: { paddingTop: 90, paddingBottom: 86, minHeight: 720 },
  onboardingTitle: { fontSize: 28, lineHeight: 32, fontWeight: '900', color: '#0A0908', marginBottom: 8 },
  onboardingSub: { fontSize: 12, lineHeight: 15, fontWeight: '700', color: '#0A0908', marginBottom: 28, maxWidth: 298 },
  roleStack: { marginTop: 90, gap: 24, alignItems: 'center' },
  roleCard: { width: 260, height: 88, borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.22, shadowOffset: { width: 0, height: 6 }, shadowRadius: 9, elevation: 6, borderWidth: 1.5, borderColor: 'transparent' },
  roleCardActive: { borderColor: '#0A0908', transform: [{ scale: 1.02 }] },
  roleImage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  roleImageRadius: { borderRadius: 12 },
  roleOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,26,50,0.38)' },
  roleText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', textAlign: 'center', letterSpacing: 0.4 },
  blueButton: { minHeight: 54, borderRadius: 13, backgroundColor: BM.deepBlue, alignItems: 'center', justifyContent: 'center', marginTop: 28, alignSelf: 'center', width: 232 },
  blueButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  phoneInputRow: { height: 56, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#0A0908', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginTop: 24, shadowColor: '#000', shadowOpacity: 0.18, shadowOffset: { width: 0, height: 4 }, shadowRadius: 7, elevation: 5 },
  countryDropdownButton: { flexDirection: 'row', alignItems: 'center', gap: 3, minWidth: 82, height: '100%' },
  countryCode: { fontWeight: '900', color: '#7A7A7A', fontSize: 14 },
  phoneDivider: { width: 1.5, height: 28, backgroundColor: '#CFCFCF', marginHorizontal: 10 },
  phoneInput: { flex: 1, fontSize: 18, fontWeight: '800', color: '#0A0908' },
  dropdownBackdrop: { flex: 1, backgroundColor: 'rgba(10,9,8,0.35)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  countryMenu: { width: '100%', maxWidth: 330, maxHeight: 360, borderRadius: 22, backgroundColor: '#FFFFFF', padding: 14, borderWidth: 1.5, borderColor: '#0A0908', shadowColor: '#000', shadowOpacity: 0.22, shadowOffset: { width: 0, height: 8 }, shadowRadius: 14, elevation: 8 },
  countryMenuTitle: { fontSize: 16, fontWeight: '900', color: '#0A0908', marginBottom: 8, paddingHorizontal: 6 },
  countryOption: { minHeight: 48, borderRadius: 14, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  countryOptionActive: { backgroundColor: '#E6F7DC', borderWidth: 1.5, borderColor: BM.green },
  countryOptionText: { fontSize: 14, fontWeight: '800', color: '#0A0908' },
  countryOptionCode: { fontSize: 14, fontWeight: '900', color: BM.deepBlue },
  demoCodeText: { marginTop: 12, alignSelf: 'center', backgroundColor: '#FFF7D8', borderWidth: 1.5, borderColor: '#0A0908', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, color: '#0A0908', fontSize: 13, fontWeight: '900' },
  codeInputArea: { position: 'relative', width: '100%', minHeight: 82, marginTop: 28, marginBottom: 12 },
  codeBoxes: { flexDirection: 'row', justifyContent: 'space-between' },
  codeBox: { width: 42, height: 56, borderRadius: 10, borderWidth: 1.5, borderColor: '#A7A7A7', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.13, shadowOffset: { width: 0, height: 3 }, shadowRadius: 5, elevation: 4 },
  codeBoxActive: { borderColor: BM.deepBlue, borderWidth: 2, backgroundColor: '#F7FBFF' },
  codeText: { fontSize: 22, fontWeight: '900', color: '#0A0908' },
  codeCaptureInput: { position: 'absolute', top: 0, left: 0, right: 0, height: 70, opacity: 0.04, color: 'transparent', backgroundColor: 'transparent', zIndex: 5 },
  resendText: { fontSize: 11, color: '#0A0908', textDecorationLine: 'underline', textAlign: 'center', fontWeight: '700' },
  stepLogo: { width: 220, height: 82, alignSelf: 'center', marginTop: 40 },
  largeInput: { height: 52, borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E5E5E5', marginTop: 28, paddingHorizontal: 18, fontSize: 17, fontWeight: '800', shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 4 }, shadowRadius: 7, elevation: 5 },
  nameLogo: { width: 220, height: 82, alignSelf: 'center', marginTop: 54 },
  fieldLabel: { fontSize: 12, fontWeight: '900', color: '#0A0908', marginTop: 14, marginBottom: 7 },
  formInput: { height: 54, borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E5E5E5', paddingHorizontal: 16, fontSize: 14, fontWeight: '800', color: '#0A0908', shadowColor: '#000', shadowOpacity: 0.13, shadowOffset: { width: 0, height: 4 }, shadowRadius: 7, elevation: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 },
  checkbox: { width: 11, height: 11, borderWidth: 1.2, borderColor: '#0A0908' },
  checkboxActive: { backgroundColor: BM.green },
  checkText: { fontSize: 10.5, fontWeight: '700', color: '#0A0908' },
  underline: { textDecorationLine: 'underline', fontWeight: '900' },
  photoCircle: { width: 170, height: 170, borderRadius: 85, backgroundColor: '#D9D9D9', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 60, borderWidth: 1.5, borderColor: '#0A0908' },
  photoCircleActive: { backgroundColor: BM.green },
  greenPhotoButton: { backgroundColor: '#9BD37C', borderRadius: 10, alignSelf: 'center', paddingHorizontal: 18, paddingVertical: 10, marginTop: 18 },
  greenPhotoText: { color: '#0A0908', fontSize: 18, fontWeight: '900' },
  stepDots: { position: 'absolute', bottom: 26, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(10,9,8,0.18)' },
  dotActive: { width: 18, backgroundColor: BM.deepBlue },
});
