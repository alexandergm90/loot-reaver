import { CombatActionBarProps, CombatSpeed } from '@/types/combatV2';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function CombatActionBar({ 
  speed, 
  onSpeedChange, 
  onSkip 
}: Omit<CombatActionBarProps, 'isAuto' | 'onToggleAuto'>) {
  return (
    <View style={styles.container}>
      {/* Speed Controls - Pill Buttons */}
      <View style={styles.speedControls}>
        {([1, 2, 3] as CombatSpeed[]).map((speedOption) => (
          <TouchableOpacity
            key={speedOption}
            style={[
              styles.pillButton,
              speed === speedOption && styles.pillButtonActive
            ]}
            onPress={() => onSpeedChange(speedOption)}
          >
            <Text style={[
              styles.pillButtonText,
              speed === speedOption && styles.pillButtonTextActive
            ]}>
              {speedOption}×
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* High-contrast SKIP button */}
      <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
        <Text style={styles.skipButtonText}>SKIP</Text>
      </TouchableOpacity>
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
  pillButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(139, 69, 19, 0.3)',
    borderRadius: 20, // Pill shape
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillButtonActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  pillButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  pillButtonTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFA500',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
