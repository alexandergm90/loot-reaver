import { Effect } from '@/types/combatV2';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EffectIcon } from './EffectIcon';

interface EffectContainerProps {
  effects: Effect[];
  maxVisible?: number;
  onEffectRemove?: (effectId: string) => void;
}

export function EffectContainer({ 
  effects, 
  maxVisible = 2, 
  onEffectRemove 
}: EffectContainerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Show maxVisible effects, with overflow indicator
  const visibleEffects = isExpanded ? effects : effects.slice(0, maxVisible);
  const hasOverflow = effects.length > maxVisible;
  const overflowCount = hasOverflow ? effects.length - maxVisible : 0;

  const handleEffectRemove = (effectId: string) => {
    onEffectRemove?.(effectId);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      {visibleEffects.map((effect, index) => (
        <EffectIcon
          key={`${effect.id}-${effect.stacks}-${effect.duration}`}
          effect={effect}
          size={28}
          onRemove={() => handleEffectRemove(effect.id)}
        />
      ))}
      
      {/* Overflow indicator or expand/collapse button */}
      {hasOverflow && (
        <TouchableOpacity 
          style={styles.overflowContainer}
          onPress={toggleExpanded}
        >
          <Text style={styles.overflowText}>
            {isExpanded ? '−' : `+${overflowCount}`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
    paddingVertical: 8,
  },
  overflowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  overflowText: {
    fontFamily: 'Cinzel-Bold',
    fontWeight: '700',
    fontSize: 10,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
