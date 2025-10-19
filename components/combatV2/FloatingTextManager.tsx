import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FloatingText, FloatingTextItem } from './FloatingText';

// Re-export FloatingTextItem for external use
export { FloatingTextItem } from './FloatingText';

interface FloatingTextManagerProps {
  containerHeight: number;
  containerWidth: number;
  speed?: number;
}

export interface FloatingTextManagerRef {
  addFloatingText: (item: Omit<FloatingTextItem, 'id'>) => void;
}

export const FloatingTextManager = forwardRef<FloatingTextManagerRef, FloatingTextManagerProps>(({ 
  containerHeight, 
  containerWidth, 
  speed = 1 
}, ref) => {
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextItem[]>([]);
  const [textCounters, setTextCounters] = useState({ center: 0, left: 0, right: 0 });

  const addFloatingText = useCallback((item: Omit<FloatingTextItem, 'id'>) => {
    const id = `floating_${Date.now()}_${Math.random()}`;
    const position = item.position || 'center';
    
    // Calculate delay based on position and existing texts
    const delay = textCounters[position] * 200; // 200ms stagger per position
    
    const newItem: FloatingTextItem = { 
      ...item, 
      id, 
      position,
      delay 
    };
    
    setFloatingTexts(prev => [...prev, newItem]);
    setTextCounters(prev => ({ ...prev, [position]: prev[position] + 1 }));
  }, [textCounters]);

  const removeFloatingText = useCallback((id: string) => {
    setFloatingTexts(prev => prev.filter(item => item.id !== id));
  }, []);

  // Expose the add function for external use
  useImperativeHandle(ref, () => ({
    addFloatingText,
  }));

  return (
    <View style={[styles.container, { height: containerHeight, width: containerWidth }]}>
      {floatingTexts.map((item) => (
        <FloatingText
          key={item.id}
          item={item}
          onComplete={() => removeFloatingText(item.id)}
          speed={speed}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    pointerEvents: 'none',
  },
});
