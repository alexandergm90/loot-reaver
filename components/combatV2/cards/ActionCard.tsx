import { FrameCardProps } from '@/types/combatV2';
import React, { useEffect, useMemo } from 'react';
import { Dimensions, ImageBackground, StyleSheet, Text, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export function ActionCard({ frame, actors, onComplete, speed }: FrameCardProps) {
  const actor = actors.get(frame.actorId);

  const totalDamage = useMemo(
    () => (frame.results || []).reduce((sum, r) => sum + Math.max(0, r.amount), 0),
    [frame.results]
  );

  const cardDuration = Math.max(900, Math.round(2400 / speed));

  useEffect(() => {
    const t = setTimeout(onComplete, cardDuration);
    return () => clearTimeout(t);
  }, [cardDuration, onComplete]);

  if (!actor) return null;

  const actorName = (actor.name || '').toUpperCase();
  const verb = 'slashes'; // TODO: map from ability/element later

  return (
    <View style={styles.frameRoot} pointerEvents="none">
      <ImageBackground
        source={require('@/assets/images/combat/card_frame.png')}
        style={styles.frame}
        imageStyle={{ resizeMode: 'contain' }}
      >
        {/* Top name */}
        <View style={styles.topNameRow}>
          <Text style={styles.topName}>{actorName}</Text>
        </View>

        {/* Verb line */}
        <View style={styles.verbRow}>
          <Text style={styles.verb}>{verb}</Text>
        </View>

        {/* Big damage */}
        <View style={styles.damageRow}>
          <Text style={styles.damageValue}>{totalDamage}</Text>
          <Text style={styles.damageLabel}> DAMAGE</Text>
        </View>

        {/* Icons row – placeholders for now */}
        <View style={styles.iconsRow}>
          <Text style={styles.iconTxt}>🔥</Text>
          <Text style={styles.iconTxt}>🟣</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const CARD_ASPECT = 416 / 493; // from provided image
const MAX_W = Math.min(screenWidth * 0.9, 420);
const CARD_W = MAX_W;
const CARD_H = CARD_W / CARD_ASPECT;

const styles = StyleSheet.create({
  frameRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: CARD_W,
    height: CARD_H,
    alignItems: 'center',
  },
  topNameRow: {
    marginTop: CARD_H * 0.085,
  },
  topName: {
    fontFamily: 'Cinzel-Black',
    fontWeight: '900',
    letterSpacing: 1.2,
    fontSize: Math.round(CARD_W * 0.09),
    color: '#2a1d0d',
  },
  verbRow: {
    marginTop: CARD_H * 0.02,
  },
  verb: {
    fontFamily: 'Cinzel-Regular',
    fontSize: Math.round(CARD_W * 0.055),
    color: '#3a2a16',
  },
  damageRow: {
    marginTop: CARD_H * 0.24,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  damageValue: {
    fontFamily: 'Cinzel-Black',
    fontWeight: '900',
    fontSize: Math.round(CARD_W * 0.17),
    color: '#2b1b0b',
  },
  damageLabel: {
    fontFamily: 'Cinzel-Black',
    fontWeight: '900',
    fontSize: Math.round(CARD_W * 0.085),
    color: '#2b1b0b',
    marginLeft: 6,
  },
  iconsRow: {
    position: 'absolute',
    bottom: CARD_H * 0.085,
    width: '42%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconTxt: {
    fontSize: Math.round(CARD_W * 0.09),
  },
});
