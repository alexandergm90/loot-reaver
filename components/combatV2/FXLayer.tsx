import { FrameQueueItem } from '@/types/combatV2';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface FXLayerProps {
  frame: FrameQueueItem | null;
  actors: Map<string, any>;
}

export function FXLayer({ frame, actors }: FXLayerProps) {
  // No animations - just return empty view for now
  // This component can be used later for static effects if needed
  return <View style={StyleSheet.absoluteFill} pointerEvents="none" />;
}
