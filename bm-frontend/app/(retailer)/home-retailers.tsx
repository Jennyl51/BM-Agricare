import {
  View,
  Pressable,
  StyleSheet,
  Text,
  ScrollView,
  useWindowDimensions,
  type DimensionValue,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navbar from '@/components/Navbar';
import RetailerHeader from '@/components/RetailerHeader';

function newsLineWidth(i: number): DimensionValue {
  return `${55 + ((i * 13) % 38)}%`;
}

export default function HomeRetailers() {
  const { width } = useWindowDimensions();
  const gap = 10;
  const colW = (width - 40 - gap * 2 - 1) / 2;
  const tile = (colW - 8) / 2;

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
            <Text style={styles.pageLabelText}>Home</Text>
          </View>
        </View>

        <View style={styles.rule} />

        <Text style={styles.sectionHeading}>Technical Guidelines</Text>
        <View style={styles.heroPlaceholder} />

        <View style={styles.splitRow}>
          <View style={{ width: colW }}>
            <Link href="/products-retailer" asChild>
              <Pressable style={styles.productsHeadingBox}>
                <Text style={styles.productsHeadingText}>Products</Text>
              </Pressable>
            </Link>
            <View style={styles.productGrid}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={[styles.productCard, { width: tile }]}>
                  <View
                    style={[styles.productImagePh, { height: tile }]}
                  />
                  <View style={styles.productCaptionLine} />
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.verticalRule, { marginHorizontal: gap }]} />

          <View style={{ width: colW }}>
            <Text style={styles.newsHeading}>News</Text>
            <View style={styles.newsList}>
              {Array.from({ length: 12 }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.newsBar, { width: newsLineWidth(i) }]}
                />
              ))}
            </View>
          </View>
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
    marginBottom: 10,
  },
  heroPlaceholder: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    backgroundColor: '#d4d4d8',
    marginBottom: 18,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  productsHeadingBox: {
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  productsHeadingText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: '#0A0908',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  productCard: {
    alignItems: 'center',
  },
  productImagePh: {
    width: '100%',
    borderRadius: 6,
    backgroundColor: '#d4d4d8',
  },
  productCaptionLine: {
    marginTop: 6,
    height: 4,
    width: '85%',
    borderRadius: 2,
    backgroundColor: '#a1a1aa',
  },
  verticalRule: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#cbd5e1',
  },
  newsHeading: {
    fontFamily: 'Montserrat',
    fontSize: 16,
    fontWeight: '800',
    color: '#002F71',
    marginBottom: 10,
  },
  newsList: {
    gap: 8,
  },
  newsBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94a3b8',
    maxWidth: '100%',
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
