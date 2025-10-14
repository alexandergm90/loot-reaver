import { CombatActor, CombatHUDProps } from '@/types/combatV2';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export function CombatHUD({ actors, playerId, enemyIds, currentHealth }: CombatHUDProps) {
  const player = actors.get(playerId);
  const enemies = enemyIds.map(id => actors.get(id)).filter(Boolean) as CombatActor[];
  
  if (!player || enemies.length === 0) {
    return null;
  }
  
  const enemy = enemies[0]; // For now, show first enemy
  
  // Force re-render when health changes
  const healthObject = currentHealth;
  
  // Get current health from the health tracking object
  const playerCurrentHp = currentHealth[playerId] ?? player.startHp;
  const enemyCurrentHp = currentHealth[enemy.id] ?? enemy.startHp;
  
  return (
    <View style={styles.container}>
      {/* Player HUD (Left) */}
      <View style={styles.playerGroup}>
        {/* Portrait Frame */}
        <View style={styles.portraitFrame}>
          <View style={styles.portraitOverflow}>
            <Text style={styles.portraitText}>👤</Text>
          </View>
        </View>
        
        {/* Name Banner */}
        <View style={styles.nameBanner}>
          <Text style={styles.nameText}>{player.name}</Text>
        </View>
        
        {/* HP Bar */}
        <View style={styles.hpBarContainer}>
          <View style={styles.hpBar}>
            <View 
              style={[
                styles.hpFill, 
                { width: `${(playerCurrentHp / player.maxHp) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.hpText}>{playerCurrentHp}/{player.maxHp}</Text>
        </View>
        
        {/* Status Row */}
        {player.statuses.length > 0 && (
          <View style={styles.statusRow}>
            {player.statuses.slice(0, 4).map((status, index) => (
              <View key={index} style={styles.statusChip}>
                <Text style={styles.statusChipText}>
                  {status.id.charAt(0).toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
      
      {/* Enemy HUD (Right) */}
      <View style={styles.enemyGroup}>
        {/* Portrait Frame */}
        <View style={styles.portraitFrame}>
          <View style={styles.portraitOverflow}>
            <Text style={styles.portraitText}>👹</Text>
          </View>
        </View>
        
        {/* Name Banner */}
        <View style={styles.nameBanner}>
          <Text style={styles.nameText}>{enemy.name}</Text>
        </View>
        
        {/* HP Bar */}
        <View style={styles.hpBarContainer}>
          <View style={styles.hpBar}>
            <View 
              style={[
                styles.hpFill, 
                { width: `${(enemyCurrentHp / enemy.maxHp) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.hpText}>{enemyCurrentHp}/{enemy.maxHp}</Text>
        </View>
        
        {/* Status Row */}
        {enemy.statuses.length > 0 && (
          <View style={styles.statusRow}>
            {enemy.statuses.slice(0, 4).map((status, index) => (
              <View key={index} style={styles.statusChip}>
                <Text style={styles.statusChipText}>
                  {status.id.charAt(0).toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  playerGroup: {
    alignItems: 'flex-start',
    maxWidth: screenWidth * 0.4,
  },
  enemyGroup: {
    alignItems: 'flex-end',
    maxWidth: screenWidth * 0.4,
  },
  portraitFrame: {
    width: 78, // 72-84dp range
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(139, 69, 19, 0.9)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  portraitOverflow: {
    width: '100%',
    height: '125%', // Bobble-head overflow by ~25%
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  portraitText: {
    fontSize: 32,
  },
  nameBanner: {
    backgroundColor: 'rgba(139, 69, 19, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 6, // Portrait → Banner: 6dp
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  nameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  hpBarContainer: {
    marginTop: 6, // Banner → HP bar: 6dp
    alignItems: 'center',
  },
  hpBar: {
    width: 60,
    height: 6, // Thin, readable
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hpFill: {
    height: '100%',
    backgroundColor: '#27AE60',
    borderRadius: 2,
  },
  hpText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: 8, // HP bar → Status row: 8dp
    maxWidth: 60,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statusChip: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 0, 0.8)',
    marginHorizontal: 2,
    marginVertical: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusChipText: {
    fontSize: 8,
    color: '#000',
    fontWeight: 'bold',
  },
});
