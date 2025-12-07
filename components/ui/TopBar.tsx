import { fetchTopbar } from '@/services/topbarService';
import { TopbarData } from '@/types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, ImageBackground, LayoutChangeEvent, Text, View } from 'react-native';

function formatTwoDigits(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
}

// Styling constants for unified pill design
const pillStyle = {
    backgroundColor: 'rgba(38,24,12,0.85)',
    borderColor: '#6b4a24',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    height: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
};

const pillTextStyle = {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 12,
    color: '#f5d9a6',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1.25,
};

function formatCurrency(value: number): string {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
}

// Pixel-perfect positioning constants
// Web fallback for Image.resolveAssetSource
const getImageDimensions = () => {
    try {
        const asset = Image.resolveAssetSource(require('@/assets/images/ui/top_bar.png'));
        return { width: asset.width ?? 1056, height: asset.height ?? 248 };
    } catch (error) {
        // Web fallback - use known dimensions
        return { width: 1056, height: 248 };
    }
};

const { width: PSD_W, height: PSD_H } = getImageDimensions();

// Helper to place elements by PSD pixel boxes
function Place({
    box,
    scale,
    children,
}: {
    box: { x: number; y: number; w: number; h: number };
    scale: number;
    children: React.ReactNode;
}) {
    return (
        <View
            style={{
                position: 'absolute',
                left: Math.round(box.x * scale),
                top: Math.round(box.y * scale),
                width: Math.round(box.w * scale),
                height: Math.round(box.h * scale),
            }}
        >
            {children}
        </View>
    );
}

// Debug overlay for calibration
function DebugBox({
    box,
    scale,
    color = 'rgba(0,255,0,.2)',
}: {
    box: { x: number; y: number; w: number; h: number };
    scale: number;
    color?: string;
}) {
    return (
        <View
            style={{
                position: 'absolute',
                left: Math.round(box.x * scale),
                top: Math.round(box.y * scale),
                width: Math.round(box.w * scale),
                height: Math.round(box.h * scale),
                backgroundColor: color,
                borderWidth: 1,
                borderColor: 'rgba(0,255,0,.6)',
            }}
        />
    );
}

// PSD coordinates - adjust these to match your actual PSD layout
const SPEC = {
    levelBadge: { x: 482, y: 34, w: 90, h: 90 },
    goldChip: { x: 224, y: 114, w: 78, h: 40 },
    shardsChip: { x: 364, y: 114, w: 78, h: 40 },
    xp: { x: 334, y: 181, w: 384, h: 33 }, // total track rect (left+mid+right)
    runesBlock: { x: 590, y: 100, w: 190, h: 60 }, // rune+count(+timer)
};

function useRuneCountdown(initialSeconds: number | null) {
    const [secondsLeft, setSecondsLeft] = useState<number | null>(initialSeconds);

    useEffect(() => {
        setSecondsLeft(initialSeconds);
    }, [initialSeconds]);

    useEffect(() => {
        if (secondsLeft == null) return;
        const id = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev == null) return prev;
                return prev > 0 ? prev - 1 : 0;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [secondsLeft]);

    const label = useMemo(() => {
        if (secondsLeft == null) return '--:--';
        const m = Math.floor(secondsLeft / 60);
        const s = secondsLeft % 60;
        return `${formatTwoDigits(m)}:${formatTwoDigits(s)}`;
    }, [secondsLeft]);

    return { label, secondsLeft, setSecondsLeft } as const;
}

export const TopBar: React.FC<{ onRuneRefill?: (data: TopbarData) => void }> = ({
    onRuneRefill,
}) => {
    const [data, setData] = useState<TopbarData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRefetching, setIsRefetching] = useState<boolean>(false);
    const [w, setW] = useState(0);

    useEffect(() => {
        let mounted = true;
        setIsLoading(true);
        fetchTopbar()
            .then((res) => {
                if (mounted) setData(res);
            })
            .catch((err: any) => {
                if (mounted) setError(err?.message || 'Failed to load');
            })
            .finally(() => {
                if (mounted) setIsLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    const expPercent = useMemo(() => {
        if (!data) return 0;
        const { expInCurrentLevel, expRequiredForNextLevel } = data;
        if (expRequiredForNextLevel <= 0) return 0;
        return Math.max(0, Math.min(1, expInCurrentLevel / expRequiredForNextLevel));
    }, [data]);

    const {
        label: countdown,
        secondsLeft,
        setSecondsLeft,
    } = useRuneCountdown(data?.runes?.nextRuneInSeconds ?? null);

    const refetchTopbar = useCallback(async () => {
        if (isRefetching) return;
        setIsRefetching(true);
        try {
            const prev = data;
            const res = await fetchTopbar();
            setData(res);
            // Determine next countdown state: disable when full
            const isFull = (res?.runes?.current ?? 0) >= (res?.runes?.capacity ?? 0);
            if (isFull) {
                setSecondsLeft(null);
            } else {
                const next = res?.runes?.nextRuneInSeconds ?? null;
                setSecondsLeft(
                    next && next > 0 ? next : (res?.runes?.regenIntervalSeconds ?? null),
                );
            }
            if (onRuneRefill && prev && res && res.runes.current > (prev.runes?.current ?? 0)) {
                onRuneRefill(res);
            }
        } catch (err) {
            // keep silent; countdown will try again next tick
        } finally {
            setIsRefetching(false);
        }
        return;
    }, [data, onRuneRefill, setSecondsLeft, isRefetching]);

    const hasRequestedOnZeroRef = useRef(false);
    useEffect(() => {
        if (secondsLeft !== 0) {
            hasRequestedOnZeroRef.current = false;
            return;
        }
        if (!data) return;
        const { runes } = data;
        if (runes.current >= runes.capacity) {
            setSecondsLeft(null);
            return;
        }
        if (hasRequestedOnZeroRef.current) return;
        hasRequestedOnZeroRef.current = true;
        refetchTopbar();
    }, [secondsLeft, data, refetchTopbar, setSecondsLeft]);

    const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);
    const scale = w ? w / PSD_W : 0;
    const height = w ? (w * PSD_H) / PSD_W : 0;

    return (
        <View style={{ paddingTop: 40 }}>
            <View onLayout={onLayout} style={{ width: '100%' }}>
                {scale > 0 && (
                    <ImageBackground
                        source={require('@/assets/images/ui/top_bar.png')}
                        style={{ width: w, height }}
                        imageStyle={{ resizeMode: 'contain' }}
                    >
                        {/* Level number */}
                        <Place box={SPEC.levelBadge} scale={scale}>
                            <View
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    bottom: 0,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        textAlign: 'center',
                                        fontFamily: 'Cinzel_900Black',
                                        fontSize: Math.round(64 * scale),
                                        color: '#F8E6C2',
                                        textShadowColor: 'rgba(0,0,0,0.9)',
                                        textShadowOffset: {
                                            width: 0,
                                            height: Math.max(1, 1 * scale),
                                        },
                                        textShadowRadius: 2 * scale,
                                    }}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    minimumFontScale={0.6}
                                >
                                    {data?.level ?? '—'}
                                </Text>
                            </View>
                        </Place>

                        {/* Gold chip */}
                        <Place box={SPEC.goldChip} scale={scale}>
                            <View
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    bottom: 0,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        textAlign: 'center',
                                        fontFamily: 'Cinzel_700Bold',
                                        fontSize: Math.round(28 * scale),
                                        color: '#FFD700',
                                        textShadowColor: 'rgba(0,0,0,0.8)',
                                        textShadowOffset: { width: 0, height: 1 * scale },
                                        textShadowRadius: 1.2 * scale,
                                    }}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    minimumFontScale={0.7}
                                >
                                    {data?.gold
                                        ? formatCurrency(data.gold)
                                        : isLoading
                                          ? '...'
                                          : '0'}
                                </Text>
                            </View>
                        </Place>

                        {/* Shards chip */}
                        <Place box={SPEC.shardsChip} scale={scale}>
                            <View
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    bottom: 0,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        textAlign: 'center',
                                        fontFamily: 'Cinzel_700Bold',
                                        fontSize: Math.round(28 * scale),
                                        color: '#FFD700',
                                        textShadowColor: 'rgba(0,0,0,0.8)',
                                        textShadowOffset: { width: 0, height: 1 * scale },
                                        textShadowRadius: 1.2 * scale,
                                    }}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    minimumFontScale={0.7}
                                >
                                    {data?.shards
                                        ? formatCurrency(data.shards)
                                        : isLoading
                                          ? '...'
                                          : '0'}
                                </Text>
                            </View>
                        </Place>

                        {/* XP bar */}
                        <Place box={SPEC.xp} scale={scale}>
                            <View style={{ flexDirection: 'row', width: '100%', height: '100%' }}>
                                <View style={{ flex: 1, height: '100%', position: 'relative' }}>
                                    {expPercent > 0 && (
                                        <View
                                            style={{
                                                position: 'absolute',
                                                left: Math.round(18 * scale),
                                                top: -1,
                                                bottom: -1,
                                                marginLeft: -2,
                                                width: expPercent > 0.8 ? Math.round(
                                                    SPEC.xp.w * scale * expPercent -
                                                    36 * scale,
                                                ) : Math.round(
                                                    SPEC.xp.w * scale * expPercent -
                                                    9 * scale,
                                                ),
                                                height: '100%',
                                            }}
                                        >
                                            <Image
                                                source={require('@/assets/images/ui/exp_bar_fill.png')}
                                                style={{ width: '100%', height: '100%' }}
                                                resizeMode="stretch"
                                            />
                                        </View>
                                    )}
                                    {/* Left rounded end overlay */}
                                    {expPercent > 0 && (
                                        <View
                                            style={{
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                width: Math.round(18 * scale),
                                                height: '100%',
                                                marginTop: -1,
                                                marginRight: 0,
                                            }}
                                        >
                                            <Image
                                                source={require('@/assets/images/ui/exp_bar_left.png')}
                                                style={{ width: '100%', height: '100%' }}
                                                resizeMode="contain"
                                            />
                                        </View>
                                    )}
                                    {/* Right rounded end overlay */}
                                    {expPercent >= 1 && (
                                        <View
                                            style={{
                                                position: 'absolute',
                                                right: 0,
                                                top: 0,
                                                width: Math.round(18 * scale),
                                                height: '100%',
                                                marginTop: -1,
                                                marginLeft: -2,
                                            }}
                                        >
                                            <Image
                                                source={require('@/assets/images/ui/exp_bar_right.png')}
                                                style={{ width: '100%', height: '100%' }}
                                                resizeMode="contain"
                                            />
                                        </View>
                                    )}
                                    <View
                                        style={{
                                            position: 'absolute',
                                            left: 0,
                                            right: 0,
                                            top: 0,
                                            bottom: 0,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                position: 'absolute',
                                                left: 0, right: 0, top: 0, bottom: 0,
                                                textAlign: 'center',
                                                textAlignVertical: 'center',
                                                includeFontPadding: false,
                                                fontFamily: 'Cinzel_700Bold',
                                                fontSize: Math.round(24 * scale),
                                                color: '#FFFFFF',
                                                letterSpacing: Math.round(0.25 * scale),
                                                textShadowColor: 'rgba(0,0,0,0.8)',
                                                textShadowOffset: { width: 0, height: Math.max(1, 1 * scale) },
                                                textShadowRadius: Math.round(1.25 * scale),
                                            }}
                                            numberOfLines={1}
                                            adjustsFontSizeToFit
                                            minimumFontScale={0.7}
                                        >
                                            {data
                                                ? `${data.expInCurrentLevel}/${data.expRequiredForNextLevel}`
                                                : ''}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </Place>

                        {/* Runes block */}
                        <Place box={SPEC.runesBlock} scale={scale}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    height: '100%',
                                }}
                            >
                                {(() => {
                                    const currentRunes = data?.runes?.current ?? 0;
                                    const maxRunes = data?.runes?.capacity ?? 0;

                                    if (maxRunes <= 3) {
                                        // Show all runes (max 3) + timer
                                        return (
                                            <>
                                                {Array.from({ length: maxRunes }).map((_, idx) => {
                                                    const isActive = currentRunes > idx;
                                                    const src = isActive
                                                        ? require('@/assets/images/icons/active_rune.png')
                                                        : require('@/assets/images/icons/used_rune.png');
                                                    return (
                                                        <Image
                                                            key={idx}
                                                            source={src}
                                                            style={{
                                                                width: Math.round(50 * scale),
                                                                height: Math.round(50 * scale),
                                                                marginLeft:
                                                                    idx === 0
                                                                        ? 0
                                                                        : Math.round(6 * scale),
                                                            }}
                                                        />
                                                    );
                                                })}
                                                {/* Timer pill - hide when full */}
                                                {currentRunes < maxRunes && (
                                                    <View
                                                        style={{
                                                            backgroundColor: 'rgba(38,24,12,0.85)',
                                                            borderColor: '#6b4a24',
                                                            borderWidth: 1,
                                                            borderRadius: Math.round(15.84 * scale),
                                                            paddingHorizontal: Math.round(
                                                                15.84 * scale,
                                                            ),
                                                            height: Math.round(47.52 * scale),
                                                            marginLeft: Math.round(16 * scale),
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <Text
                                                            style={{
                                                                fontFamily: 'Cinzel_700Bold',
                                                                fontSize: Math.round(21.78 * scale),
                                                                color: '#f5d9a6',
                                                                textShadowColor: 'rgba(0,0,0,0.75)',
                                                                textShadowOffset: {
                                                                    width: 0,
                                                                    height: 1,
                                                                },
                                                                textShadowRadius: Math.round(
                                                                    1.25 * scale,
                                                                ),
                                                            }}
                                                        >
                                                            {countdown}
                                                        </Text>
                                                    </View>
                                                )}
                                            </>
                                        );
                                    } else {
                                        // Show 1 rune + count + timer
                                        const isActive = currentRunes > 0;
                                        const src = isActive
                                            ? require('@/assets/images/icons/active_rune.png')
                                            : require('@/assets/images/icons/used_rune.png');

                                        return (
                                            <>
                                                <Image
                                                    source={src}
                                                    style={{
                                                        width: Math.round(66 * scale),
                                                        height: Math.round(66 * scale),
                                                    }}
                                                />
                                                <View
                                                    style={{
                                                        ...pillStyle,
                                                        borderRadius: Math.round(23.76 * scale),
                                                        paddingHorizontal: Math.round(
                                                            15.84 * scale,
                                                        ),
                                                        height: Math.round(47.52 * scale),
                                                        marginLeft: Math.round(13.2 * scale),
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            ...pillTextStyle,
                                                            fontSize: Math.round(23.76 * scale),
                                                            textShadowRadius: Math.round(
                                                                2.475 * scale,
                                                            ),
                                                        }}
                                                    >
                                                        {currentRunes}/{maxRunes}
                                                    </Text>
                                                </View>
                                                {/* Timer pill - hide when full */}
                                                {currentRunes < maxRunes && (
                                                    <View
                                                        style={{
                                                            backgroundColor: 'rgba(38,24,12,0.85)',
                                                            borderColor: '#6b4a24',
                                                            borderWidth: 1,
                                                            borderRadius: Math.round(15.84 * scale),
                                                            paddingHorizontal: Math.round(
                                                                15.84 * scale,
                                                            ),
                                                            height: Math.round(47.52 * scale),
                                                            marginLeft: Math.round(16 * scale),
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <Text
                                                            style={{
                                                                fontFamily: 'Cinzel_700Bold',
                                                                fontSize: Math.round(21.78 * scale),
                                                                color: '#f5d9a6',
                                                                textShadowColor: 'rgba(0,0,0,0.75)',
                                                                textShadowOffset: {
                                                                    width: 0,
                                                                    height: 1,
                                                                },
                                                                textShadowRadius: Math.round(
                                                                    1.25 * scale,
                                                                ),
                                                            }}
                                                        >
                                                            {countdown}
                                                        </Text>
                                                    </View>
                                                )}
                                            </>
                                        );
                                    }
                                })()}
                            </View>
                        </Place>
                    </ImageBackground>
                )}
            </View>
        </View>
    );
};

export default TopBar;
