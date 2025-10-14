import { FrameCardProps } from '@/types/combatV2';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function EndRoundCard({ frame, actors, onComplete, speed }: FrameCardProps) {
  // Calculate timing based on speed setting - Round end should be visible longer
  const getTiming = (speed: number) => {
    switch (speed) {
      case 1: return 2000; // 2 seconds - readable
      case 2: return 1500; // 1.5 seconds
      case 3: return 1000; // 1 second
      default: return 2000;
    }
  };
  
  useEffect(() => {
    // Simple timer - no animations
    const timer = setTimeout(() => {
      onComplete();
    }, getTiming(speed));
    
    return () => clearTimeout(timer);
  }, [speed]);
  
  const roundNumber = frame.payload.roundNumber || 1;
  const statusTicks = frame.statusTicks || [];
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Round {roundNumber}</Text>
        <Text style={styles.subtitle}>Complete</Text>
        
        {/* Show status tick effects if any */}
        {statusTicks.length > 0 && (
          <View style={styles.statusContainer}>
            {statusTicks.map((tick, index) => {
              const actor = actors.get(tick.targetId);
              return (
                <Text key={index} style={styles.statusText}>
                  {actor?.name}: {tick.status} deals {tick.amount} damage
                  {tick.expired && ' (expired)'}
                  {tick.lethal && ' (lethal)'}
                </Text>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8b4513',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffd700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 2,
  },
  statusContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#ffaa00',
    textAlign: 'center',
    marginBottom: 2,
  },
});
