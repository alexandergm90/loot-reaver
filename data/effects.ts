import { Effect } from '@/types/combatV2';

// Mix of real icons and placeholders
const EFFECT_ICONS = {
  strength: 'S', // placeholder
  shield: '🛡', // placeholder
  regeneration: 'R', // placeholder
  bleed: require('@/assets/images/combat/debuffs/bleed.png'), // real icon
  poison: 'P', // placeholder
  weakness: 'W', // placeholder
};

// Sample effect definitions with real and placeholder icons
export const EFFECT_DEFINITIONS: Record<string, Omit<Effect, 'stacks' | 'duration'>> = {
  // Buffs
  strength: {
    id: 'strength',
    type: 'buff',
    name: 'Strength',
    icon: EFFECT_ICONS.strength,
  },
  shield: {
    id: 'shield',
    type: 'buff',
    name: 'Shield',
    icon: EFFECT_ICONS.shield,
  },
  regeneration: {
    id: 'regeneration',
    type: 'buff',
    name: 'Regeneration',
    icon: EFFECT_ICONS.regeneration,
  },
  
  // Debuffs
  bleed: {
    id: 'bleed',
    type: 'debuff',
    name: 'Bleed',
    icon: EFFECT_ICONS.bleed,
  },
  poison: {
    id: 'poison',
    type: 'debuff',
    name: 'Poison',
    icon: EFFECT_ICONS.poison,
  },
  weakness: {
    id: 'weakness',
    type: 'debuff',
    name: 'Weakness',
    icon: EFFECT_ICONS.weakness,
  },
};

// Helper function to create an effect with stacks and duration
export function createEffect(
  effectId: string, 
  stacks: number = 1, 
  duration: number = 3
): Effect | null {
  const definition = EFFECT_DEFINITIONS[effectId];
  if (!definition) return null;
  
  return {
    ...definition,
    stacks,
    duration,
  };
}

// Helper function to update effects array when applying new effects
export function applyEffectToActor(
  currentEffects: Effect[],
  newEffect: Effect
): Effect[] {
  const existingIndex = currentEffects.findIndex(e => e.id === newEffect.id);
  
  if (existingIndex >= 0) {
    // Update existing effect
    const updated = [...currentEffects];
    updated[existingIndex] = {
      ...updated[existingIndex],
      stacks: Math.min(updated[existingIndex].stacks + newEffect.stacks, 10), // Cap at 10 stacks
      duration: Math.max(updated[existingIndex].duration, newEffect.duration), // Use longer duration
    };
    return updated;
  } else {
    // Add new effect
    return [...currentEffects, newEffect];
  }
}

// Helper function to tick effects (reduce duration)
export function tickEffects(effects: Effect[]): Effect[] {
  return effects
    .map(effect => ({
      ...effect,
      duration: Math.max(0, effect.duration - 1),
    }))
    .filter(effect => effect.duration > 0); // Remove expired effects
}
