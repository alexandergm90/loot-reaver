import { fetchTopbar } from '@/services/topbarService';
import { TopbarData } from '@/types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, ImageBackground, Text, View } from 'react-native';

function formatTwoDigits(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
}

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

export const TopBar: React.FC<{ onRuneRefill?: (data: TopbarData) => void }> = ({ onRuneRefill }) => {
    const [data, setData] = useState<TopbarData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRefetching, setIsRefetching] = useState<boolean>(false);

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
        return Math.max(0, Math.min(100, Math.round((expInCurrentLevel / expRequiredForNextLevel) * 100)));
    }, [data]);

    const { label: countdown, secondsLeft, setSecondsLeft } = useRuneCountdown(data?.runes?.nextRuneInSeconds ?? null);

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
                setSecondsLeft(next && next > 0 ? next : res?.runes?.regenIntervalSeconds ?? null);
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

    const BAR_HEIGHT = 84;

    return (
        <View style={{ paddingTop: 10 }}>
            <ImageBackground
                source={require('@/assets/images/ui/top_bar.png')}
                resizeMode="cover"
                style={{
                    width: '100%',
                    height: BAR_HEIGHT,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: 12,
                    overflow: 'hidden',
                    position: 'relative',
                }}
                imageStyle={{ resizeMode: 'cover' }}
            >
                {/* Absolutely centered level number to match plaque */}
                <Text style={{ position: 'absolute', top: 8, left: 0, right: 0, textAlign: 'center', fontSize: 16, fontWeight: '900' }}>
                    {data ? `${data.level}` : isLoading ? '...' : '—'}
                </Text>
                {/* Left: currencies */}
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', width: '30%' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                        <Image source={require('@/assets/images/icons/gold_pile_icon.png')} style={{ width: 22, height: 22, marginRight: 6 }} />
                        <Text style={{ fontSize: 14, fontWeight: '800' }}>{data?.gold ?? (isLoading ? '...' : '0')}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={require('@/assets/images/icons/scrap_icon.png')} style={{ width: 22, height: 22, marginRight: 6 }} />
                        <Text style={{ fontSize: 14, fontWeight: '800' }}>{data?.scrap ?? (isLoading ? '...' : '0')}</Text>
                    </View>
                </View>

                {/* Center: level + xp */}
                <View style={{ width: '40%', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <ImageBackground
                        source={require('@/assets/images/ui/progress_bar.png')}
                        resizeMode="cover"
                        style={{ height: 18, marginTop: 28, borderRadius: 9, overflow: 'hidden', justifyContent: 'center', alignSelf: 'stretch' }}
                        imageStyle={{ resizeMode: 'cover' }}
                    >
                        <View style={{ width: `${expPercent}%`, height: '100%' }}>
                            <Image
                                source={require('@/assets/images/ui/energy_fill.png')}
                                resizeMode="repeat"
                                style={{ width: '100%', height: '100%' }}
                            />
                        </View>
                        <Text style={{ position: 'absolute', width: '100%', textAlign: 'center', fontSize: 11, fontWeight: '700' }}>
                            {data ? `${data.expInCurrentLevel}/${data.expRequiredForNextLevel}` : ''}
                        </Text>
                    </ImageBackground>
                </View>

                {/* Right: runes */}
                <View style={{ width: '30%', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        {Array.from({ length: data?.runes?.capacity ?? 0 }).map((_, idx) => {
                            const isActive = (data?.runes?.current ?? 0) > idx;
                            const src = isActive
                                ? require('@/assets/images/icons/active_rune_icon.png')
                                : require('@/assets/images/icons/used_rune_icon.png');
                            return <Image key={idx} source={src} style={{ width: 18, height: 18, marginLeft: idx === 0 ? 0 : 6 }} />;
                        })}
                    </View>
                    {data && data.runes.current < data.runes.capacity ? (
                        <Text style={{ fontSize: 11, fontWeight: '700', width: '100%', textAlign: 'right' }}>Next rune in {countdown}</Text>
                    ) : null}
                </View>
            </ImageBackground>
        </View>
    );
};

export default TopBar;


