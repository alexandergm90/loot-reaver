import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import VsBadge from './VsBadge';

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
  const t = (ms: number) => ms / Math.max(0.25, speed); // Reset to normal timing
  
  // Animation values
  const dimmerOpacity = useSharedValue(0);
  const playerNameX = useSharedValue(-screenWidth);
  const enemyNameX = useSharedValue(screenWidth);
  const vsOpacity = useSharedValue(0);
  const vsScale = useSharedValue(0);
  
  // Exit animation values
  const exitOpacity = useSharedValue(1);
  const exitTranslateY = useSharedValue(0);

  // Layout calculations
  const spacing = Math.max(8, Math.min(16, screenWidth * 0.02));
  const badgeSize = Math.min(96, screenWidth * 0.22);
  const maxNameWidth = screenWidth * 0.28; // Reduced from 0.36 to ensure names fit
  
  // State for animation phases
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'entering' | 'holding' | 'exiting'>('idle');

  useEffect(() => {
    if (visible) {
      setAnimationPhase('entering');
      
      // Reset all values
      dimmerOpacity.value = 0;
      playerNameX.value = -screenWidth;
      enemyNameX.value = screenWidth;
      vsOpacity.value = 0;
      vsScale.value = 0;
      exitOpacity.value = 1;
      exitTranslateY.value = 0;

      // Step 1: Player name scrolls in from left to right (0.3 seconds)
      playerNameX.value = withTiming(0, { duration: t(300), easing: Easing.out(Easing.cubic) });

      // Step 2: After 0.5 seconds delay, VS image pops in (0.2 seconds zoom)
      setTimeout(() => {
        vsOpacity.value = withTiming(1, { duration: t(200), easing: Easing.out(Easing.cubic) });
        vsScale.value = withTiming(1, { duration: t(200), easing: Easing.out(Easing.back(1.2)) });
      }, t(500));

      // Step 3: After another 0.5 seconds delay, enemy name scrolls from right to left
      setTimeout(() => {
        enemyNameX.value = withTiming(0, { duration: t(300), easing: Easing.out(Easing.cubic) });
      }, t(1000)); // 500ms + 500ms delay

      // Step 4: After 1 second delay longer, VS overlay fades out
      setTimeout(() => {
        setAnimationPhase('exiting');
        exitOpacity.value = withTiming(0, { duration: t(300), easing: Easing.in(Easing.cubic) });
        dimmerOpacity.value = withTiming(0, { duration: t(300), easing: Easing.in(Easing.cubic) });
        
        setTimeout(() => {
          onComplete();
        }, t(300));
      }, t(2000)); // 1000ms + 1000ms delay
    }
  }, [visible, speed]);

  const dimmerStyle = useAnimatedStyle(() => ({
    opacity: dimmerOpacity.value,
  }));

  const playerNameStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playerNameX.value }],
  }));

  const enemyNameStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: enemyNameX.value }],
  }));

  const vsStyle = useAnimatedStyle(() => ({
    opacity: vsOpacity.value,
    transform: [{ scale: vsScale.value }],
  }));

  const exitStyle = useAnimatedStyle(() => ({
    opacity: exitOpacity.value,
    transform: [{ translateY: exitTranslateY.value }],
  }));

  if (!visible) return null;

  return (
    <>
      {/* Background dimmer */}
      <Animated.View 
        style={[StyleSheet.absoluteFillObject, dimmerStyle]}
        pointerEvents="none"
      >
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.13)' }]} />
      </Animated.View>

      {/* Main overlay container */}
      <TouchableOpacity 
        style={styles.overlayContainer}
        activeOpacity={1}
        onPress={onSkip}
      >
        <Animated.View style={[styles.contentContainer, exitStyle]}>
          {/* Player name - above VS */}
          <Animated.View style={[styles.playerNameContainer, playerNameStyle]}>
            <Text style={styles.nameText}>
              {playerName.toUpperCase()}
            </Text>
          </Animated.View>

          {/* VS Badge - center */}
          <Animated.View style={[styles.vsContainer, vsStyle]}>
            <VsBadge size={badgeSize} animated={true} />
          </Animated.View>

          {/* Enemy name - below VS */}
          <Animated.View style={[styles.enemyNameContainer, enemyNameStyle]}>
            <Text style={styles.nameText}>
              {enemyName.toUpperCase()}
            </Text>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </>
  );
}

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
  contentContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    height: 300, // Increased height for vertical layout
  },
  playerNameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, // Space between player name and VS
  },
  enemyNameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20, // Space between VS and enemy name
  },
  nameText: {
    fontFamily: 'Cinzel-Black',
    fontWeight: '900',
    fontSize: 24, // Reduced from 36px to fit screen bounds
    color: '#F3D77A', // Same as HUD goldText
    textAlign: 'center',
    letterSpacing: 1.6, // Reduced proportionally (1.2 * 1.33)
    textShadowColor: 'rgba(0,0,0,0.65)', // Same as HUD
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    includeFontPadding: false,
  },
  vsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    position: 'relative',
  },
});
