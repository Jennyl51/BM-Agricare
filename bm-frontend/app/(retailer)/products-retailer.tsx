import {
  View,
  Pressable,
  StyleSheet,
  Text,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navbar from '@/components/Navbar';
import RetailerHeader from '@/components/RetailerHeader';

export default function ProductsRetailer() {
  const { width } = useWindowDimensions();
  const gap = 12;
  const tile = (width - 40 - gap) / 2;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <RetailerHeader />

        <View style={styles.pageLabelWrap}>
          <View style={styles.pageLabelBox}>
            <Text style={styles.pageLabelText}>Products</Text>
          </View>
        </View>

        <View style={styles.rule} />

        <Text style={styles.sectionHeading}>Categories</Text>
        <View style={styles.categoryRow}>
          {(['grid', 'package', 'droplet', 'sun', 'wind'] as const).map(
            (icon) => (
              <Pressable key={icon} style={styles.categoryCircle}>
                <Feather name={icon} size={22} color="#002F71" />
              </Pressable>
            ),
          )}
        </View>

        <View style={[styles.rule, { marginTop: 10, marginBottom: 18 }]} />

        <View style={styles.productGrid}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={i} style={[styles.productCard, { width: tile }]}>
              <View style={[styles.productImagePh, { height: tile }]} />
              <View style={styles.productCaptionLine} />
            </View>
          ))}
        </View>
      </ScrollView>

      <Pressable style={styles.fab}>
        <Text style={styles.fabLetter}>J</Text>
      </Pressable>

      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  pageLabelWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  pageLabelBox: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 28,
    borderRadius: 6,
    minWidth: '70%',
    alignItems: 'center',
  },
  pageLabelText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: '#0A0908',
  },
  rule: {
    height: 1,
    backgroundColor: '#cbd5e1',
    marginBottom: 16,
  },
  sectionHeading: {
    fontFamily: 'Montserrat',
    fontSize: 18,
    fontWeight: '800',
    color: '#002F71',
    marginBottom: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d4d4d8',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  productCard: {
    alignItems: 'center',
  },
  productImagePh: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#d4d4d8',
  },
  productCaptionLine: {
    marginTop: 8,
    height: 4,
    width: '80%',
    borderRadius: 2,
    backgroundColor: '#a1a1aa',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 88,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ec4899',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fabLetter: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat',
    fontSize: 20,
    fontWeight: '800',
  },
});
