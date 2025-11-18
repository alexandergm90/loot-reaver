import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical';

const RARITY_GLOW: Record<Rarity, any> = {
    common: require('@/assets/images/equipment/rarities_bg/common.png'),
    uncommon: require('@/assets/images/equipment/rarities_bg/uncommon.png'),
    rare: require('@/assets/images/equipment/rarities_bg/rare.png'),
    epic: require('@/assets/images/equipment/rarities_bg/epic.png'),
    legendary: require('@/assets/images/equipment/rarities_bg/legendary.png'),
    mythical: require('@/assets/images/equipment/rarities_bg/mythical.png'),
};

interface RarityGradientBackgroundProps {
    rarity: Rarity | string | undefined;
    style?: any;
    children?: React.ReactNode;
}

/**
 * Displays rarity background glow image behind item icons
 */
export const RarityGradientBackground: React.FC<RarityGradientBackgroundProps> = ({
    rarity,
    style,
    children,
}) => {
    // Default to common if rarity is not recognized
    const normalizedRarity = (rarity?.toLowerCase() as Rarity) || 'common';
    
    // Debug: Log rarity values to help diagnose cache/mapping issues
    if (__DEV__) {
        console.log('[RarityGradientBackground]', {
            originalRarity: rarity,
            normalizedRarity,
            availableRarities: Object.keys(RARITY_GLOW),
        });
    }
    
    const glowImage = RARITY_GLOW[normalizedRarity] || RARITY_GLOW.common;

    return (
        <View style={[styles.container, style]}>
            {/* Rarity glow background */}
            <Image
                key={`rarity-${normalizedRarity}`} // Force remount when rarity changes
                source={glowImage}
                style={styles.glowImage}
                resizeMode="stretch"
            />
            {/* Content on top */}
            <View style={styles.content} pointerEvents="box-none">
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        overflow: 'hidden',
    },
    glowImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
    },
    content: {
        position: 'relative',
        width: '100%',
        height: '100%',
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default RarityGradientBackground;


