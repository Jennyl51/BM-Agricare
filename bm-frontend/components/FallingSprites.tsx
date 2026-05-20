import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, ImageSourcePropType, StyleSheet, useWindowDimensions, ViewStyle } from 'react-native';

type FallingVariant = 'fruit' | 'crops' | 'all' | 'gold' | 'emerald' | 'diamond' | 'rewardMixed';

type FallingSpritesProps = {
  variant?: FallingVariant;
  count?: number;
  active?: boolean;
  duration?: number;
  loop?: boolean;
  onComplete?: () => void;
  onEmitComplete?: () => void;
  style?: ViewStyle;
};

const CROP_ASSETS: ImageSourcePropType[] = [
  require('@/assets/fall_images/cocoa_fall_1.png'),
  require('@/assets/fall_images/cocoa_fall_2.png'),
  require('@/assets/fall_images/coconut_fall_1.png'),
  require('@/assets/fall_images/coconut_fall_2.png'),
  require('@/assets/fall_images/corn_fall_1.png'),
  require('@/assets/fall_images/corn_fall_2.png'),
  require('@/assets/fall_images/corn_fall_3.png'),
  require('@/assets/fall_images/rice_fall_1.png'),
  require('@/assets/fall_images/rice_fall_2.png'),
  require('@/assets/fall_images/rice_fall_3.png'),
];

const ROCK_ASSETS: ImageSourcePropType[] = [
  require('@/assets/fall_images/gold_fall.png'),
  require('@/assets/fall_images/emerald_fall.png'),
  require('@/assets/fall_images/diamond_fall.png'),
];

const FALL_ASSETS: Record<FallingVariant, ImageSourcePropType[]> = {
  fruit: CROP_ASSETS,
  crops: CROP_ASSETS,
  all: [...CROP_ASSETS, ...ROCK_ASSETS],
  gold: [require('@/assets/fall_images/gold_fall.png')],
  emerald: [require('@/assets/fall_images/emerald_fall.png')],
  diamond: [require('@/assets/fall_images/diamond_fall.png')],
  rewardMixed: ROCK_ASSETS,
};

const seeded = (index: number, salt = 1) => {
  const x = Math.sin(index * 999 + salt * 77) * 10000;
  return x - Math.floor(x);
};

export function getRewardFallVariant(points: number, tier?: string): FallingVariant {
  const normalized = (tier || '').toLowerCase().trim();

  // Prefer the backend tier label when it exists so the visual reward matches the user's actual rank.
  if (normalized.includes('diamond') || normalized.includes('premium')) return 'diamond';
  if (normalized.includes('emerald') || normalized.includes('green') || normalized.includes('mid')) return 'emerald';
  if (normalized.includes('gold') || normalized.includes('starter') || normalized.includes('bronze') || normalized.includes('silver')) return 'gold';

  // Fallback only when the API does not send a tier string.
  if (points >= 9000) return 'diamond';
  if (points >= 5000) return 'emerald';
  return 'gold';
}

export default function FallingSprites({
  variant = 'fruit',
  count = 18,
  active = true,
  duration = 5200,
  loop = true,
  onComplete,
  onEmitComplete,
  style,
}: FallingSpritesProps) {
  const { width, height } = useWindowDimensions();
  const assets = FALL_ASSETS[variant] || FALL_ASSETS.fruit;
  const values = useRef<Animated.Value[]>([]).current;
  const wasActive = useRef(false);
  const [spawnSalt, setSpawnSalt] = useState(() => Math.random() * 10000);

  if (values.length !== count) {
    values.splice(0, values.length, ...Array.from({ length: count }, () => new Animated.Value(0)));
  }

  const particles = useMemo(() => Array.from({ length: count }, (_, index) => {
    const salt = spawnSalt + variant.length * 31;
    const size = 22 + Math.round(seeded(index, salt + 2) * 18);
    const slot = count <= 1 ? duration : duration / count;
    const emissionProgress = count <= 1 ? 0 : index / count;
    const evenJitter = Math.round((seeded(index, salt + 4) - 0.5) * Math.min(slot * 0.55, 70));
    const delay = Math.max(0, Math.round(emissionProgress * duration + evenJitter));

    return {
      source: assets[Math.floor(seeded(index, salt + 1) * assets.length) % assets.length],
      leftRatio: seeded(index, salt + 3),
      size,
      delay,
      duration: Math.max(1400, duration + Math.round(seeded(index, salt + 5) * (loop ? 1200 : 700))),
      sway: -34 + seeded(index, salt + 6) * 68,
      rotation: 120 + Math.round(seeded(index, salt + 7) * 260),
      opacity: 0.64 + seeded(index, salt + 8) * 0.32,
    };
  }), [assets, count, duration, loop, spawnSalt, variant.length]);

  useEffect(() => {
    if (active && !wasActive.current) {
      setSpawnSalt(Math.random() * 10000);
    }
    wasActive.current = active;
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const animations = values.map((value, index) => {
      value.setValue(0);
      const particle = particles[index];
      const sequence = Animated.sequence([
        Animated.delay(particle.delay),
        Animated.timing(value, {
          toValue: 1,
          duration: particle.duration,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]);
      const animation = loop ? Animated.loop(sequence) : sequence;
      animation.start();
      return animation;
    });

    if (!loop) {
      const lastEmit = Math.max(...particles.map((particle) => particle.delay)) + 60;
      const visualDone = Math.max(...particles.map((particle) => particle.delay + particle.duration)) + 60;
      if (onEmitComplete) timers.push(setTimeout(onEmitComplete, lastEmit));
      if (onComplete) timers.push(setTimeout(onComplete, visualDone));
    }

    return () => {
      animations.forEach((animation) => animation.stop());
      timers.forEach(clearTimeout);
    };
  }, [active, loop, onComplete, onEmitComplete, particles, values]);

  if (!active) return null;

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.layer, style]}>
      {particles.map((particle, index) => {
        const value = values[index];
        const translateY = value.interpolate({ inputRange: [0, 1], outputRange: [-90, height + 120] });
        const translateX = value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, particle.sway, 0] });
        const rotate = value.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${particle.rotation}deg`] });
        return (
          <Animated.View
            key={`${variant}-${index}`}
            style={[
              styles.spriteWrap,
              {
                left: Math.max(8, particle.leftRatio * Math.max(1, width - 48)),
                opacity: particle.opacity,
                transform: [{ translateY }, { translateX }, { rotate }],
              },
            ]}
          >
            <Image source={particle.source} style={{ width: particle.size, height: particle.size }} resizeMode="contain" />
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layer: { zIndex: 20, elevation: 20 },
  spriteWrap: { position: 'absolute', top: 0 },
});
