import { DeathFrame, FrameCardProps } from '@/types/combatV2';
import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

const { width: screenWidth } = Dimensions.get('window');
const DEFEAT_BG = require('@/assets/images/combat/defeat_card.png');

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function useCardMetrics(src: number) {
  const asset = resolveAssetSource(src);
  const aspect = asset?.width && asset?.height ? asset.width / asset.height : 1;
  const MAX_W = Math.min(screenWidth * 0.9, 420);
  const cardW = MAX_W;
  const cardH = cardW / aspect;
  return { aspect, cardW, cardH };
}

export function DeathCard({ frame, actors, onComplete, speed }: FrameCardProps) {
  // Calculate timing based on speed setting - Death should be visible longer
  const getTiming = (speed: number) => {
    switch (speed) {
      case 1: return 2500; // 2.5 seconds - dramatic death
      case 2: return 2000; // 2 seconds
      case 3: return 1500; // 1.5 seconds
      default: return 2500;
    }
  };
  
  useEffect(() => {
    // Simple timer - no animations
    const timer = setTimeout(() => {
      onComplete();
    }, getTiming(speed));
    
    return () => clearTimeout(timer);
  }, [speed, onComplete]);
  
  const deathFrame = frame.payload as DeathFrame;
  const targets = deathFrame.targets.map(id => actors.get(id)).filter(Boolean);
  const cause = deathFrame.cause;
  const target = targets[0]; // Get first target (usually only one)

  const { cardW, cardH } = useCardMetrics(DEFEAT_BG);

  // Tune these once to your PNG (they are % of the card).
  const CONTENT = { top: 0.15, bottom: 0.19, left: 0.10, right: 0.10 };

  const contentW = cardW * (1 - CONTENT.left - CONTENT.right);
  const titleSize = clamp(contentW * 0.16, 22, 40);
  const skullSize = clamp(contentW * 0.12, 18, 28);
  const textSize = clamp(contentW * 0.08, 14, 20);

  // Custom positioning for death card
  const deathTitleTop = cardH * 0.05; // Push title down to 5% of card height
  const deathSkullTop = cardH * 0.20; // Position skull at 20% of card height
  const deathTextTop = cardH * 0.45; // Position text at 45% of card height (moved down)
  const deathCauseTop = cardH * 0.60; // Position cause at 60% of card height (moved down)

  return (
    // FULLSCREEN OVERLAY - same as EndBattleCard
    <View style={styles.overlay}>
      <View style={styles.frameRoot}>
        <View style={[styles.cardBox, { width: cardW, height: cardH }]}>
          {/* Background image - same pattern as EndBattleCard */}
          <Image 
            source={DEFEAT_BG} 
            style={[styles.frameImage, { width: cardW, height: cardH }]} 
            resizeMode="contain" 
          />

          {/* Content area pinned by % insets */}
          <View
            style={{
              position: 'absolute',
              left: cardW * CONTENT.left,
              right: cardW * CONTENT.right,
              top: cardH * CONTENT.top,
              bottom: cardH * CONTENT.bottom,
            }}
          >
            {/* DEATH Title - positioned at 5% of card height */}
            <View style={{ 
              position: 'absolute', 
              top: deathTitleTop, 
              left: 0, 
              right: 0, 
              alignItems: 'center' 
            }}>
              <Text style={[styles.deathTitle, { fontSize: titleSize, letterSpacing: Math.round(titleSize * 0.08) }]}>
                DEATH
              </Text>
            </View>

            {/* Skull Icon - positioned at 20% of card height */}
            <View style={{ 
              position: 'absolute', 
              top: deathSkullTop, 
              left: 0, 
              right: 0, 
              alignItems: 'center' 
            }}>
              <Image
                source={require('@/assets/images/icons/skull.png')}
                style={{ width: skullSize * 3, height: skullSize * 3 }}
                resizeMode="contain"
              />
            </View>

            {/* Target Text - positioned at 35% of card height */}
            {target && (
              <View style={{ 
                position: 'absolute', 
                top: deathTextTop, 
                left: 0, 
                right: 0, 
                alignItems: 'center' 
              }}>
                <Text style={[styles.targetText, { fontSize: textSize }]}>
                  {target.name} has died
                </Text>
              </View>
            )}

            {/* Cause Text - positioned at 50% of card height */}
            {cause && (
              <View style={{ 
                position: 'absolute', 
                top: deathCauseTop, 
                left: 0, 
                right: 0, 
                alignItems: 'center' 
              }}>
                <Text style={[styles.causeText, { fontSize: textSize * 0.8 }]}>
                  Cause: {cause}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',   // ← true overlay
    left: 0, right: 0, top: 0, bottom: 0,
    zIndex: 9999,
    backgroundColor: 'rgba(0,0,0,0.80)',
    alignItems: 'center',
    justifyContent: 'center',
    // Ensure it completely overrides parent positioning
    elevation: 9999,
    // Force immediate positioning to prevent flicker
    transform: [{ translateX: 0 }, { translateY: 0 }],
  },
  frameRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Remove any inherited positioning
    position: 'relative',
  },
  cardBox: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameImage: {
    position: 'absolute',
  },
  deathTitle: {
    fontFamily: 'Cinzel-Black',
    color: '#8B4513', // Dark red-grey color (same as defeat)
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 3,
  },
  targetText: {
    fontFamily: 'Cinzel-Bold',
    color: '#FFD700', // Gold color for better visibility
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
  causeText: {
    fontFamily: 'Cinzel-Regular',
    color: '#FFD700', // Gold color for better visibility
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});