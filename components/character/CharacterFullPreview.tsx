import { CharacterAppearance } from '@/types/player';
import React, { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';
import Animated, { Easing, runOnUI, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { buildEquipmentGroups, buildHeadLayers, computeAutoOffsetX, EquippedMap } from './CharacterFullPreview.helpers';

// EquippedMap is imported from helpers

type Props = {
    appearance: CharacterAppearance | null | undefined;
    equipment?: EquippedMap | null;
    /** Optional offsets in canvas units (after scaling) */
    offsetX?: number;
    offsetY?: number;
    /** If you pass a fixed height, we’ll honor it; otherwise we stretch. */
    containerHeight?: number;
    containerLeftPercent?: number;
};

const BASE_CANVAS = 300;
const FIT_SHRINK = 0.92; // slight global shrink to avoid touching card edges
const CENTER_BIAS_X = 20; // fine-tuned visual nudge slightly less to move left

const CharacterFullPreview: React.FC<Props> = ({
                                                   appearance, equipment = null,
                                                   offsetX = 0, offsetY = 0,
                                                   containerHeight, containerLeftPercent,
                                               }) => {
    // ---- measure the actual box we’re given
    const [box, setBox] = useState<{ w: number; h: number } | null>(null);
    const onLayout = useCallback((e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        if (width > 0 && height > 0) setBox({ w: width, h: height });
    }, []);

    // scale to contain BASE_CANVAS inside measured box with a small padding to avoid clipping
    const scaleToFit = useMemo(() => {
        const padding = 12; // px padding inside the container
        const w = (box?.w ?? 1) - padding * 2;
        const h = (box?.h ?? (containerHeight ?? 1)) - padding * 2;
        const safeW = Math.max(1, w);
        const safeH = Math.max(1, h);
        const base = Math.min(safeW / BASE_CANVAS, safeH / BASE_CANVAS);
        return Math.max(0.0001, base * FIT_SHRINK);
    }, [box, containerHeight]);

    // ---------- animations ----------
    const parentY = useSharedValue(0);
    const parentX = useSharedValue(0);
    const parentR = useSharedValue(0);
    const parentS = useSharedValue(1);

    const bodyY = useSharedValue(0);
    const headY = useSharedValue(0);
    const headR = useSharedValue(0);
    const rightHandX = useSharedValue(0);
    const rightHandY = useSharedValue(0);
    const feetY = useSharedValue(0);

    // Small randomization for more organic motion
    const rand = React.useCallback((min: number, max: number) => min + Math.random() * (max - min), []);
    const motion = React.useMemo(() => ({
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
    }), [rand]);

    React.useEffect(() => {
        runOnUI(() => {
            'worklet';
            const m = motion; // capture

            bodyY.value = headY.value = headR.value = rightHandX.value = rightHandY.value = feetY.value = 0;
            parentY.value = 0; parentX.value = 0; parentR.value = 0; parentS.value = 1;

            parentY.value = withRepeat(withSequence(
                withTiming(-m.parentYAmp, { duration: m.parentBobDur, easing: Easing.inOut(Easing.sin) }),
                withTiming(m.parentYAmp,  { duration: m.parentBobDur, easing: Easing.inOut(Easing.sin) }),
            ), -1, true);
            parentX.value = withRepeat(withSequence(
                withTiming(-m.parentXAmt, { duration: m.parentSideDur, easing: Easing.inOut(Easing.sin) }),
                withTiming(m.parentXAmt,  { duration: m.parentSideDur, easing: Easing.inOut(Easing.sin) }),
            ), -1, true);
            parentR.value = withRepeat(withSequence(
                withTiming(m.parentRAmp,  { duration: m.parentRotDur, easing: Easing.inOut(Easing.ease) }),
                withTiming(-m.parentRAmp, { duration: m.parentRotDur, easing: Easing.inOut(Easing.ease) }),
            ), -1, true);
            parentS.value = withRepeat(withSequence(
                withTiming(1 + m.breathAmp, { duration: m.parentBreathDur, easing: Easing.inOut(Easing.sin) }),
                withTiming(1 - m.breathAmp, { duration: m.parentBreathDur, easing: Easing.inOut(Easing.sin) }),
            ), -1, true);

            bodyY.value = withDelay(m.delayHands, withRepeat(withSequence(
                withTiming(-0.6, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.6,  { duration: 1400, easing: Easing.inOut(Easing.sin) }),
            ), -1, true));
            headY.value = withDelay(m.delayHead, withRepeat(withSequence(
                withTiming(0.9,  { duration: 900, easing: Easing.inOut(Easing.quad) }),
                withTiming(-0.9, { duration: 900, easing: Easing.inOut(Easing.quad) }),
            ), -1, true));
            headR.value = withDelay(m.delayHead, withRepeat(withSequence(
                withTiming(0.9, { duration: 1100 }),
                withTiming(-0.9, { duration: 1100 }),
            ), -1, true));
            rightHandX.value = withDelay(m.delayHands, withRepeat(withSequence(
                withTiming(1.8, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
                withTiming(-1.8,{ duration: 1000, easing: Easing.inOut(Easing.quad) }),
            ), -1, true));
            rightHandY.value = withDelay(m.delayHands, withRepeat(withSequence(
                withTiming(1.1,  { duration: 1000 }),
                withTiming(-1.1, { duration: 1000 }),
            ), -1, true));
            feetY.value = withDelay(m.delayFeet, withRepeat(withSequence(
                withTiming(0.5,  { duration: 1600, easing: Easing.inOut(Easing.sin) }),
                withTiming(-0.5, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
            ), -1, true));
        })();
    }, [motion]);

    // ---------- computed styles ----------
    const outerStyle = useMemo(() => {
        const s: any = {
            width: '100%',
            height: containerHeight ?? '100%',
            position: 'relative',
        };
        if (Platform.OS === 'web' && containerLeftPercent != null) {
            s.left = `${containerLeftPercent}%`;
        }
        return s;
    }, [containerHeight, containerLeftPercent]);

    // ---------- compute visual bounds for auto-centering ----------
    const autoOffsetX = useMemo(() => computeAutoOffsetX(appearance, equipment, BASE_CANVAS) + CENTER_BIAS_X, [appearance, equipment]);

    // Keep canvas at BASE_CANVAS and scale only via transform to avoid double-scaling

    const combinedStyle = useAnimatedStyle(() => ({
        transform: [
            // static centering offsets first
            { translateX: (offsetX + autoOffsetX) },
            { translateY: offsetY },
            // then animated transforms
            { translateX: parentX.value },
            { translateY: parentY.value },
            { rotateZ: `${parentR.value}deg` },
            { scale: parentS.value },
        ],
    }));
    const bodyStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bodyY.value }] }));
    const headStyle = useAnimatedStyle(() => ({ transform: [{ translateY: headY.value }, { rotateZ: `${headR.value}deg` }] }));
    const rightHandStyle = useAnimatedStyle(() => ({ transform: [{ translateX: rightHandX.value }, { translateY: rightHandY.value }] }));
    const feetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: feetY.value }] }));

    // ---------- head layers ----------
    const headLayers = useMemo(() => buildHeadLayers(appearance), [appearance]);

    const groups = useMemo(() => buildEquipmentGroups(equipment), [equipment]);


    if (!appearance) return <View style={[styles.container, outerStyle]} onLayout={onLayout} />;

    return (
        <View style={[styles.container, outerStyle, styles.center]} onLayout={onLayout} pointerEvents="none">
            {/* centered canvas that scales to fit the measured box */}
            <Animated.View style={[styles.stack, { width: BASE_CANVAS, height: BASE_CANVAS, transform: [{ scale: scaleToFit }] }]} collapsable={false}>
                {/* inner wrapper receives combined centering and animations */}
                <Animated.View style={[styles.layersWrapper, combinedStyle]} collapsable={false}>
                    <Animated.View style={[styles.layer, bodyStyle]} collapsable={false}>{groups.back}{groups.body}</Animated.View>
                    <Animated.View style={[styles.layer, feetStyle]} collapsable={false}>{groups.feet}</Animated.View>
                    <Animated.View style={[styles.layer, rightHandStyle]} collapsable={false}>{groups.weapon}</Animated.View>
                    <Animated.View style={[styles.layer, rightHandStyle]} collapsable={false}>{groups.hands}</Animated.View>
                    <Animated.View style={[styles.layer, headStyle]} collapsable={false}>{headLayers}</Animated.View>
                </Animated.View>
            </Animated.View>
        </View>
    );
};

export default React.memo(CharacterFullPreview);

const styles = StyleSheet.create({
    container: {
        alignSelf: 'stretch',
        width: '100%',
        // If parent doesn’t set an explicit height, also make this stretch:
        // height: '100%',  // enable if parent provides a fixed height via style
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    stack: {
        position: 'relative',
        width: BASE_CANVAS,
        height: BASE_CANVAS,
    },
    layersWrapper: {
        ...StyleSheet.absoluteFillObject,
    },
    layer: {
        ...StyleSheet.absoluteFillObject,
    },
});
