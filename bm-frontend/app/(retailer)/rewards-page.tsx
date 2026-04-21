import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Navbar from '../../components/Navbar';
import PointsSummaryCard from '../../components/points/PointsSummaryCard';
import RewardCard from '../../components/rewards/RewardCard';
import {
  getRewardsList,
  getPointsSummary,
  redeemReward,
} from '../../services/rewardApi';

type Reward = {
  reward_id: string;
  name: string;
  description?: string;
  image_url?: string;
  points_needed: number;
  tier_requirement: string;
  quantity_available?: number | null;
};

type Summary = {
  total_points: number;
  tier: string;
};

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total_points: 0,
    tier: 'bronze',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadPage() {
      try {
        const rewardsData = await getRewardsList();
        const summaryData = await getPointsSummary();

        setRewards(rewardsData);
        setSummary(summaryData);
      } catch (error: any) {
        setMessage(error.message || 'Failed to load rewards page');
      }
    }

    loadPage();
  }, []);

  async function handleRedeem(rewardId: string) {
    try {
      const result = await redeemReward(rewardId, 1, 'Berkeley Store');
      setMessage(`Redeem success. Status: ${result.status}`);

      const summaryData = await getPointsSummary();
      setSummary(summaryData);
    } catch (error: any) {
      setMessage(error.message || 'Redeem failed');
    }
  }

  return (
    <View style={styles.page}>
      <Navbar />

      <ScrollView contentContainerStyle={styles.container}>
        <PointsSummaryCard
          totalPoints={summary.total_points}
          tier={summary.tier}
        />

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <View style={styles.grid}>
          {rewards.map((reward) => (
            <RewardCard
              key={reward.reward_id}
              reward={reward}
              onRedeem={handleRedeem}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  grid: {
    gap: 20,
  },
  message: {
    marginBottom: 16,
    color: '#111827',
    fontWeight: '500',
    fontSize: 16,
  },
});