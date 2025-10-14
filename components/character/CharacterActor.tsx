import { CharacterAppearance } from '@/types/player';
import { getAssetStyle } from '@/utils/getAssetStyle';
import { getItemAsset } from '@/utils/getItemAsset';
import { getSlotPosition } from '@/utils/getSlotPosiiton';
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';
import Animated, {
    cancelAnimation,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { buildEquipmentGroups, buildHeadLayers, computeAutoOffsetX, EquippedMap } from './CharacterFullPreview.helpers';

type Props = {
  appearance: CharacterAppearance;
  equipment?: EquippedMap | null;
  mode?: 'idle' | 'combat';
  mirror?: boolean;
  offsetX?: number;
  offsetY?: number;
  containerHeight?: number;
  containerLeftPercent?: number;
};

export type PartName = 'root'|'torso'|'head'|'arm_R'|'foot_L'|'hand_L';

export type AnchorName = 'foot_L' | 'foot_R' | 'hit_center' | 'weapon_wrist';

export type CharacterActorHandle = {
  animate: (part: PartName, to: Record<string, number>, dur: number) => Promise<void>;
  reset: () => Promise<void>;
  getAnchor: (name: AnchorName) => { x: number; y: number };
};

const BASE_CANVAS = 300;
const FIT_SHRINK = 0.92;
const CENTER_BIAS_X = 20;

const CharacterActor = forwardRef<CharacterActorHandle, Props>(function CharacterActor(
  { appearance, equipment = null, mode = 'combat', mirror = false, offsetX = 0, offsetY = 0, containerHeight, containerLeftPercent },
  ref
) {
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const viewRef = React.useRef<View>(null);
  const winOffsetRef = React.useRef<{x:number;y:number;width:number;height:number}>({ x:0, y:0, width:0, height:0 });
  
  const onLayout = (e: LayoutChangeEvent) => {
    // keep local size for scale calc
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setBox({ w: width, h: height });
    // update absolute (window) position AFTER layout is committed
    requestAnimationFrame(() => {
      if (viewRef.current && 'measureInWindow' in viewRef.current) {
        (viewRef.current as any).measureInWindow((x: number, y: number, w: number, h: number) => {
          winOffsetRef.current = { x, y, width: w, height: h };
        });
      }
    });
  };

  const scaleToFit = useMemo(() => {
    const padding = 12;
    const w = (box?.w ?? 1) - padding * 2;
    const h = (box?.h ?? (containerHeight ?? 1)) - padding * 2;
    const base = Math.min(Math.max(1, w) / BASE_CANVAS, Math.max(1, h) / BASE_CANVAS);
    return Math.max(0.0001, base * FIT_SHRINK);
  }, [box, containerHeight]);

  // shared values (combat-driven)
  const rootTx = useSharedValue(0); // combat root movement only
  const rootTy = useSharedValue(0); // combat root movement only
  const torsoR = useSharedValue(0);
  const headR  = useSharedValue(0);
  const armR   = useSharedValue(-30);   // right wrist rotation (controls weapon too) - more natural position
  const footLy = useSharedValue(0);
  const handLy = useSharedValue(0);     // left hand vertical dip
  const handLr = useSharedValue(0);     // left hand rotation
  // Idle-only movement (separate from combat root movement)
  const idleX = useSharedValue(0);
  const idleY = useSharedValue(0);
  const idleR = useSharedValue(0);
  const idleS = useSharedValue(1);

  // Idle loop only when mode === 'idle' - using original CharacterFullPreview animation
  useEffect(() => {
    console.log('CharacterActor mode changed to:', mode);
    if (mode !== 'idle') return;
    
    console.log('Starting idle animations');
    
    // Small randomization for more organic motion (from original)
    const rand = (min: number, max: number) => min + Math.random() * (max - min);
    const motion = {
      parentBobDur: Math.round(rand(1300, 1700)),
      parentRotDur: Math.round(rand(1200, 1550)),
      parentBreathDur: Math.round(rand(1400, 2000)),
      parentSideDur: Math.round(rand(1500, 1800)),
      parentYAmp: rand(0.6, 1.2),
      parentRAmp: rand(0.5, 0.9),
      parentXAmt: rand(0.4, 1.0),
      breathAmp: rand(0.004, 0.010),
      delayHead: Math.round(rand(0, 250)),
      delayHands: Math.round(rand(120, 300)),
      delayFeet: Math.round(rand(80, 260)),
    };

    // Cancel any existing animations
    cancelAnimation(idleX);
    cancelAnimation(idleY);
    cancelAnimation(idleR);
    cancelAnimation(idleS);
    cancelAnimation(torsoR);
    cancelAnimation(headR);
    cancelAnimation(armR);
    cancelAnimation(footLy);
    cancelAnimation(handLy);
    cancelAnimation(handLr);

    // Reset to baseline
    idleX.value = 0; idleY.value = 0; idleR.value = 0; idleS.value = 1;
    torsoR.value = 0; headR.value = 0; armR.value = -30; footLy.value = 0; handLy.value = 0; handLr.value = 0;

    // Parent-level animations (using idle transforms)
    idleY.value = withRepeat(withSequence(
      withTiming(-motion.parentYAmp, { duration: motion.parentBobDur, easing: Easing.inOut(Easing.sin) }),
      withTiming(motion.parentYAmp, { duration: motion.parentBobDur, easing: Easing.inOut(Easing.sin) }),
    ), -1, true);
    
    idleX.value = withRepeat(withSequence(
      withTiming(-motion.parentXAmt, { duration: motion.parentSideDur, easing: Easing.inOut(Easing.sin) }),
      withTiming(motion.parentXAmt, { duration: motion.parentSideDur, easing: Easing.inOut(Easing.sin) }),
    ), -1, true);
    
    idleR.value = withRepeat(withSequence(
      withTiming(motion.parentRAmp, { duration: motion.parentRotDur, easing: Easing.inOut(Easing.ease) }),
      withTiming(-motion.parentRAmp, { duration: motion.parentRotDur, easing: Easing.inOut(Easing.ease) }),
    ), -1, true);
    
    idleS.value = withRepeat(withSequence(
      withTiming(1 + motion.breathAmp, { duration: motion.parentBreathDur, easing: Easing.inOut(Easing.sin) }),
      withTiming(1 - motion.breathAmp, { duration: motion.parentBreathDur, easing: Easing.inOut(Easing.sin) }),
    ), -1, true);

    // Individual part animations
    torsoR.value = withRepeat(withSequence(
      withTiming(-0.6, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.6, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
    ), -1, true);
    
    headR.value = withRepeat(withSequence(
      withTiming(0.9, { duration: 1100 }),
      withTiming(-0.9, { duration: 1100 }),
    ), -1, true);
    
    armR.value = withRepeat(withSequence(
      withTiming(-28, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
      withTiming(-32, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
    ), -1, true);
    
    footLy.value = withRepeat(withSequence(
      withTiming(0.5, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      withTiming(-0.5, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
    ), -1, true);
    
    return () => {
      console.log('Stopping idle animations');
      cancelAnimation(idleX);
      cancelAnimation(idleY);
      cancelAnimation(idleR);
      cancelAnimation(idleS);
      cancelAnimation(torsoR);
      cancelAnimation(headR);
      cancelAnimation(armR);
      cancelAnimation(footLy);
      cancelAnimation(handLy);
      cancelAnimation(handLr);
    };
  }, [mode]);

  // styles
  const outerStyle = useMemo(() => {
    const s: any = { width: '100%', height: containerHeight ?? '100%', position: 'relative' };
    if (Platform.OS === 'web' && containerLeftPercent != null) s.left = `${containerLeftPercent}%`;
    return s;
  }, [containerHeight, containerLeftPercent]);

  const autoOffsetX = useMemo(
    () => computeAutoOffsetX(appearance, equipment, BASE_CANVAS) + CENTER_BIAS_X,
    [appearance, equipment]
  );

  
  const combinedStyle = useAnimatedStyle(() => ({
    transform: [
      // static centering offsets first
      { translateX: (offsetX + autoOffsetX) },
      { translateY: offsetY },
      
      // >>> ADD THESE 2 LINES <<<
      { translateX: rootTx.value },
      { translateY: rootTy.value },
      
      // idle animated transforms only (root dash handled by wrapper)
      { translateX: idleX.value },
      { translateY: idleY.value },
      { rotateZ: `${idleR.value}deg` },
      { scale: idleS.value },
      // Mirror effect
      ...(mirror ? [{ rotateY: '180deg' }] : []),
    ],
  }));
  const torsoStyle = useAnimatedStyle(() => ({ transform: [{ rotateZ: `${torsoR.value}deg` }] }));
  const headStyle  = useAnimatedStyle(() => ({ transform: [{ rotateZ: `${headR.value}deg` }] }));
  const footLStyle = useAnimatedStyle(() => ({ transform: [{ translateY: footLy.value }] }));
  const armRStyle   = useAnimatedStyle(() => ({ transform: [{ rotateZ: `${armR.value}deg` }] }));
  const handLStyle  = useAnimatedStyle(() => ({ transform: [{ translateY: handLy.value }, { rotateZ: `${handLr.value}deg` }] }));

  // build layers
  const headLayers = useMemo(() => buildHeadLayers(appearance), [appearance]);
  const groups = useMemo(() => buildEquipmentGroups(equipment), [equipment]);


  // Imperative API
  async function animate(part: PartName, to: Record<string, number>, dur: number) {
    await Promise.all(
      Object.keys(to).map(
        (k) =>
          new Promise<void>((res) => {
            const target = to[k as keyof typeof to]!;
            // Resolve on JS after `dur` ms; don't rely on UI-thread completion
            const resolveLater = () => { const id = setTimeout(() => res(), Math.max(0, dur)); /* keep ref if you want cancel */ };

            if (part === 'root' && k === 'tx') { cancelAnimation(rootTx); rootTx.value = withTiming(target, { duration: dur, easing: Easing.out(Easing.cubic) }); resolveLater(); }
            else if (part === 'root' && k === 'ty') { cancelAnimation(rootTy); rootTy.value = withTiming(target, { duration: dur, easing: Easing.out(Easing.cubic) }); resolveLater(); }
            else if (part === 'torso' && k === 'r') { cancelAnimation(torsoR); torsoR.value = withTiming(target, { duration: dur }); resolveLater(); }
            else if (part === 'head'  && k === 'r') { cancelAnimation(headR);  headR.value  = withTiming(target, { duration: dur }); resolveLater(); }
            else if (part === 'arm_R' && k === 'r') { cancelAnimation(armR);   armR.value   = withTiming(target, { duration: dur }); resolveLater(); }
            else if (part === 'foot_L' && k === 'ty'){ cancelAnimation(footLy); footLy.value = withTiming(target, { duration: dur }); resolveLater(); }
            else if (part === 'hand_L' && k === 'r') { cancelAnimation(handLr); handLr.value = withTiming(target, { duration: dur }); resolveLater(); }
            else if (part === 'hand_L' && k === 'ty'){ cancelAnimation(handLy); handLy.value = withTiming(target, { duration: dur }); resolveLater(); }
            else { res(); }
          })
      )
    );
  }

  async function reset() {
    await Promise.all([
      animate('root',  { tx: 0, ty: 0 }, 1),
      animate('torso', { r: 0 }, 1),
      animate('head',  { r: 0 }, 1),
      animate('arm_R', { r: -30 }, 1),
      animate('foot_L',{ ty: 0 }, 1),
      animate('hand_L',{ ty: 0 }, 1),
      animate('hand_L',{ r: 0 }, 1),
    ]);
  }

  // Helper functions for anchor calculations
  const centerOf = (p?: { left: number; top: number; width: number; height: number }) => {
    if (!p) return { x: BASE_CANVAS/2, y: BASE_CANVAS/2 };
    return { x: p.left + p.width/2, y: p.top + p.height/2 };
  };

  const bottomCenterOf = (p?: { left: number; top: number; width: number; height: number }) => {
    if (!p) return { x: BASE_CANVAS / 2, y: BASE_CANVAS * 0.86 };
    // small, sane bias: a little forward and a little below the shoe box
    return { x: p.left + p.width / 2 + 6, y: p.top + p.height + 10 };
  };

  const getAnchor = (name: AnchorName) => {
    // For now, return simple screen coordinates based on character position
    // This avoids the shared value reading issue during render
    
    const baseX = winOffsetRef.current.x + (winOffsetRef.current.width / 2);
    const baseY = winOffsetRef.current.y + (winOffsetRef.current.height / 2);
    
    let offsetX = 0, offsetY = 0;
    
    switch (name) {
      case 'foot_L': 
        offsetX = -20; offsetY = 60; // Left foot, lower
        break;
      case 'foot_R': 
        offsetX = 20; offsetY = 60; // Right foot, lower
        break;
      case 'hit_center': 
        offsetX = 0; offsetY = -20; // Center of character, upper body
        break;
      case 'weapon_wrist': 
        offsetX = 40; offsetY = -10; // Right side, weapon area
        break;
    }
    
    return { 
      x: baseX + offsetX, 
      y: baseY + offsetY 
    };
  };

  useImperativeHandle(ref, () => ({ animate, reset, getAnchor }), [offsetX, offsetY, autoOffsetX, scaleToFit, rootTx, rootTy, mirror]);

  if (!appearance) return null;

  return (
    <View ref={viewRef} style={[styles.container, outerStyle, styles.center]} onLayout={onLayout} pointerEvents="none">
        <Animated.View style={[styles.stack, { width: BASE_CANVAS, height: BASE_CANVAS, transform: [{ scale: scaleToFit }] }]} collapsable={false}>
          <Animated.View style={[styles.layersWrapper, combinedStyle]} collapsable={false}>
          {/* back */}
          <View style={styles.layer} collapsable={false}>
            {groups.back}
          </View>

          {/* feet */}
          <Animated.View style={[styles.layer, footLStyle]} collapsable={false}>
            {groups.feet}
          </Animated.View>

          {/* body */}
          <Animated.View style={[styles.layer, torsoStyle]} collapsable={false}>
            {groups.body}
          </Animated.View>

          {/* RIGHT HAND + WEAPON = 1 pivot at glove:right (wrist) */}
          {(() => {
            const pR = getSlotPosition('glove', 'right'); // {top,left,width,height}
            if (!pR) return null;

            // Move pivot down by 10px and right by 5px (to match weapon positioning)
            const adjustedTop = pR.top + 10;
            const adjustedLeft = pR.left + 5;

            // Pivot box at adjusted wrist position; rotate this tiny box with armRStyle
            const pivotR = [styles.layer, { top: adjustedTop, left: adjustedLeft, width: 1, height: 1 }, armRStyle];
            // Children offset back so their own (top,left) align to pivot(0,0)
            const offset = { position:'absolute' as const, top: -adjustedTop, left: -adjustedLeft, right:0, bottom:0 };

            return (
              <Animated.View key="armR_pivot" style={pivotR} collapsable={false}>
                <View style={offset} pointerEvents="none">
                  {groups.weapon /* follows the wrist perfectly */}
                  {/* right glove above weapon so it "grips" */}
                  {equipment?.glove_right && (() => {
                    const a = getItemAsset('glove', equipment.glove_right);
                    return a ? <Animated.Image source={a.source} style={getAssetStyle(pR.width, pR.height, adjustedTop, adjustedLeft)} resizeMode="contain" /> : null;
                  })()}
                </View>
              </Animated.View>
            );
          })()}

          {/* LEFT HAND = its own pivot at glove:left */}
          {(() => {
            const pL = getSlotPosition('glove', 'left');
            if (!pL) return null;

            const pivotL = [styles.layer, { top: pL.top, left: pL.left, width: 1, height: 1 }, handLStyle];
            const offsetL = { position:'absolute' as const, top: -pL.top, left: -pL.left, right:0, bottom:0 };

            return (
              <Animated.View key="handL_pivot" style={pivotL} collapsable={false}>
                <View style={offsetL} pointerEvents="none">
                  {equipment?.glove_left && (() => {
                    const a = getItemAsset('glove', equipment.glove_left);
                    return a ? <Animated.Image source={a.source} style={getAssetStyle(pL.width, pL.height, pL.top, pL.left)} resizeMode="contain" /> : null;
                  })()}
                  {/* if you ever add an offhand weapon/shield, render it here so it follows handLr/handLy */}
                </View>
              </Animated.View>
            );
          })()}

          {/* head on top */}
          <Animated.View style={[styles.layer, headStyle]} collapsable={false}>
            {headLayers}
          </Animated.View>
          </Animated.View>
        </Animated.View>
    </View>
  );
});

export default React.memo(CharacterActor);

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', width: '100%' },
  center: { alignItems: 'center', justifyContent: 'center' },
  stack: { position: 'relative' },
  layersWrapper: { ...StyleSheet.absoluteFillObject },
  layer: { ...StyleSheet.absoluteFillObject },
});


