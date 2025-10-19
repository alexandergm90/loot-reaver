import AppButton from '@/components/ui/AppButton';
import { EndBattleFrame, FrameCardProps } from '@/types/combatV2';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
// Import the standalone resolver
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

const { width: screenWidth } = Dimensions.get('window');

const VICTORY_BG = require('@/assets/images/combat/victory_card.png');
const DEFEAT_BG = require('@/assets/images/combat/defeat_card.png');

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function useCardMetrics(src: number) {
  // Use the same sizing logic as ActionCard
  const asset = resolveAssetSource(src);
  const aspect = asset?.width && asset?.height ? asset.width / asset.height : 1;
  
  // Same logic as ActionCard: screenWidth * 0.9 with max 420px
  const MAX_W = Math.min(screenWidth * 0.9, 420);
  const cardW = MAX_W;
  const cardH = cardW / aspect;
  
  return { aspect, cardW, cardH };
}

export function EndBattleCard({ frame, onCombatEnd }: FrameCardProps) {
  const battle = frame.payload as EndBattleFrame;
  const outcome = battle.outcome || 'victory';
  const rewards = battle.rewards || { gold: 0, xp: 0 };
  const isVictory = outcome === 'victory';

  const { cardW, cardH } = useCardMetrics(VICTORY_BG);

  // Tune these once to your PNG (they are % of the card).
  // If your art has extra transparent padding at top/bottom for the diamond,
  // include that in these values. Start with these and nudge by ±0.01 as needed.
  const CONTENT = { top: 0.15, bottom: 0.19, left: 0.10, right: 0.10 };

  const contentW = cardW * (1 - CONTENT.left - CONTENT.right);
  const titleSize = clamp(contentW * 0.16, 22, 40);
  const rewardsTitleSize = clamp(contentW * 0.08, 14, 22);
  const rewardIcon = clamp(contentW * 0.12, 18, 28);
  const rewardFont = clamp(contentW * 0.09, 14, 20);
  const btnMaxW = clamp(contentW * 0.44, 140, 200);
  const gapSm = clamp(contentW * 0.03, 6, 12);
  const gapMd = clamp(contentW * 0.05, 8, 16);

  // Custom styling for defeat card
  const defeatTitleTop = cardH * 0.05; // Push title down to 25% of card height
  const defeatButtonTop = cardH * 0.45; // Push button up to 75% of card height
  const defeatSkullTop = cardH * 0.20; // Position skull at 45% of card height

  const onComplete = () => onCombatEnd?.(outcome as 'victory' | 'defeat', rewards);

  return (
    // FULLSCREEN OVERLAY - immediately takes control to prevent flicker
    <View style={styles.overlay}>
      <View style={styles.frameRoot}>
        <View style={[styles.cardBox, { width: cardW, height: cardH }]}>
          {/* Background image - same pattern as ActionCard */}
          <Image 
            source={isVictory ? VICTORY_BG : DEFEAT_BG} 
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
          {isVictory ? (
            <>
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.victoryTitle, { fontSize: titleSize, letterSpacing: Math.round(titleSize * 0.08) }]}>
                  VICTORY!
                </Text>
              </View>

              <View style={{ alignItems: 'center', marginTop: gapSm }}>
                <Image
                  source={require('@/assets/images/icons/cup_simple.png')}
                  style={{ width: rewardIcon * 3, height: rewardIcon * 3 }}
                  resizeMode="contain"
                />
              </View>

              <View style={{ alignItems: 'center', marginTop: gapMd }}>
                <Text style={[styles.rewardsTitle, { fontSize: rewardsTitleSize }]}>REWARDS</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', columnGap: gapSm, marginTop: gapSm, flexWrap: 'wrap' }}>
                  <View style={styles.rewardPill}>
                    <Image source={require('@/assets/images/icons/gold_icon.png')} style={{ width: rewardIcon, height: rewardIcon, marginRight: 6 }} />
                    <Text style={[styles.rewardText, { fontSize: rewardFont }]}>{rewards.gold}</Text>
                  </View>

                  <View style={styles.rewardPill}>
                    <Image source={require('@/assets/images/icons/exp_scroll.png')} style={{ width: rewardIcon, height: rewardIcon, marginRight: 6 }} />
                    <Text style={[styles.rewardText, { fontSize: rewardFont }]}>{rewards.xp}</Text>
                  </View>

                  <View style={styles.rewardPill}>
                    <View style={{
                      width: rewardIcon, height: rewardIcon, borderRadius: rewardIcon/2,
                      backgroundColor: 'rgba(255,215,0,0.22)', alignItems: 'center', justifyContent: 'center',
                      marginRight: 6, borderWidth: 1, borderColor: 'rgba(255,215,0,0.45)'
                    }}>
                      <Text style={[styles.rewardText, { fontSize: rewardFont * 0.8 }]}>?</Text>
                    </View>
                    <Text style={[styles.rewardText, { fontSize: rewardFont * 0.9 }]}>Item</Text>
                  </View>
                </View>
              </View>

              <View style={{ flex: 1 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', columnGap: gapSm }}>
                <View style={{ flex: 1, alignItems: 'center', maxWidth: btnMaxW }}>
                  <AppButton size="xs" onPress={onComplete} optionalLabel="+30% Rewards">WATCH AD</AppButton>
                </View>
                <View style={{ flex: 1, alignItems: 'center', maxWidth: btnMaxW }}>
                  <AppButton size="xs" onPress={onComplete}>COMPLETE</AppButton>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* DEFEAT! Title - positioned at 25% of card height */}
              <View style={{ 
                position: 'absolute', 
                top: defeatTitleTop, 
                left: 0, 
                right: 0, 
                alignItems: 'center' 
              }}>
                <Text style={[styles.defeatTitle, { fontSize: titleSize, letterSpacing: Math.round(titleSize * 0.08) }]}>
                  DEFEAT!
                </Text>
              </View>

              {/* Skull Icon - positioned at 45% of card height */}
              <View style={{ 
                position: 'absolute', 
                top: defeatSkullTop, 
                left: 0, 
                right: 0, 
                alignItems: 'center' 
              }}>
                <Image
                  source={require('@/assets/images/icons/cup_broken.png')}
                  style={{ width: rewardIcon * 3, height: rewardIcon * 3 }}
                  resizeMode="contain"
                />
              </View>

              {/* Complete Button - positioned at 75% of card height */}
              <View style={{ 
                position: 'absolute', 
                top: defeatButtonTop, 
                left: 0, 
                right: 0, 
                alignItems: 'center' 
              }}>
                <AppButton size="xs" onPress={onComplete}>Complete</AppButton>
              </View>
            </>
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
  victoryTitle: {
    fontFamily: 'Cinzel-Black',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
  },
  rewardsTitle: {
    fontFamily: 'Cinzel-Bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,215,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.35)',
  },
  rewardText: {
    fontFamily: 'Cinzel-Bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  defeatTitle: {
    fontFamily: 'Cinzel-Black',
    color: '#8B4513', // Dark red-grey color
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 3,
  },
});