import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PlaceholderIconProps {
  name: string;
  type: 'buff' | 'debuff';
  size?: number;
}

export function PlaceholderIcon({ name, type, size = 28 }: PlaceholderIconProps) {
  const backgroundColor = type === 'buff' ? '#4CAF50' : '#F44336';
  const textColor = '#FFFFFF';
  
  return (
    <View style={[
      styles.container, 
      { 
        width: size, 
        height: size, 
        backgroundColor,
        borderRadius: size / 2,
      }
    ]}>
      <Text style={[
        styles.text, 
        { 
          fontSize: size * 0.3,
          color: textColor,
        }
      ]}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  text: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
