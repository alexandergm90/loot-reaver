import CharacterFullPreview from '@/components/character/CharacterFullPreview';
import EnemyPreview from '@/components/enemy/EnemyPreview';
import { useEquippedFromCharacter } from '@/hooks/useEquippedFromCharacter';
import { usePlayerStore } from '@/store/playerStore';
import { CombatEntity as CombatEntityType } from '@/types/combat';
import { createEnemyInstance } from '@/utils/enemyUtils';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import HealthBar from './HealthBar';

interface CombatEntityProps {
  entity: CombatEntityType;
  containerWidth?: number;
  containerHeight?: number;
  showHealthBar?: boolean;
  isAnimating?: boolean;
  isAttacking?: boolean;
  isTakingDamage?: boolean;
}

export default function CombatEntity({ 
  entity, 
  containerWidth = 120, 
  containerHeight = 120,
  showHealthBar = true,
  isAnimating = false,
  isAttacking = false,
  isTakingDamage = false
}: CombatEntityProps) {
  const { player } = usePlayerStore();
  const appearance = player?.character?.appearance || null;
  const { equipmentCodes } = useEquippedFromCharacter(player?.character);
  
  // Debug: Log character data
  React.useEffect(() => {
    if (entity.isPlayer) {
      console.log('Player character data:', {
        hasPlayer: !!player,
        hasCharacter: !!player?.character,
        hasAppearance: !!appearance,
        appearance: appearance
      });
    }
  }, [entity.isPlayer, player, appearance]);
  const attackAnim = useRef(new Animated.Value(0)).current;
  const damageAnim = useRef(new Animated.Value(0)).current;

  // Attack animation
  useEffect(() => {
    if (isAttacking) {
      Animated.sequence([
        Animated.timing(attackAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(attackAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isAttacking]);

  // Damage animation
  useEffect(() => {
    if (isTakingDamage) {
      Animated.sequence([
        Animated.timing(damageAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(damageAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isTakingDamage]);

  const attackStyle = {
    transform: [
      {
        scale: attackAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2],
        }),
      },
      {
        translateX: attackAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, entity.isPlayer ? 20 : -20],
        }),
      },
    ],
  };

  const damageStyle = {
    transform: [
      {
        scale: damageAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.9],
        }),
      },
    ],
    opacity: damageAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.7],
    }),
  };

  const renderEntity = () => {
    if (entity.isPlayer) {
      // Debug: Check if we have appearance data
      if (!appearance) {
        return (
          <View style={{ 
            width: containerWidth, 
            height: containerHeight, 
            backgroundColor: 'rgba(255, 0, 0, 0.3)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text className="text-white text-xs">No Character Data</Text>
          </View>
        );
      }
      
      return (
        <View style={{ 
          width: containerWidth, 
          height: containerHeight, 
          position: 'relative',
          backgroundColor: 'transparent'
        }}>
                   <CharacterFullPreview
                     appearance={appearance}
                     equipment={equipmentCodes}
                     containerHeight={containerHeight}
                   />
        </View>
      );
    } else {
      // Create enemy instance from entity data
      const enemyInstance = createEnemyInstance({
        id: entity.id,
        name: entity.name,
        code: entity.code || 'unknown',
        baseHp: entity.maxHp,
        baseAtk: entity.damage,
        scaledHp: entity.maxHp,
        scaledAtk: entity.damage,
        scaledDef: 0, // We don't have defense in combat data
      });

      if (!enemyInstance) {
        return (
          <View className="w-full h-full bg-gray-300 rounded-lg items-center justify-center">
            <Text className="text-xs text-gray-600">Unknown Enemy</Text>
          </View>
        );
      }

      return (
        <EnemyPreview
          enemy={enemyInstance}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
          showAnimation={!isAnimating}
        />
      );
    }
  };

  return (
    <View className="items-center" style={{ position: 'relative' }}>
      {/* Health Bar - Positioned above character with higher z-index */}
      {showHealthBar && (
        <View 
          className="mb-3" 
          style={{ 
            zIndex: 100, 
            position: 'relative',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            elevation: 10, // For Android
            shadowColor: '#000', // For iOS
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
          }}
        >
          <HealthBar
            currentHp={entity.currentHp}
            maxHp={entity.maxHp}
            width={containerWidth * 0.5}
            height={6}
            isPlayer={entity.isPlayer}
          />
        </View>
      )}
      
      {/* Entity Name */}
      <Text 
        className="text-sm font-bold text-white mb-2 text-center"
        style={{ 
          textShadowColor: 'rgba(0, 0, 0, 0.8)', 
          textShadowOffset: { width: 1, height: 1 }, 
          textShadowRadius: 2,
          zIndex: 100,
          position: 'relative',
          elevation: 10, // For Android
        }}
      >
        {entity.name}
      </Text>
      
      {/* Entity Visual */}
      <Animated.View 
        className="items-center justify-center"
        style={[
          { 
            width: containerWidth, 
            height: containerHeight,
            zIndex: 1,
            position: 'relative'
          },
          attackStyle,
          damageStyle,
        ]}
      >
        {renderEntity()}
      </Animated.View>
    </View>
  );
}
