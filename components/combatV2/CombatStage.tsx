import { CombatStageProps } from '@/types/combatV2';
import React from 'react';
import { Dimensions, ImageBackground, StyleSheet, View } from 'react-native';
import { FrameSwitcher } from './FrameSwitcher';
import { FXLayer } from './FXLayer';

const { width: screenWidth } = Dimensions.get('window');

// Fixed aspect ratio for the combat stage
const STAGE_ASPECT_RATIO = 5 / 3; // 5:3 ratio
const STAGE_MAX_WIDTH = screenWidth * 0.9; // 90% of screen width
const STAGE_WIDTH = Math.min(STAGE_MAX_WIDTH, screenWidth - 32); // Min 16px margin
const STAGE_HEIGHT = STAGE_WIDTH / STAGE_ASPECT_RATIO;

export function CombatStage({ currentFrame, actors, onFrameComplete, speed, onCombatEnd }: CombatStageProps) {
  return (
    <View style={styles.container}>
      {/* Main stage area with fixed aspect ratio */}
      <View style={styles.stage}>
        {/* Parallax dungeon backdrop at z0 */}
        <ImageBackground
          source={require('@/assets/images/dungeons/layouts/undead_crypt.png')}
          style={styles.backdrop}
          resizeMode="cover"
        />
        
        {/* Action Card Stack at z1 (center) */}
        <View style={styles.cardStack}>
          <FrameSwitcher 
            frame={currentFrame}
            actors={actors}
            onComplete={onFrameComplete}
            speed={speed}
            onCombatEnd={onCombatEnd}
          />
        </View>
        
        {/* FX layer - handles screen effects */}
        <FXLayer frame={currentFrame} actors={actors} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  stage: {
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8b4513', // Saddle brown border
    overflow: 'hidden',
    position: 'relative',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  cardStack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
