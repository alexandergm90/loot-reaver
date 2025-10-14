import { FrameCardProps } from '@/types/combatV2';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export function ActionCard({ frame, actors, onComplete, speed }: FrameCardProps) {
  const actor = actors.get(frame.actorId);
  const results = frame.results || [];
  
  // Calculate timing based on speed (1x=3s, 2x=1.5s, 3x=1s)
  const getTotalDuration = () => {
    switch (speed) {
      case 1: return 3000; // 3 seconds
      case 2: return 1500; // 1.5 seconds  
      case 3: return 1000; // 1 second
      default: return 3000;
    }
  };
  
  useEffect(() => {
    // Simple timer - no animations
    const timer = setTimeout(() => {
      onComplete();
    }, getTotalDuration());
    
    return () => clearTimeout(timer);
  }, [speed, onComplete]);
  
  if (!actor) {
    return null;
  }
  
  // Get the first result for display (most actions have one target)
  const firstResult = results[0];
  if (!firstResult) {
    return null;
  }
  
  const target = actors.get(firstResult.targetId);
  const isCrit = firstResult.crit;
  const isKill = firstResult.kill;
  
  // Determine result tone and styling
  const resultTone = isCrit ? 'crit' : isKill ? 'kill' : 'dmg';
  const resultText = `${firstResult.amount} damage`;
  
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header with action icon */}
        <View style={styles.header}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>⚔️</Text>
          </View>
          <Text style={styles.headerText}>
            {actor.name} attacks {target?.name || 'Unknown'}
          </Text>
        </View>
        
        {/* Scene pane with result */}
        <View style={styles.scenePane}>
          {/* Result number */}
          <View>
            <Text style={[
              styles.resultText,
              resultTone === 'crit' && styles.resultCrit,
              resultTone === 'kill' && styles.resultKill,
            ]}>
              {resultText}
            </Text>
            
            {/* Critical badge */}
            {isCrit && (
              <View style={styles.critBadge}>
                <Text style={styles.critBadgeText}>CRITICAL!</Text>
              </View>
            )}
          </View>
          
          {/* HP change line */}
          <Text style={styles.hpLine}>
            {target?.name}: {firstResult.hpBefore} → {firstResult.hpAfter} HP
          </Text>
          
          {/* Status effects */}
          {firstResult.statusApplied && firstResult.statusApplied.length > 0 && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                Status applied: {firstResult.statusApplied.map(s => s.id).join(', ')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A120D', // Darkened panel background
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: 'rgba(139, 69, 19, 0.95)', // Parchment color
    borderRadius: 20, // 16-20px corner radius
    borderWidth: 3,
    borderColor: '#000000', // Thin black outline + bevel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    width: Math.min(screenWidth * 0.92, 360), // ~90% screen width, max 360dp
    minHeight: 96, // Min 84-96dp
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16, // 16 top
    paddingHorizontal: 20,
    paddingBottom: 12, // 12 between lines
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionIcon: {
    marginRight: 12,
  },
  actionIconText: {
    fontSize: 20,
  },
  headerText: {
    fontSize: 18, // 18-20sp semibold
    fontWeight: '600', // Semibold
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  scenePane: {
    paddingHorizontal: 20,
    paddingBottom: 16, // 16 bottom
    alignItems: 'center',
    position: 'relative',
  },
  resultText: {
    fontSize: 28, // 28-32sp heavy
    fontWeight: '800', // Heavy
    color: '#C0392B', // Damage color
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  resultCrit: {
    color: '#FFD700', // Gold for crits
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  resultKill: {
    color: '#E74C3C', // Red for kills
    fontSize: 32,
  },
  critBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  critBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  hpLine: {
    fontSize: 12, // 12-13sp, 70% opacity
    color: 'rgba(255, 255, 255, 0.7)', // 70% opacity
    textAlign: 'center',
    marginTop: 8,
  },
  statusContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 0, 0.2)',
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFF00',
    textAlign: 'center',
  },
});
