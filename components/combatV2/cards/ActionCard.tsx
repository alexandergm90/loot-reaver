import { FrameCardProps } from '@/types/combatV2';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

// Ability image mapping
const abilityImageMap: Record<string, any> = {
  slashes: require('@/assets/images/combat/combat_slash.png'),
  stabs: require('@/assets/images/combat/combat_stab.png'),
  smashes: require('@/assets/images/combat/combat_smash.png'),
};

// Debuff image mapping
const debuffImageMap: Record<string, any> = {
  bleed: require('@/assets/images/combat/debuffs/bleed.png'),
};

// Healing/buff pulse animation hook
function usePulse(speed = 1) {
  const t = (ms: number) => ms / Math.max(0.25, speed);
  const p = useSharedValue(0);
  
  const play = () => {
    p.value = 0;
    p.value = withSequence(
      withTiming(1, { duration: t(180), easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: t(220), easing: Easing.in(Easing.cubic) }),
    );
  };
  
  const style = useAnimatedStyle(() => ({
    opacity: p.value * 0.35,
    transform: [{ scale: 1 + p.value * 0.1 }],
  }));
  
  return { play, style };
}

// Impact shake animation hook
function useCardShake(speed = 1) {
  const t = (ms: number) => ms / Math.max(0.25, speed);
  const sx = useSharedValue(0);
  const sy = useSharedValue(0);
  const r = useSharedValue(0);

  const bump = () => {
    sx.value = withSequence(
      withTiming(-4, { duration: t(30), easing: Easing.linear }),
      withTiming(4, { duration: t(40), easing: Easing.linear }),
      withTiming(-2, { duration: t(30), easing: Easing.linear }),
      withTiming(0, { duration: t(40), easing: Easing.linear }),
    );
    sy.value = withSequence(
      withTiming(2, { duration: t(30) }),
      withTiming(-1, { duration: t(40) }),
      withTiming(1, { duration: t(30) }),
      withTiming(0, { duration: t(40) }),
    );
    r.value = withSequence(
      withTiming(-1.5, { duration: t(30) }),
      withTiming(1.0, { duration: t(70) }),
      withTiming(0.0, { duration: t(40) }),
    );
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: sx.value },
      { translateY: sy.value },
      { rotate: `${r.value}deg` },
    ],
  }));
  
  return { bump, shakeStyle };
}

// Enhanced entrance animation hook with dramatic effects
function useFlipLite(speed = 1) {
  const t = (ms: number) => ms / Math.max(0.25, speed);

  const sc = useSharedValue(1.0);  // Start at normal size
  const ty = useSharedValue(0);    // Start at normal position
  const op = useSharedValue(1);    // Start visible
  const rot = useSharedValue(0);   // Start at normal rotation
  const shadow = useSharedValue(1); // Start with shadow

  const intro = (onDone?: () => void) => {
    // Reset values to start position for each animation
    sc.value = 0.7;   // Start small
    ty.value = 50;    // Start down
    op.value = 0;     // Start invisible
    rot.value = -15;  // Start rotated
    shadow.value = 0; // Start with no shadow
    
    // Dramatic entrance: fade in + scale up + slide up + rotate + shadow
    op.value = withTiming(1, { duration: t(200), easing: Easing.out(Easing.cubic) });
    sc.value = withTiming(1.0, { duration: t(300), easing: Easing.out(Easing.back(1.2)) }); // Overshoot bounce
    ty.value = withTiming(0, { duration: t(280), easing: Easing.out(Easing.cubic) });
    rot.value = withTiming(0, { duration: t(250), easing: Easing.out(Easing.cubic) });
    shadow.value = withTiming(1, { duration: t(300), easing: Easing.out(Easing.cubic) });

    if (onDone) setTimeout(onDone, t(400));
  };

  const outro = (onDone?: () => void) => {
    // Improved outro: consistent with intro but faster
    op.value = withTiming(0, { duration: t(120), easing: Easing.in(Easing.cubic) });
    sc.value = withTiming(0.94, { duration: t(140), easing: Easing.in(Easing.cubic) });
    ty.value = withTiming(-24, { duration: t(140), easing: Easing.in(Easing.cubic) });
    rot.value = withTiming(-3, { duration: t(140), easing: Easing.in(Easing.cubic) });
    shadow.value = withTiming(0, { duration: t(120), easing: Easing.in(Easing.cubic) });
    
    if (onDone) setTimeout(onDone, t(140));
  };

  const style = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: op.value,
    transform: [
        { translateY: ty.value },
        { scale: sc.value },
        { rotate: `${rot.value}deg` },
      ],
      shadowOpacity: shadow.value * 0.3,
      shadowRadius: shadow.value * 8,
      shadowOffset: { width: 0, height: shadow.value * 4 },
      elevation: shadow.value * 8,
    };
  });
  
  return { intro, outro, style };
}

// Card stack ghosts component for depth illusion with progressive history
function CardStackGhosts({ width, height, frameSrc, actionCount = 1, drift }: {
  width: number;
  height: number;
  frameSrc: any;
  actionCount?: number;
  drift?: any; // SharedValue<number>
}) {
  // Animated styles for drift effect
  const ghost1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: 40 - (drift?.value || 0) * 6 },
      { translateY: -22 },
      { scale: 0.9 }
    ]
  }));

  const ghost2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: -40 + (drift?.value || 0) * 6 },
      { translateY: -12 },
      { scale: 0.94 }
    ]
  }));
  
  return (
    <>
      {/* older history - always render but control visibility */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width,
            height,
            opacity: actionCount >= 3 ? 0.28 : 0, // Control visibility with opacity
            zIndex: 5,
            elevation: 5,
          },
          ghost1Style
        ]}
      >
        <Image source={frameSrc} style={{ width, height }} resizeMode="contain" />
      </Animated.View>

      {/* most recent history - always render but control visibility */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width,
            height,
            opacity: actionCount >= 2 ? 0.42 : 0, // Control visibility with opacity
            zIndex: 10,
            elevation: 10,
          },
          ghost2Style
        ]}
      >
        <Image source={frameSrc} style={{ width, height }} resizeMode="contain" />
          </Animated.View>
    </>
  );
}

// Color tokens for consistent theming
const COLORS = {
    goldText: '#F3D77A',      // names/values
    hpGreen: '#38b16a',        // fill
    chip: 'rgba(255,120,40,.65)', // damage trail
    healGlow: 'rgba(76, 175, 80, .25)', // track bg pulse
    blockBlue: '#6aa7ff',      // shield/absorb
    damageRed: '#8B0000',      // damage text
    parchmentBrown: '#3a2a18', // card text
    darkBrown: '#2a1d0d',      // secondary text
};

export function ActionCard({ frame, actors, onComplete, speed }: FrameCardProps) {
  const actor = actors.get(frame.actorId);
  const iconScaleAnim = useSharedValue(1);
  const { intro, outro, style: flipStyle } = useFlipLite(speed);
  
  // Animation hooks
  const { bump, shakeStyle } = useCardShake(speed);
  const { play: playPulse, style: pulseStyle } = usePulse(speed);
  
  // Parallax drift for background cards
  const drift = useSharedValue(1);

  // Use actionIndex from frame for card stacking
  const actionCount = frame.actionIndex || 1;

  const totalDamage = useMemo(
    () => (frame.results || []).reduce((sum, r) => sum + Math.max(0, r.amount), 0),
    [frame.results]
  );

  // Check for healing/buff effects
  const healed = useMemo(
    () => (frame.results || []).some(r => r.amount < 0), // Negative amount indicates healing
    [frame.results]
  );
  
  const shielded = useMemo(
    () => false, // No shield detection available in current types
    [frame.results]
  );

  // Extract ability type from frame
  const abilityType = frame.ability || 'slashes';
  const abilityImage = abilityImageMap[abilityType];

  // Extract applied debuffs from results
  const appliedDebuffs = useMemo(() => {
    const debuffs: string[] = [];
    (frame.results || []).forEach(result => {
      if (result.statusApplied) {
        result.statusApplied.forEach(status => {
          if (status.id === 'bleed' && !debuffs.includes('bleed')) {
            debuffs.push('bleed');
          }
        });
      }
    });
    return debuffs;
  }, [frame.results]);

  const cardDuration = speed === 0 ? 0 : Math.max(900, Math.round(2400 / speed));

  useEffect(() => {
    if (speed === 0) {
      // Speed 0 = pause, don't auto-complete
      return;
    }
    const t = setTimeout(onComplete, cardDuration);
    return () => clearTimeout(t);
  }, [cardDuration, onComplete, speed]);

  // Card intro animation using flip-lite - trigger for every action card
  useEffect(() => {
    // Trigger parallax drift
    drift.value = 1;
    drift.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
    
    intro(() => {
      // Trigger impact shake for damage
      if (totalDamage > 0) {
        setTimeout(() => bump(), 100); // Small delay after intro
      }
      
      // Trigger healing pulse
      if (healed || shielded) {
        setTimeout(() => playPulse(), 150);
      }
    });
  }, [frame.actionIndex]); // Trigger on every action card

  // Action icon overshoot animation (1.0→1.08→1.0 in 140ms) + haptics
  useEffect(() => {
    iconScaleAnim.value = withSequence(
      withTiming(1.08, { duration: 70, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0, { duration: 70, easing: Easing.out(Easing.cubic) })
    );

    // Enhanced haptics based on damage amount and effects
    if (totalDamage > 0) {
      const isCrit = totalDamage > 20; // Simple crit detection
      Haptics.impactAsync(isCrit ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (healed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    if (shielded) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [abilityType, totalDamage]); // Trigger on ability change and damage

  const iconAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: iconScaleAnim.value }],
    };
  });

  const actorName = (actor?.name || '').toUpperCase();
  
  return (
    <View style={styles.frameRoot} pointerEvents="none">
      {/* Card stack container */}
      <View
        style={{ 
          position: 'relative', 
          width: CARD_W, 
          height: CARD_H,
          alignSelf: 'center'
        }}
        pointerEvents="none"
      >
        {/* Card stack ghosts for depth illusion */}
        <CardStackGhosts 
          width={CARD_W} 
          height={CARD_H} 
          frameSrc={require('@/assets/images/combat/card_frame.png')}
          actionCount={actionCount}
          drift={drift}
        />
        
        {/* Active card always above ghosts */}
        <Animated.View 
          style={[
            { 
              position: 'absolute', 
              inset: 0, 
              zIndex: 100, 
              elevation: 100 
            }, 
            flipStyle,
            shakeStyle
          ]}
        >
          <View style={styles.frame}>
            <Image
              source={require('@/assets/images/combat/card_frame.png')}
              style={styles.frameImage}
              resizeMode="contain"
            />
            {/* Top name */}
            <View style={styles.topNameRow}>
              <Text style={styles.topName}>{actorName}</Text>
        </View>
        
        {/* Verb line */}
        <View style={styles.verbRow}>
          <Image
            source={require('@/assets/images/combat/action_type_border.png')}
            style={styles.actionBorderLeft}
            resizeMode="contain"
          />
          <Text style={styles.verb}>{abilityType}</Text>
          <Image
            source={require('@/assets/images/combat/action_type_border.png')}
            style={styles.actionBorderRight}
            resizeMode="contain"
          />
        </View>

            {/* Ability image in middle */}
            {abilityImage && (
              <View style={styles.abilityImageContainer}>
                {/* Healing pulse background */}
                {(healed || shielded) && (
                  <Animated.View style={[{
                    position: 'absolute',
                    width: '86%',
                    height: '44%',
                    borderRadius: 16,
                    backgroundColor: healed ? 'rgba(76,175,80,0.25)' : 'rgba(90,140,255,0.25)',
                  }, pulseStyle]} />
                )}
                <Animated.Image
                  source={abilityImage}
                  style={[styles.abilityImage, iconAnimatedStyle]}
                  resizeMode="contain"
                />
              </View>
            )}

        {/* Damage text - moved lower */}
        <View style={styles.damageRow}>
          <Text style={styles.damageValue}>{totalDamage}</Text>
          <Text style={styles.damageLabel}> DAMAGE</Text>
        </View>

        {/* Debuff icons */}
        {appliedDebuffs.length > 0 && (
          <View style={styles.debuffsRow}>
            {appliedDebuffs.map((debuffType, index) => {
              const debuffImage = debuffImageMap[debuffType];
              return debuffImage ? (
                <Image
                  key={index}
                  source={debuffImage}
                  style={styles.debuffIcon}
                  resizeMode="contain"
                />
              ) : null;
            })}
            </View>
          )}
        </View>
      </Animated.View>
      </View>
    </View>
  );
}

const CARD_ASPECT = 416 / 493; // from provided image
const MAX_W = Math.min(screenWidth * 0.9, 420);
const CARD_W = MAX_W;
const CARD_H = CARD_W / CARD_ASPECT;

const styles = StyleSheet.create({
  frameRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: CARD_W,
    height: CARD_H,
    alignItems: 'center',
  },
  frameImage: {
    width: CARD_W,
    height: CARD_H,
    position: 'absolute',
  },
  topNameRow: {
    marginTop: CARD_H * 0.15 - 3, // Nudged up 3px relative to scroll ornaments
  },
  topName: {
    fontFamily: 'Cinzel-Black',
    fontWeight: '900',
    fontSize: Math.round(CARD_W * 0.06),
    color: COLORS.parchmentBrown,
    textAlign: 'center',
    // Simple, clean shadow
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  verbRow: {
    marginTop: CARD_H * -0.005,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verb: {
    fontFamily: 'Cinzel-Regular',
    fontWeight: '400',
    fontSize: Math.round(CARD_W * 0.05), // Larger
    color: COLORS.darkBrown,
    textShadowColor: 'rgba(255,255,255,0.2)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
    marginHorizontal: 12, // More spacing for larger borders
  },
  actionBorderLeft: {
    width: Math.round(CARD_W * 0.12), // Larger
    height: Math.round(CARD_W * 0.03), // Larger
  },
  actionBorderRight: {
    width: Math.round(CARD_W * 0.12), // Larger
    height: Math.round(CARD_W * 0.03), // Larger
    transform: [{ scaleX: -1 }], // Flip horizontally
  },
  abilityImageContainer: {
    marginTop: CARD_H * 0.001, // Moved down more
    width: CARD_W * 0.8, // Larger
    height: CARD_H * 0.4, // Larger
    alignItems: 'center',
    justifyContent: 'center',
  },
  abilityImage: {
    width: '100%',
    height: '100%',
  },
  damageRow: {
    marginTop: CARD_H * 0.01, // Moved up significantly
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  damageValue: {
    fontFamily: 'Cinzel-Black',
    fontWeight: '900',
    fontSize: Math.round(CARD_W * 0.088), // 8-10% larger than DAMAGE label
    color: COLORS.damageRed,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  damageLabel: {
    fontFamily: 'Cinzel-Bold',
    fontWeight: '700',
    fontSize: Math.round(CARD_W * 0.08),
    color: COLORS.darkBrown,
    marginLeft: 4,
    letterSpacing: 1, // +1px tracking as requested
    textShadowColor: 'rgba(255,255,255,0.2)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
  },
  debuffsRow: {
    marginTop: CARD_H * 0.001, // Moved up above damage
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
    paddingLeft: CARD_W * 0.25, // Add left padding to start from left side
  },
  debuffIcon: {
    width: 40,
    height: 40,
    marginRight: 8, // Space between debuffs
  },
});
