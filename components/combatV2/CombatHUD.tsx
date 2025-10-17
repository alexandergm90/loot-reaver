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
    prevHp?: number; // Previous HP for animation direction
    isHealing?: boolean; // Whether this is a heal animation
};

// --- GLOBAL UI SCALE (20% smaller) ---
const UI_SCALE = 0.8; // <- change this 0.8 → 1.0 any time

// --- BASE SCREEN SCALE (no upscaling) ---
function useScreenScale(baseWidth: number) {
    const { width } = useWindowDimensions();
    return Math.min(1, width / baseWidth);
}

// --- FLOAT SCALE FOR TRANSFORMS ---
function useFloatScale(baseWidth: number) {
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

// Fixed head canvas dimensions
const HEAD_BASE_W = 160;
const HEAD_BASE_H = 160;

const RING_Z = 1,
    HUD_Z = 10,
    TEXT_Z = 20;

const NAME_BASE_PX = 18; // starting size you want
const NAME_MIN_SCALE = 0.85; // floor = 85% of base (keeps parity)
const NAME_LETTER_SP = 1.2; // base letter spacing in px

// Color tokens for consistent theming
const COLORS = {
    goldText: '#F3D77A',      // names/values
    hpGreen: '#38b16a',        // fill
    chip: 'rgba(255,120,40,.65)', // damage trail
    healGlow: 'rgba(76, 175, 80, .25)', // track bg pulse
    blockBlue: '#6aa7ff',      // shield/absorb
    damageRed: '#8B0000',      // damage text
    parchmentBrown: '#3a2a18', // card text
    darkBrown: '#2a1d0d',      // secondary text
};

export function HpBar({
    curHp,
    maxHp,
    trackW,
    trackH,
    inset = 0,
    dangerStops = { mid: 0.5, low: 0.25 },
    prevHp,
    isHealing = false,
}: HpBarProps) {
    const ratio = maxHp > 0 ? Math.max(0, Math.min(1, curHp / maxHp)) : 0;
    const target = Math.round((trackW - inset * 2) * ratio);
    const prevTarget = prevHp ? Math.round((trackW - inset * 2) * Math.max(0, Math.min(1, prevHp / maxHp))) : target;

    const widthAnim = useRef(new Animated.Value(target)).current;
    const healGlowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animate HP bar width
        Animated.timing(widthAnim, {
            toValue: target,
            duration: isHealing ? 220 : 180, // Slightly longer for heal
            useNativeDriver: false,
        }).start();

        // Heal glow animation
        if (isHealing && curHp > (prevHp || 0)) {
            Animated.sequence([
                Animated.timing(healGlowAnim, {
                    toValue: 1,
                    duration: 120,
                    useNativeDriver: false,
                }),
                Animated.timing(healGlowAnim, {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: false,
                }),
            ]).start();
        }
    }, [target, isHealing]);

    // HP bar color based on health percentage
    const barColor = ratio > dangerStops.mid ? COLORS.hpGreen : ratio > dangerStops.low ? '#D7B43A' : '#C43A2E';

    return (
        <View
            style={{
                width: trackW,
                height: trackH + 2, // a hair taller so it breathes
                paddingHorizontal: inset,
                borderRadius: (trackH + 2) / 2,
                backgroundColor: 'rgba(0,0,0,0.35)', // "socket" background
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.45)',
                overflow: 'hidden',
                justifyContent: 'center',
            }}
        >
            {/* Heal glow background */}
            {isHealing && (
                <Animated.View
                    style={{
                        position: 'absolute',
                        width: trackW - inset * 2,
                        height: trackH + 2,
                        backgroundColor: COLORS.healGlow,
                        borderRadius: (trackH + 2) / 2,
                        opacity: healGlowAnim,
                    }}
                />
            )}
            
            {/* HP bar fill */}
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
    const SCREEN_SCALE_FLOAT = useFloatScale(BASE_W);
    const S = (n: number) => Math.round(n * SCREEN_SCALE * UI_SCALE);
    const Sf = (n: number) => n * SCREEN_SCALE_FLOAT * UI_SCALE; // Float scale for transforms
    const { player } = usePlayerStore();

    const [trackW, setTrackW] = useState<number>(S(HP_TRACK_W));

    // Get character head based on whether it's player or enemy
    const getCharacterHead = () => {
        const innerSize = Sf(PORTRAIT_SIZE - 40); // Use float scale
        if (isPlayer && player?.character?.appearance) {
            // inner area inside the ring
            const innerSize = Sf(PORTRAIT_SIZE - 40);      // float scaling for transforms
            const targetSize = innerSize;           // Larger size
            const scale = targetSize / HEAD_BASE_W;        // scale from fixed canvas to target

            // offsets relative to inner area (repositioned)
            const tx = innerSize * 0.45;  // More to the left
            const ty = innerSize * 0.15;  // Higher up

            return (
                <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    {/* translate wrapper (NOT scaled) */}
                    <View style={{ transform: [{ translateX: tx }, { translateY: ty }] }}>
                        {/* scale a FIXED canvas so iOS/Android match */}
                        <View style={{ width: HEAD_BASE_W, height: HEAD_BASE_H, transform: [{ scale }] }}>
                            {/* IMPORTANT: head layers should use absolute positioning within this box */}
                            {buildHeadLayers(player.character.appearance)}
                        </View>
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
                const offsetX = Math.round(innerSize * 0.35);
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
                            color: COLORS.goldText,
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
                        inset={S(2)} // tiny inner padding so it doesn't touch the frame
                    />
                </View>

                {/* Status row reservation (20-24px) */}
                <View
                    style={{
                        position: 'absolute',
                        top: S(HP_ROW_Y) + S(HP_TRACK_H) + S(4), // Below HP bar
                        left: S(SAFE_LR),
                        right: S(SAFE_LR),
                        height: S(22), // 20-24px as requested
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        // Future-proof: ready for status chips
                    }}
                />
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
                // Ensure HUD respects safe area - add small top margin for iPhone notch
                marginTop: 8, // Small buffer from safe area
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
