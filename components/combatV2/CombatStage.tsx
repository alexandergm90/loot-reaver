import { CombatStageProps } from '@/types/combatV2';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
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
      {/* Action Card Stack - no cropping container */}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
