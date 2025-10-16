import { FrameCardProps } from '@/types/combatV2';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function StatusCard({ frame, actors, onComplete, speed }: FrameCardProps) {
  // Calculate timing based on speed setting
  const getTiming = (speed: number) => {
    const baseTime = 3000; // Base 3 seconds
    return baseTime / speed; // Speed 1 = 3s, Speed 2 = 1.5s, Speed 3 = 1s
  };
  
  useEffect(() => {
    // Simple timer - no animations
    const timer = setTimeout(() => {
      onComplete();
    }, getTiming(speed));
    
    return () => clearTimeout(timer);
  }, [speed]);
  
  const status = frame.payload.status;
  const statusName = status?.id || 'Unknown';
  const stacks = status?.stacks || 1;
  const duration = status?.duration || 0;
  
  let statusText = '';
  let statusColor = '#ffd700';
  
  switch (frame.type) {
    case 'status_apply':
      statusText = `${statusName} applied!`;
      statusColor = '#00ff00';
      break;
    case 'status_remove':
      statusText = `${statusName} removed!`;
      statusColor = '#ff4444';
      break;
    case 'status_tick':
      statusText = `${statusName} tick`;
      statusColor = '#ff8800';
      break;
    case 'status_update':
      statusText = `${statusName} updated`;
      statusColor = '#4488ff';
      break;
    case 'status_cleanup':
      statusText = `${statusName} cleaned up`;
      statusColor = '#888888';
      break;
  }
  
  return (
    <View style={styles.container}>
      <View style={[styles.content, { borderColor: statusColor }]}>
        <Text style={[styles.title, { color: statusColor }]}>
          {statusText}
        </Text>
        
        {stacks > 1 && (
          <Text style={styles.stacks}>
            Stacks: {stacks}
          </Text>
        )}
        
        {duration > 0 && (
          <Text style={styles.duration}>
            Duration: {duration}T
          </Text>
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
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stacks: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  duration: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 2,
  },
});
