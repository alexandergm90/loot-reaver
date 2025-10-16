import React, { PropsWithChildren, useEffect } from 'react';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

type IdleHeadProps = {
  intensity?: 'low' | 'normal' | 'high';
  seed?: number;        // to desync left/right
  mirror?: boolean;     // flip sway direction if needed
};

export default function IdleHead({
  children,
  intensity = 'normal',
  seed = 0,
  mirror = false,
}: PropsWithChildren<IdleHeadProps>) {
  // amplitudes
  const amp = intensity === 'low' ? 1 : intensity === 'high' ? 3 : 2;   // px/deg multipliers
  const scaleBase = 1;                       // keep at 1; we animate ±0.01..0.02
  const swayDeg = (mirror ? -1 : 1) * (0.4 * amp); // ~0.4–1.2°
  const bobPx   = 0.4 * amp;                 // ~0.4–1.2 px
  const pulse   = 0.005 * amp;               // scale delta 0.5%–1.5%

  // shared values
  const rot = useSharedValue(0);
  const ty  = useSharedValue(0);
  const sc  = useSharedValue(scaleBase);

  // small random offset so they don’t animate in sync
  const jitter = (seed % 1000) * 7 + 180; // ms

  useEffect(() => {
    // gentle sway (rotateZ)
    rot.value = withDelay(
      jitter,
      withRepeat(
        withSequence(
          withTiming(swayDeg,   { duration: 1400, easing: Easing.inOut(Easing.quad) }),
          withTiming(-swayDeg,  { duration: 1400, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );

    // tiny bob (translateY)
    ty.value = withDelay(
      jitter / 2,
      withRepeat(
        withSequence(
          withTiming(-bobPx, { duration: 900, easing: Easing.inOut(Easing.cubic) }),
          withTiming( bobPx, { duration: 900, easing: Easing.inOut(Easing.cubic) })
        ),
        -1,
        true
      )
    );

    // breathing (scale)
    sc.value = withDelay(
      jitter / 3,
      withRepeat(
        withSequence(
          withTiming(scaleBase + pulse, { duration: 1100, easing: Easing.inOut(Easing.cubic) }),
          withTiming(scaleBase - pulse, { duration: 1100, easing: Easing.inOut(Easing.cubic) })
        ),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: ty.value },
      { rotateZ: `${rot.value}deg` },
      { scale: sc.value },
    ],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}


