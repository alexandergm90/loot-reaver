import { FrameQueueItem } from '@/types/combatV2';
import { useCallback, useEffect, useRef, useState } from 'react';

export type CombatState = 
  | 'idle'
  | 'matchIntro' 
  | 'roundStart'
  | 'actionIntro'
  | 'actionOutro'
  | 'matchEnd';

export interface CombatStateMachine {
  state: CombatState;
  currentRound: number;
  isFirstAction: boolean;
  isEndOfRound: boolean;
  transitionTo: (newState: CombatState) => void;
  skipOverlay: () => void;
  isOverlayVisible: boolean;
  updateFrameIndex: (index: number) => void;
}

export function useCombatState(
  frames: FrameQueueItem[],
  speed: number = 1
): CombatStateMachine {
  const [state, setState] = useState<CombatState>('idle');
  const [currentRound, setCurrentRound] = useState(1);
  const [isFirstAction, setIsFirstAction] = useState(true);
  const [isEndOfRound, setIsEndOfRound] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  
  const skipRequestedRef = useRef(false);
  const currentFrameIndexRef = useRef(0);
  const lastRoundRef = useRef(0);

  // Speed scaling helper
  const t = useCallback((ms: number) => ms / Math.max(0.25, speed), [speed]);

  // Determine if we're at the end of a round
  const checkEndOfRound = useCallback((frameIndex: number) => {
    if (frameIndex >= frames.length - 1) return true;
    
    const currentFrame = frames[frameIndex];
    const nextFrame = frames[frameIndex + 1];
    
    // Check if next frame is a round boundary or different round
    return nextFrame?.isRoundBoundary || 
           (nextFrame?.roundNumber && nextFrame.roundNumber !== currentFrame.roundNumber);
  }, [frames]);

  // Check if combat is ending (last action kills someone)
  const isCombatEnding = useCallback((frameIndex: number) => {
    const currentFrame = frames[frameIndex];
    return currentFrame?.type === 'end_battle';
  }, [frames]);

  // State transitions
  const transitionTo = useCallback((newState: CombatState) => {
    console.log(`Combat state: ${state} → ${newState}`);
    setState(newState);
    
    // Update overlay visibility - ONLY for match intro, not round transitions
    setIsOverlayVisible(newState === 'matchIntro');
    
    // Update action tracking
    if (newState === 'actionIntro') {
      setIsFirstAction(currentFrameIndexRef.current === 0);
    }
    
    // Check end of round
    const endOfRound = checkEndOfRound(currentFrameIndexRef.current);
    setIsEndOfRound(endOfRound);
  }, [state, frames, checkEndOfRound]);

  // Skip overlay functionality
  const skipOverlay = useCallback(() => {
    skipRequestedRef.current = true;
    
    if (state === 'matchIntro') {
      // Skip to first action
      transitionTo('actionIntro');
    } else if (state === 'roundStart') {
      // Skip to next action
      transitionTo('actionIntro');
    }
  }, [state, transitionTo]);

  // Update frame index and track current round
  const updateFrameIndex = useCallback((index: number) => {
    currentFrameIndexRef.current = index;
    
    // Update current round based on frame
    if (index < frames.length) {
      const frame = frames[index];
      if (frame && frame.roundNumber) {
        setCurrentRound(frame.roundNumber);
      }
    }
  }, [frames]);

  // Initialize combat flow
  useEffect(() => {
    if (frames.length > 0 && state === 'idle') {
      transitionTo('matchIntro');
    }
  }, [frames.length, state, transitionTo]);

  return {
    state,
    currentRound,
    isFirstAction,
    isEndOfRound,
    transitionTo,
    skipOverlay,
    isOverlayVisible,
    updateFrameIndex,
  };
}
