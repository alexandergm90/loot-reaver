import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, ImageSourcePropType, StyleSheet, View } from 'react-native';

type Ember = {
    id: number;
    startX: number;
    startY: number;
    driftX: number;
    peakY: number;
    size: number;
    rotation: number;
    durationMs: number;
    delayMs: number;
    source: ImageSourcePropType;
    version: number;
};

type EmberFieldProps = {
    poolSize?: number; // total embers kept alive and recycled
    areaPaddingHorizontal?: number;
    motionScale?: number;   // scales travel distance (0..1)
    lifetimeScale?: number; // scales lifetime (0..1)
    fadeOutAt?: number;     // when to start fading (0..1)
};

const emberSources: ImageSourcePropType[] = [
    require('@/assets/images/flame1.png'),
    require('@/assets/images/flame2.png'),
    require('@/assets/images/flame3.png'),
    require('@/assets/images/flame4.png'),
    require('@/assets/images/flame5.png'),
    require('@/assets/images/flame6.png'),
    require('@/assets/images/flame7.png'),
];

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

// Basic upward drift + slight horizontal sway using a single progress value
export const EmberField: React.FC<EmberFieldProps> = ({
    poolSize = 14,
    areaPaddingHorizontal = 24,
    motionScale = 0.6,
    lifetimeScale = 0.85,
    fadeOutAt = 0.55,
}) => {
    const [embers, setEmbers] = useState<Ember[]>([]);
    const area = useRef<{ width?: number; height?: number }>({}).current;

    const makeEmber = useCallback(
        (id: number, isBurst: boolean): Ember | null => {
            if (!area.width || !area.height) return null;
            const width = area.width as number;
            const height = area.height as number;
            const startX = randomBetween(areaPaddingHorizontal, width - areaPaddingHorizontal);
            const startY = height - randomBetween(0, 40);
            const size = randomBetween(16, 34);
            const driftX = randomBetween(-60, 60);
            const peakY = randomBetween(height * 0.6, height * 1.1);
            const rotation = randomBetween(-35, 35);
            const baseDuration = randomBetween(2200, 3600);
            const durationMs = baseDuration * lifetimeScale;
            // Burst ones spawn quickly, others stagger more
            const delayMs = isBurst ? randomBetween(0, 200) : randomBetween(600, 2200);
            const source = emberSources[Math.floor(Math.random() * emberSources.length)];
            return { id, startX, startY, driftX, peakY, size, rotation, durationMs, delayMs, source, version: 0 };
        },
        [area, areaPaddingHorizontal, lifetimeScale],
    );

    // Initialize pool after layout
    const onLayout = (e: any) => {
        area.width = e.nativeEvent.layout.width;
        area.height = e.nativeEvent.layout.height;
        setEmbers((prev) => {
            if (prev.length) return prev;
            const burstCount = Math.floor(randomBetween(3, 6)); // 3-5
            const arr: Ember[] = [];
            for (let i = 0; i < poolSize; i++) {
                const conf = makeEmber(i + 1, i < burstCount);
                if (conf) arr.push(conf);
            }
            return arr;
        });
    };

    const respawn = useCallback((id: number) => {
        setEmbers((prev) => {
            if (!area.width || !area.height) return prev;
            return prev.map((em) => {
                if (em.id !== id) return em;
                const next = makeEmber(id, false);
                return next ? { ...next, version: em.version + 1 } : em;
            });
        });
    }, [makeEmber]);

    return (
        <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onLayout}>
            {embers.map((ember) => (
                <SingleEmber
                    key={`${ember.id}:${ember.version}`}
                    ember={ember}
                    onDone={() => respawn(ember.id)}
                    motionScale={motionScale}
                    fadeOutAt={fadeOutAt}
                />
            ))}
        </View>
    );
};

const SingleEmber: React.FC<{ ember: Ember; onDone: () => void; motionScale: number; fadeOutAt: number }> = ({ ember, onDone, motionScale, fadeOutAt }) => {
    const t = useRef(new Animated.Value(0)).current; // 0..1

    useEffect(() => {
        t.setValue(0);
        Animated.sequence([
            Animated.delay(ember.delayMs),
            Animated.timing(t, {
                toValue: 1,
                duration: ember.durationMs,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => finished && onDone());
        return () => {
            t.stopAnimation();
        };
    }, [ember.version]);

    const sign = ember.driftX >= 0 ? 1 : -1;
    const amp = Math.abs(ember.driftX) * motionScale; // shorter travel
    const rise = ember.peakY * motionScale; // shorter travel

    const translateX = t.interpolate({
        inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
        outputRange: [0, 0.4 * amp * sign, -0.3 * amp * sign, 0.6 * amp * sign, -0.2 * amp * sign, Math.sign(ember.driftX) * amp],
    });
    const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -rise] });

    const fadeStart = Math.min(Math.max(fadeOutAt, 0.3), 0.9);
    const opacity = t.interpolate({ inputRange: [0, 0.12, fadeStart, 1], outputRange: [0, 1, 1, 0] });

    const rotate = t.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [`${ember.rotation - 8}deg`, `${ember.rotation + 8}deg`, `${ember.rotation}deg`],
    });

    const scale = t.interpolate({ inputRange: [0, 0.15, 0.9, 1], outputRange: [0.95, 1, 1, 0.97] });

    return (
        <Animated.Image
            source={ember.source}
            style={{
                position: 'absolute',
                left: ember.startX - ember.size / 2,
                top: ember.startY - ember.size / 2,
                width: ember.size,
                height: ember.size,
                opacity,
                transform: [{ translateX }, { translateY }, { rotate }, { scale }],
                resizeMode: 'contain',
            }}
        />
    );
};

export default EmberField;


