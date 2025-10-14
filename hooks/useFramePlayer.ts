import { CombatPlayerState, CombatSpeed, FrameQueueItem } from '@/types/combatV2';
import { useCallback, useEffect, useState } from 'react';

interface UseFramePlayerProps {
  queue: FrameQueueItem[];
  onComplete: () => void;
}

interface UseFramePlayerReturn {
  state: CombatPlayerState;
  currentFrameIndex: number;
  currentFrame: FrameQueueItem | null;
  speed: CombatSpeed;
  progress: number; // 0-1
  
  // Controls
  setSpeed: (speed: CombatSpeed) => void;
  nextFrame: () => void;
  skipToEnd: () => void;
  reset: () => void;
}

export function useFramePlayer({ queue, onComplete }: UseFramePlayerProps): UseFramePlayerReturn {
  const [state, setState] = useState<CombatPlayerState>('idle');
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [speed, setSpeed] = useState<CombatSpeed>(1);
  
  const currentFrame = queue[currentFrameIndex] || null;
  const progress = queue.length > 0 ? currentFrameIndex / queue.length : 0;
  
  // Update state to 'ended' when we reach the end_battle frame
  useEffect(() => {
    if (currentFrame?.type === 'end_battle') {
      setState('ended');
    }
  }, [currentFrame]);
  
  const nextFrame = useCallback(() => {
    if (currentFrameIndex >= queue.length - 1) {
      // End of queue
      setState('ended');
      onComplete();
      return;
    }
    
    setCurrentFrameIndex(prev => prev + 1);
  }, [currentFrameIndex, queue.length, onComplete]);
  
  const skipToEnd = useCallback(() => {
    // Jump to the last frame (end_battle) without calling onComplete
    // The end_battle frame will handle the completion when it's done
    setCurrentFrameIndex(queue.length - 1);
    setState('ended');
  }, [queue.length]);
  
  const reset = useCallback(() => {
    setState('idle');
    setCurrentFrameIndex(0);
    setSpeed(1);
  }, []);
  
  // Start playing when queue is ready
  useEffect(() => {
    if (queue.length > 0 && state === 'idle') {
      setState('loading');
      // Small delay to allow UI to render
      setTimeout(() => {
        setState('playing');
      }, 100);
    }
  }, [queue.length, state]);
  
  // Set state to 'ended' when we reach an end_battle frame
  useEffect(() => {
    if (currentFrame?.type === 'end_battle') {
      setState('ended');
    }
  }, [currentFrame]);
  
  return {
    state,
    currentFrameIndex,
    currentFrame,
    speed,
    progress,
    setSpeed,
    nextFrame,
    skipToEnd,
    reset,
  };
}
