import { EndBattleFrame, FrameCardProps } from '@/types/combatV2';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function EndBattleCard({ frame, actors, onComplete, speed, onCombatEnd }: FrameCardProps) {
  console.log('🏆 EndBattleCard rendering:', frame.payload);
  
  // Calculate timing based on speed setting
  const getTiming = (speed: number) => {
    const baseTime = 3000; // Base 3 seconds
    return baseTime / speed; // Speed 1 = 3s, Speed 2 = 1.5s, Speed 3 = 1s
  };
  
  const handleOKPress = () => {
    if (onCombatEnd) {
      const battleFrame = frame.payload as EndBattleFrame;
      const outcome = battleFrame.outcome || 'victory';
      const rewards = battleFrame.rewards || { gold: 0, xp: 0 };
      onCombatEnd(outcome as 'victory' | 'defeat', rewards);
    }
  };
  
  useEffect(() => {
    console.log('🏆 EndBattleCard useEffect triggered');
    
    // No auto-redirect - user must click OK button
    // Removed fallback timer to prevent automatic redirect
  }, [speed]);
  
  const battleFrame = frame.payload as EndBattleFrame;
  const outcome = battleFrame.outcome || 'victory';
  const rewards = battleFrame.rewards || { gold: 0, xp: 0 };
  const isVictory = outcome === 'victory';
  
  // Fallback to ensure we always show something
  if (!frame.payload) {
    console.error('EndBattleCard: No payload data!', frame);
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.outcome}>COMBAT ENDED</Text>
          <TouchableOpacity style={styles.okButton} onPress={handleOKPress}>
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={[styles.content, { borderColor: isVictory ? '#00ff00' : '#ff4444' }]}>
        <Text style={styles.outcome}>
          {isVictory ? '🏆 VICTORY!' : '💀 DEFEAT'}
        </Text>
        
        {rewards && (
          <View style={styles.rewards}>
            <Text style={styles.rewardText}>
              Gold: {rewards.gold} • XP: {rewards.xp}
            </Text>
          </View>
        )}
        
        {/* OK Button - User controls when to leave combat */}
        <TouchableOpacity style={styles.okButton} onPress={handleOKPress}>
          <Text style={styles.okButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Add background to make it more visible
    zIndex: 999, // Ensure it's on top
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
    backgroundColor: 'rgba(139, 69, 19, 0.95)', // Parchment background
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#FFD700', // Gold border
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  outcome: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700', // Gold color
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 16,
  },
  rewards: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  rewardText: {
    fontSize: 16,
    color: '#ffd700',
    fontWeight: '600',
  },
  okButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#45a049',
  },
  okButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
