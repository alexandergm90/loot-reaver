import AppButton from '@/components/ui/AppButton';
import { CombatActionBarProps, CombatSpeed } from '@/types/combatV2';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function CombatActionBar({ 
  speed, 
  onSpeedChange, 
  onSkip 
}: Omit<CombatActionBarProps, 'isAuto' | 'onToggleAuto'>) {
  const isPaused = speed === 0;

  const handleSpeedChange = (newSpeed: CombatSpeed) => {
    Haptics.selectionAsync(); // Selection change haptic
    
    if (newSpeed === 0) {
      // Toggle between pause (0) and 1x speed
      if (speed === 0) {
        // Currently paused, resume at 1x
        onSpeedChange(1);
      } else {
        // Currently playing, pause
        onSpeedChange(0);
      }
    } else {
      // Direct speed selection (1x or 2x)
      onSpeedChange(newSpeed);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Speed Controls - Using AppButton with rounded variant */}
      <View style={styles.speedControls}>
        {([0, 1, 2] as CombatSpeed[]).map((speedOption) => (
          <AppButton
            key={speedOption}
            variant="rounded"
            size="square"
            onPress={() => handleSpeedChange(speedOption)}
            enableHaptics={true}
            isActive={speed === speedOption}
          >
            {speedOption === 0 ? (isPaused ? '▶' : '⏸') : `${speedOption}×`}
          </AppButton>
        ))}
      </View>
      
      {/* SKIP button - using AppButton with xs size */}
      <AppButton 
        size="xs"
        onPress={onSkip}
        enableHaptics={true}
        style={isPaused ? styles.skipButtonPaused : undefined}
        textStyle={isPaused ? styles.skipButtonTextPaused : undefined}
      >
        SKIP
      </AppButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  speedControls: {
    flexDirection: 'row',
    gap: 8,
  },
  skipButtonPaused: {
    opacity: 0.6, // Dimmed when paused
  },
  skipButtonTextPaused: {
    color: 'rgba(0, 0, 0, 0.7)', // Dimmed text when paused
  },
});
