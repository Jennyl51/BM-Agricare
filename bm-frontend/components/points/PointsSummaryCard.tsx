import { View, Text, StyleSheet } from 'react-native';

type Props = {
  totalPoints: number;
  tier: string;
};

export default function PointsSummaryCard({ totalPoints, tier }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Your Rewards Summary</Text>

      <Text style={styles.text}>
        <Text style={styles.bold}>Total Points: </Text>
        {totalPoints}
      </Text>

      <Text style={styles.text}>
        <Text style={styles.bold}>Tier: </Text>
        {tier}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f3f4f6',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    marginBottom: 6,
  },
  bold: {
    fontWeight: '600',
  },
});