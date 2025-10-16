import { buildHeadLayers } from '@/components/character/CharacterFullPreview.helpers';
import IdleHead from '@/components/ui/IdleHead';
import { usePlayerStore } from '@/store/playerStore';
import { CombatHUDProps } from '@/types/combatV2';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Image,
    ImageBackground,
    ImageSourcePropType,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';

type SideProps = {
    name: string;
    curHp: number;
    maxHp: number;
    ringSrc: ImageSourcePropType; // was any
    align?: 'left' | 'right'; // optional, if you ever mirror
    isPlayer?: boolean; // to determine if we need player head or enemy head
    enemyCode?: string; // enemy code for enemy head
};

type HpBarProps = {
    curHp: number;
    maxHp: number;
    trackW: number; // measured width (px)
    trackH: number; // S(HP_TRACK_H)
    inset: number;
    dangerStops?: { mid: number; low: number };
};

// --- GLOBAL UI SCALE (20% smaller) ---
const UI_SCALE = 0.8; // <- change this 0.8 → 1.0 any time

// --- BASE SCREEN SCALE (no upscaling) ---
function useScreenScale(baseWidth: number) {
    const { width } = useWindowDimensions();
    return Math.min(1, width / baseWidth);
}

const BASE_W = 596; // your reference mock width

const ASSETS = {
    hud: require('@/assets/images/combat/combat_hud.png'), // single PNG with BOTH banners (top name + bottom hp)
    playerRing: require('@/assets/images/character_borders/rank1.png'),
    enemyRing: require('@/assets/images/character_borders/enemy_low.png'),
};

const HUD_W = 260,
    HUD_H = 136,
    SAFE_LR = 26,
    NAME_Y = 42;

const HP_ROW_Y = 105,
    HP_TRACK_W = 120,
    HP_TRACK_H = 30;

const PORTRAIT_SIZE = 220,
    HUD_Y_GAP = -50;

const RING_Z = 1,
    HUD_Z = 10,
    TEXT_Z = 20;

const NAME_BASE_PX = 18; // starting size you want
const NAME_MIN_SCALE = 0.85; // floor = 85% of base (keeps parity)
const NAME_LETTER_SP = 1.2; // base letter spacing in px

export function HpBar({
    curHp,
    maxHp,
    trackW,
    trackH,
    inset = 0,
    dangerStops = { mid: 0.5, low: 0.25 },
}: HpBarProps) {
    const ratio = maxHp > 0 ? Math.max(0, Math.min(1, curHp / maxHp)) : 0;
    const target = Math.round((trackW - inset * 2) * ratio);

    const widthAnim = useRef(new Animated.Value(target)).current;
    useEffect(() => {
        Animated.timing(widthAnim, {
            toValue: target,
            duration: 180,
            useNativeDriver: false,
        }).start();
    }, [target]);

    // simple color ramp
    const barColor =
        ratio > dangerStops.mid ? '#28C04A' : ratio > dangerStops.low ? '#D7B43A' : '#C43A2E';

    return (
        <View
            style={{
                width: trackW,
                height: trackH + 2, // a hair taller so it breathes
                paddingHorizontal: inset,
                borderRadius: (trackH + 2) / 2,
                backgroundColor: 'rgba(0,0,0,0.35)', // “socket” background
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.45)',
                overflow: 'hidden',
                justifyContent: 'center',
            }}
        >
            <Animated.View
                style={{
                    width: widthAnim,
                    height: trackH + 2,
                    backgroundColor: barColor,
                    borderRadius: (trackH + 2) / 2,
                }}
            />
        </View>
    );
}

export function HudSide({ name, curHp, maxHp, ringSrc, isPlayer = false, enemyCode }: SideProps) {
    const SCREEN_SCALE = useScreenScale(BASE_W);
    const S = (n: number) => Math.round(n * SCREEN_SCALE * UI_SCALE);
    const { player } = usePlayerStore();

    const [trackW, setTrackW] = useState<number>(S(HP_TRACK_W));

    // Get character head based on whether it's player or enemy
    const getCharacterHead = () => {
        const innerSize = S(PORTRAIT_SIZE - 40);
        if (isPlayer && player?.character?.appearance) {
            // Player head: complex layered group
            const offsetX = Math.round(innerSize * -0.04);
            const offsetY = Math.round(innerSize * -0.3);
            return (
                <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    <View style={{ transform: [{ translateX: offsetX }, { translateY: offsetY }, { scale: 0.6 }] }}>
                        {buildHeadLayers(player.character.appearance)}
                    </View>
                </View>
            );
        } else if (enemyCode) {
            // Enemy head: single plain image
            const getEnemyHeadSource = (code: string) => {
                const enemyHeadMap: Record<string, any> = {
                    goblin_warrior: require('@/assets/images/enemies/goblin_warrior/head.png'),
                };
                return enemyHeadMap[code];
            };

            const enemyHeadSrc = getEnemyHeadSource(enemyCode);
            if (enemyHeadSrc) {
                const offsetX = Math.round(innerSize * 0.4);
                const offsetY = Math.round(innerSize * 0.03);
                return (
                    <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                        <View style={{ transform: [{ translateX: offsetX }, { translateY: offsetY }] }}>
                            <Image
                                source={enemyHeadSrc}
                                style={{
                                    width: S(140),
                                    height: S(140),
                                    resizeMode: 'contain',
                                    transform: [{ scaleX: -1 }],
                                }}
                            />
                        </View>
                    </View>
                );
            }
        }
        return null;
    };

    const characterHead = getCharacterHead();

    return (
        <View style={styles.side}>
            {/* Ring (behind) */}
            <Image
                source={ringSrc}
                resizeMode="contain"
                style={[
                    styles.ring,
                    {
                        width: S(PORTRAIT_SIZE),
                        height: S(PORTRAIT_SIZE),
                        top: 0,
                        zIndex: RING_Z,
                    },
                ]}
            />

            {/* Character Head (inside ring) */}
            {characterHead && (
                <View
                    style={{
                        position: 'absolute',
                        top: S(20), // Small offset from ring top
                        left: S(20), // Small offset from ring left
                        width: S(PORTRAIT_SIZE - 40), // Slightly smaller than ring
                        height: S(PORTRAIT_SIZE - 40),
                        zIndex: RING_Z + 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <IdleHead seed={isPlayer ? 1 : 2} intensity="low" mirror={!isPlayer}>
                        {characterHead}
                    </IdleHead>
                </View>
            )}

            {/* Spacer (keeps HUD below/overlap) */}
            <View style={{ height: S(PORTRAIT_SIZE) + S(HUD_Y_GAP) }} />

            {/* HUD (front) */}
            <ImageBackground
                source={ASSETS.hud}
                resizeMode="stretch"
                capInsets={{ top: 20, left: 28, bottom: 20, right: 28 }}
                style={{
                    width: S(HUD_W),
                    height: S(HUD_H),
                    zIndex: HUD_Z,
                    elevation: HUD_Z,
                    overflow: 'visible',
                    alignSelf: 'center',
                }}
            >
                {/* NAME */}
                <View
                    style={{
                        position: 'absolute',
                        top: S(NAME_Y) - S(14),
                        left: S(SAFE_LR),
                        right: S(SAFE_LR),
                        alignItems: 'center',
                        zIndex: TEXT_Z,
                        elevation: TEXT_Z,
                    }}
                >
                    <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        adjustsFontSizeToFit
                        // floor (e.g., 85% of base). If it needs to go smaller, it will ellipsis instead.
                        minimumFontScale={NAME_MIN_SCALE}
                        allowFontScaling={false}
                        style={{
                            fontFamily: 'Cinzel-Black',
                            fontWeight: '900',
                            // use S() so the base size follows your current screen scale
                            fontSize: S(NAME_BASE_PX),
                            // keep letterSpacing proportional to current screen/UI scale
                            letterSpacing: S(NAME_LETTER_SP),
                            color: '#F3D77A',
                            textAlign: 'center',
                            includeFontPadding: false,
                            textShadowColor: 'rgba(0,0,0,0.65)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                        }}
                    >
                        {name.toUpperCase()}
                    </Text>
                </View>

                {/* HP */}
                <View
                    onLayout={(e) => setTrackW(Math.round(e.nativeEvent.layout.width))}
                    style={{
                        position: 'absolute',
                        top: S(HP_ROW_Y) - S(HP_TRACK_H / 2),
                        left: S(SAFE_LR),
                        right: S(SAFE_LR),
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* HP number */}
                    <Text
                        allowFontScaling={false}
                        style={{
                            position: 'absolute',
                            zIndex: 10,
                            fontFamily: 'Cinzel-Black',
                            fontWeight: '900',
                            fontSize: S(24), // larger & bolder
                            color: '#FFFDF5', // simple white
                            textShadowColor: 'rgba(0,0,0,0.9)', // crisp dark outline
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                        }}
                    >
                        {`${Math.max(0, curHp)}/${maxHp}`}
                    </Text>

                    {/* Health bar */}
                    <HpBar
                        curHp={curHp}
                        maxHp={maxHp}
                        trackW={trackW} // measured width between left/right safe edges
                        trackH={S(HP_TRACK_H)} // keep your current size helper
                        inset={S(2)} // tiny inner padding so it doesn’t touch the frame
                    />
                </View>
            </ImageBackground>
        </View>
    );
}

export function CombatHUD({ actors, playerId, enemyIds, currentHealth }: CombatHUDProps) {
    const player = actors.get(playerId);
    const enemy = enemyIds.map((id: string) => actors.get(id)).find(Boolean);
    if (!player || !enemy) return null;

    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 12,
                paddingTop: 8,
                paddingBottom: 12,
            }}
        >
            <HudSide
                name={player.name}
                curHp={currentHealth[playerId] ?? player.startHp}
                maxHp={player.maxHp}
                ringSrc={require('@/assets/images/character_borders/rank1.png')}
                isPlayer={true}
            />
            <HudSide
                name={enemy.name}
                curHp={currentHealth[enemy.id] ?? enemy.startHp}
                maxHp={enemy.maxHp}
                ringSrc={require('@/assets/images/character_borders/enemy_low.png')}
                isPlayer={false}
                enemyCode={enemy.code}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 12,
    },
    side: {
        width: '48%',
        alignItems: 'center',
        position: 'relative',
    },
    ring: {
        position: 'absolute',
    },
});
