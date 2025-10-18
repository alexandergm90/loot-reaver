import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

type Props = {
  round: number;
  speed: number; // reuse your speed scaling (1, 2, 3…)
};

export function FixedRoundIndicator({ round, speed }: Props) {
  const t = (ms: number) => ms / Math.max(0.25, speed);

  const [displayRound, setDisplayRound] = useState(round);
  const anim = useSharedValue(0);        // number slide
  const glow = useSharedValue(0);        // inner glint
  const studScale = useSharedValue(1);   // diamond pop

  useEffect(() => {
    if (round === displayRound) return;

    // Store the old round for animation
    const oldRound = displayRound;
    
    // number slide
    anim.value = 0;
    anim.value = withTiming(1, { duration: t(180), easing: Easing.out(Easing.cubic) }, () => {
      runOnJS(setDisplayRound)(round);
    });

    // micro-glint + stud pop
    glow.value = 1;
    glow.value = withTiming(0, { duration: t(160), easing: Easing.out(Easing.cubic) });
    studScale.value = 0.96;
    studScale.value = withTiming(1, { duration: t(140), easing: Easing.out(Easing.cubic) });
  }, [round, displayRound]);

  const oldStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -anim.value * 16 }],
    opacity: 1 - anim.value,
  }));

  const newStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - anim.value) * 16 }],
    opacity: anim.value,
  }));

  const innerGlow = useAnimatedStyle(() => ({
    backgroundColor: glow.value > 0 ? 'rgba(255,235,180,0.10)' : 'transparent',
  }));

  const studStyle = useAnimatedStyle(() => ({
    transform: [{ scale: studScale.value }, { rotate: '45deg' }],
  }));

  return (
    <View pointerEvents="none" style={styles.lane}>
      <View style={styles.pillOuter}>
        {/* inner inset */}
        <Animated.View style={[styles.pillInner, innerGlow]}>
          {/* left ornament */}
          <Image
            source={require('@/assets/images/combat/action_type_border.png')}
            style={styles.ornLeft}
            resizeMode="contain"
          />
          
          {/* centered content */}
          <View style={styles.contentCenter}>
            <Text style={styles.label}>ROUND</Text>
            {/* number ticker */}
            <View style={styles.numMask}>
              <Animated.Text style={[styles.num, styles.numOld, oldStyle]}>
                {displayRound}
              </Animated.Text>
              <Animated.Text style={[styles.num, styles.numNew, newStyle]}>
                {round}
              </Animated.Text>
            </View>
          </View>

          {/* tiny diamond stud */}
          <Animated.View style={[styles.stud, studStyle]} />
        </Animated.View>

        {/* hairline highlights */}
        <View style={styles.highlightTop} />
        <View style={styles.highlightBottom} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lane: {
    height: 34, // fixed reservation under HUD
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },

  // bevel shell
  pillOuter: {
    minWidth: 150,
    height: 26,
    borderRadius: 15,
    backgroundColor: 'rgba(25,18,12,0.85)', // darker shell
    borderWidth: 1,
    borderColor: '#2b1d11',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    position: 'relative',
    overflow: 'visible',
    padding: 1, // small lip before inner
  },

  // parchment inset
  pillInner: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: 'rgba(58,42,24,0.78)', // warm parchment tint
    borderWidth: 1,
    borderColor: '#6a4d2a',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // ornaments
  ornLeft: { width: 30, height: 8, opacity: 0.4, marginRight: -2 },

  // centered content
  contentCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  // tiny diamond
  stud: {
    width: 10,
    height: 10,
    marginLeft: 4,
    backgroundColor: '#c87f2a',
    borderColor: '#5a3a19',
    borderWidth: 1,
    borderRadius: 2, // keeps corners a bit softer when rotated
  },

  label: {
    fontFamily: 'Cinzel-Black',
    fontWeight: '900',
    fontSize: 11,        // slightly smaller
    letterSpacing: 0.6,
    color: '#f3e3c0',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  numMask: {
    position: 'relative',
    height: 16,
    width: 30,
    overflow: 'hidden',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  num: {
    position: 'absolute',
    left: 0,
    fontFamily: 'Cinzel-Regular',
    fontWeight: '400',
  },
  numOld: {
    fontSize: 14,
    color: '#f3e3c0',
    opacity: 0.9,
  },
  numNew: {
    fontSize: 15,         // tiny emphasis on the new number
    color: '#F3D77A',     // warmer gold
  },

  // 1px hairlines to fake bevel sheen
  highlightTop: {
    position: 'absolute',
    top: 1,
    left: 6,
    right: 6,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 1,
  },
  highlightBottom: {
    position: 'absolute',
    bottom: 1,
    left: 6,
    right: 6,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 1,
  },
});
