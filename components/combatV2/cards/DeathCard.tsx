import { DeathFrame, FrameCardProps } from '@/types/combatV2';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.deathIcon}>💀</Text>
        <Text style={styles.title}>DEATH</Text>
        
        {targets.length > 0 && (
          <View style={styles.targetsContainer}>
            {targets.map((target, index) => (
              <Text key={index} style={styles.targetText}>
                {target?.name || 'Unknown'} has died
              </Text>
            ))}
          </View>
        )}
        
        {cause && (
          <Text style={styles.causeText}>
            Cause: {cause}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
    backgroundColor: 'rgba(139, 69, 19, 0.95)',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#8B0000', // Dark red border
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  deathIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B0000',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 12,
  },
  targetsContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  targetText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  causeText: {
    fontSize: 14,
    color: '#ffcccb',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});