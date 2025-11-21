import { CharacterAppearance } from '@/types/player';
import React, { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { buildBodyLayers, buildEquipmentGroups, buildHeadLayers, computeAutoOffsetX, EquippedMap } from './CharacterFullPreview.helpers';

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
    /** Scale multiplier for the head group only (1 = 100%) */
    headScale?: number;
    /** Optional absolute pixel nudges for head only */
    headOffsetX?: number;
    headOffsetY?: number;
};

const BASE_CANVAS = 300;
const FIT_SHRINK = 0.92; // slight global shrink to avoid touching card edges
const CENTER_BIAS_X = 20; // fine-tuned visual nudge slightly less to move left

const CharacterFullPreview: React.FC<Props> = ({
                                                   appearance, equipment = null,
                                                   offsetX = 0, offsetY = 0,
                                                   containerHeight, containerLeftPercent,
                                                   headScale = 1,
                                                   headOffsetX = 0,
                                                   headOffsetY = 0,
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
    
    // Apply 10% scale reduction for male characters (0.9 scale)
    // Also adjust X offset to compensate for scale change (scale down shifts center, so we need to shift back)
    const { maleHeadScale, maleHeadOffsetX } = useMemo(() => {
        const baseScale = headScale;
        if (appearance?.gender === 'male') {
            const scale = baseScale * 0.9;
            // Compensate for scale: when scaling down by 10%, we need to shift left slightly
            // The offset adjustment is roughly 5% of the head width to recenter it
            // Using a small negative offset to shift it back left
            const offsetAdjustment = -7; // Adjust this value if needed for proper alignment
            return { 
                maleHeadScale: scale, 
                maleHeadOffsetX: headOffsetX + offsetAdjustment 
            };
        }
        return { 
            maleHeadScale: baseScale, 
            maleHeadOffsetX: headOffsetX 
        };
    }, [headScale, headOffsetX, appearance?.gender]);
    
    const headStyle = useAnimatedStyle(() => ({ transform: [{ translateX: maleHeadOffsetX }, { translateY: headOffsetY + headY.value }, { rotateZ: `${headR.value}deg` }, { scale: maleHeadScale }] }));
    const rightHandStyle = useAnimatedStyle(() => ({ transform: [{ translateX: rightHandX.value }, { translateY: rightHandY.value }] }));
    const feetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: feetY.value }] }));

    // ---------- head layers ----------
    const headLayers = useMemo(() => buildHeadLayers(appearance, equipment), [appearance, equipment]);
    const bodyLayers = useMemo(() => buildBodyLayers(appearance, equipment), [appearance, equipment]);

    const groups = useMemo(() => buildEquipmentGroups(equipment, appearance), [equipment, appearance]);


    if (!appearance) return <View style={[styles.container, outerStyle]} onLayout={onLayout} />;

    return (
        <View style={[styles.container, outerStyle, styles.center]} onLayout={onLayout} pointerEvents="none">
            {/* centered canvas that scales to fit the measured box */}
            <Animated.View style={[styles.stack, { width: BASE_CANVAS, height: BASE_CANVAS, transform: [{ scale: scaleToFit }] }]} collapsable={false}>
                {/* inner wrapper receives combined centering and animations */}
                <Animated.View style={[styles.layersWrapper, combinedStyle]} collapsable={false}>
                    {/* Render order from back to front (z-index):
                        1. Cape back (lowest, only thing behind body)
                        2. Body (base character body - arms, torso)
                        3. Legs/pants (in front of body, but low - behind other equipment)
                        4. Chest armor (behind cape front)
                        5. Weapons/shield (behind gloves, in front of chest & legs)
                        6. Gloves (max z-index)
                        7. Boots (max z-index)
                        8. Cape front (max z-index)
                        9. Head (base head layers)
                        10. Helmet (max z-index, on top of everything)
                    */}
                    <Animated.View style={[styles.layer]} collapsable={false}>{groups.back}</Animated.View>
                    <Animated.View style={[styles.layer, bodyStyle]} collapsable={false}>{bodyLayers}</Animated.View>
                    <Animated.View style={[styles.layer, bodyStyle]} collapsable={false}>{groups.legs}</Animated.View>
                    <Animated.View style={[styles.layer, bodyStyle]} collapsable={false}>{groups.chest}</Animated.View>
                    <Animated.View style={[styles.layer, rightHandStyle]} collapsable={false}>{groups.weapon}</Animated.View>
                    <Animated.View style={[styles.layer, rightHandStyle]} collapsable={false}>{groups.hands}</Animated.View>
                    <Animated.View style={[styles.layer, feetStyle]} collapsable={false}>{groups.feet}</Animated.View>
                    <Animated.View style={[styles.layer]} collapsable={false}>{groups.capeFront}</Animated.View>
                    <Animated.View style={[styles.layer, headStyle]} collapsable={false}>{headLayers}</Animated.View>
                    <Animated.View style={[styles.layer, headStyle]} collapsable={false}>{groups.helmet}</Animated.View>
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
