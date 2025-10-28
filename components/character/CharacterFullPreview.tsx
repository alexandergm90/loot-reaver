import { CharacterAppearance } from '@/types/player';
import React, { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
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

    // All animations disabled - character remains static
    // All shared values remain at their default 0 values, keeping the character static

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
