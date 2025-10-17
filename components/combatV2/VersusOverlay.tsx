import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface VersusOverlayProps {
  playerName: string;
  enemyName: string;
  visible: boolean;
  speed: number;
  onComplete: () => void;
  onSkip: () => void;
}

export function VersusOverlay({ 
  playerName, 
  enemyName, 
  visible, 
  speed, 
  onComplete, 
  onSkip 
}: VersusOverlayProps) {
  const t = (ms: number) => ms / Math.max(0.25, speed);
  
  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.86);
  const translateY = useSharedValue(18);
  const rotate = useSharedValue(2);
  const playerNameX = useSharedValue(-screenWidth * 0.3);
  const enemyNameX = useSharedValue(screenWidth * 0.3);
  const vsOpacity = useSharedValue(0);

  // Background dimming
  const bgOpacity = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      // Reset values
      opacity.value = 0;
      scale.value = 0.86;
      translateY.value = 18;
      rotate.value = 2;
      playerNameX.value = -screenWidth * 0.3;
      enemyNameX.value = screenWidth * 0.3;
      vsOpacity.value = 0;
      bgOpacity.value = 1;

      // Entrance animation (~450ms)
      opacity.value = withTiming(1, { duration: t(450), easing: Easing.out(Easing.cubic) });
      scale.value = withTiming(1.0, { duration: t(450), easing: Easing.out(Easing.back(1.1)) });
      translateY.value = withTiming(0, { duration: t(450), easing: Easing.out(Easing.cubic) });
      rotate.value = withTiming(0, { duration: t(450), easing: Easing.out(Easing.cubic) });

      // Name slide-in with overshoot
      playerNameX.value = withSequence(
        withTiming(0, { duration: t(300), easing: Easing.out(Easing.cubic) }),
        withTiming(-8, { duration: t(100), easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: t(100), easing: Easing.out(Easing.cubic) })
      );
      
      enemyNameX.value = withSequence(
        withTiming(0, { duration: t(300), easing: Easing.out(Easing.cubic) }),
        withTiming(8, { duration: t(100), easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: t(100), easing: Easing.out(Easing.cubic) })
      );

      // VS sweep effect
      vsOpacity.value = withTiming(1, { duration: t(200), easing: Easing.out(Easing.cubic) });

      // Background dimming
      bgOpacity.value = withTiming(0.85, { duration: t(120), easing: Easing.out(Easing.cubic) });

      // Hold phase (~900ms)
      setTimeout(() => {
        // Exit animation (~350ms)
        scale.value = withTiming(0.96, { duration: t(350), easing: Easing.in(Easing.cubic) });
        opacity.value = withTiming(0, { duration: t(350), easing: Easing.in(Easing.cubic) });
        translateY.value = withTiming(-12, { duration: t(350), easing: Easing.in(Easing.cubic) });
        
        // Background undimming
        bgOpacity.value = withTiming(1, { duration: t(120), easing: Easing.out(Easing.cubic) });

        // Complete after exit
        setTimeout(() => {
          onComplete();
        }, t(350));
      }, t(900));

      // Haptics
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [visible, speed]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const playerNameStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playerNameX.value }],
  }));

  const enemyNameStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: enemyNameX.value }],
  }));

  const vsStyle = useAnimatedStyle(() => ({
    opacity: vsOpacity.value,
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  if (!visible) return null;

  return (
    <>
      {/* Background dimming */}
      <Animated.View 
        style={[StyleSheet.absoluteFillObject, backgroundStyle]}
        pointerEvents="none"
      >
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.15)' }]} />
      </Animated.View>

      {/* Versus overlay */}
      <TouchableOpacity 
        style={styles.overlayContainer}
        activeOpacity={1}
        onPress={onSkip}
      >
        <Animated.View style={[styles.versusCard, overlayStyle]}>
          {/* Parchment background */}
          <Image
            source={require('@/assets/images/parchment_texture_orange.png')}
            style={styles.parchmentBackground}
            resizeMode="cover"
          />
          
          {/* Content */}
          <View style={styles.content}>
            {/* Player name */}
            <Animated.View style={[styles.nameContainer, playerNameStyle]}>
              <Text style={styles.playerName}>{playerName}</Text>
            </Animated.View>

            {/* VS */}
            <Animated.View style={[styles.vsContainer, vsStyle]}>
              <Text style={styles.vsText}>VS</Text>
            </Animated.View>

            {/* Enemy name */}
            <Animated.View style={[styles.nameContainer, enemyNameStyle]}>
              <Text style={styles.enemyName}>{enemyName}</Text>
            </Animated.View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </>
  );
}

const CARD_WIDTH = Math.min(screenWidth * 0.85, 400);
const CARD_HEIGHT = 120;

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  versusCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  parchmentBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  nameContainer: {
    flex: 1,
    alignItems: 'center',
  },
  playerName: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 18,
    color: '#3a2a18',
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  enemyName: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 18,
    color: '#3a2a18',
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  vsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  vsText: {
    fontFamily: 'Cinzel-Black',
    fontSize: 24,
    color: '#8B0000',
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
