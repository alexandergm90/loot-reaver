import { characterAssets } from '@/data/characterAssets';
import { CharacterAppearance } from '@/types/player';
import { getAssetStyle } from '@/utils/getAssetStyle';
import { getItemAsset, getItemPosition } from '@/utils/getItemAsset';
import { getWeaponRenderInstructions } from '@/utils/weaponRenderHelper';
import React from 'react';
import { Image } from 'react-native';

export type EquippedMap = Partial<{
    helmet: string; chest: string; cape: string;
    glove_left: string; glove_right: string;
    feet_left: string; feet_right: string;
    weapon_left: string; weapon_right: string; weapon_twohanded: string; shield: string;
    ring_left: string; ring_right: string;
    legs: string;
}>;

export const buildHeadLayers = (appearance: CharacterAppearance | null | undefined, equipment: EquippedMap | null | undefined) => {
    if (!appearance) return null;
    const gender = appearance.gender;
    const hairKey = `${appearance.hair}_${appearance.hairColor}`;
    const hasHelmet = !!equipment?.helmet;
    const orderedAssets: (any | null)[] = [
        characterAssets[gender].head[appearance.skinTone],
        characterAssets[gender].eyes[appearance.eyes],
        (gender === 'male' && appearance.beard?.includes('full')) ? null : characterAssets[gender].mouth[appearance.mouth],
        appearance.markings ? characterAssets[gender].markings[appearance.markings] : null,
        (gender === 'male' && appearance.beard) ? characterAssets[gender].beards[appearance.beard] : null,
        // Hide hair when helmet is equipped
        hasHelmet ? null : characterAssets[gender].hair[hairKey],
    ];
    return orderedAssets.filter(Boolean).map((asset: any, idx: number) => (
        <Image key={`head_${idx}`} source={asset.source} style={getAssetStyle(asset.width, asset.height, asset.top, asset.left)} resizeMode="contain" />
    ));
};

export const buildBodyLayers = (appearance: CharacterAppearance | null | undefined, equipment: EquippedMap | null | undefined) => {
    if (!appearance) return null;
    const gender = appearance.gender;
    const bodyData = characterAssets[gender]?.body?.[appearance.skinTone];
    
    if (!bodyData) return null;
    
    // Only render torso - arms are handled separately for proper weapon/glove layering
    return [<Image key="body_torso" source={bodyData.body.source} style={getAssetStyle(bodyData.body.width, bodyData.body.height, bodyData.body.top, bodyData.body.left)} resizeMode="contain" />];
};

export const buildEquipmentGroups = (equipment: EquippedMap | null | undefined, appearance: CharacterAppearance | null | undefined) => {
    // Separate groups for proper z-index layering:
    // back: cape back (lowest)
    // legs: legs/pants (behind everything except cape back)
    // chest: chest armor (behind cape front)
    // capeFront: cape front (max z-index)
    // feet: boots (max z-index)
    // weaponOffHand: off-hand weapon only
    // weaponMainHand: main-hand weapon only
    // shield: shield only
    // handOffHandBehind: left hand/glove behind shield (when shield equipped)
    // handOffHandFront: left hand/glove in front of shield/off-hand weapon
    // handMainHandBehind: right hand/glove behind main-hand weapon (when shield equipped)
    // handMainHandFront: right hand/glove in front of main-hand weapon (when no shield)
    // helmet: helmet (max z-index, rendered with head)
    const g: Record<string, React.ReactNode[]> = { 
        back: [],      // cape back - lowest
        legs: [],      // legs/pants - low
        chest: [],     // chest armor
        capeFront: [], // cape front - max
        feet: [],      // boots - max
        weaponOffHand: [], // off-hand weapon only
        weaponMainHand: [], // main-hand weapon only
        shield: [],    // shield only
        handOffHandBehind: [], // left hand/glove behind shield (when shield equipped)
        handOffHandFront: [],  // left hand/glove in front of shield/off-hand weapon
        handMainHandBehind: [], // right hand/glove behind main-hand weapon (when shield equipped)
        handMainHandFront: [],  // right hand/glove in front of main-hand weapon (when no shield)
        helmet: []     // helmet - max (rendered with head)
    };
    if (!equipment || !appearance) return g;

    const gender = appearance.gender;
    const hasShield = !!(equipment && equipment.shield);
    const hasGloves = !!(equipment.glove_left || equipment.glove_right);
    const bodyData = characterAssets[gender]?.body?.[appearance.skinTone];

    const addSingle = (slot: 'helmet' | 'chest' | 'cape' | 'legs', slug?: string, bucket: keyof typeof g = 'chest') => {
        if (!slug) return;
        const asset = getItemAsset(slot, slug);
        const pos = getItemPosition(asset, gender);
        if (asset && pos) {
            g[bucket].push(<Image key={`${slot}_${slug}`} source={asset.source} style={getAssetStyle(pos.width, pos.height, pos.top, pos.left)} resizeMode="contain" />);
        }
    };
    
    const addSide = (slot: 'glove' | 'feet', leftSlug?: string, rightSlug?: string, bucket: keyof typeof g = 'feet') => {
        const add = (side: 'left' | 'right', slug?: string) => {
            if (!slug) return;
            // Construct the proper asset slug by appending _left or _right
            const assetSlug = `${slug}_${side}`;
            const asset = getItemAsset(slot, assetSlug);
            const pos = getItemPosition(asset, gender);
            if (asset && pos) {
                g[bucket].push(<Image key={`${slot}_${side}_${slug}`} source={asset.source} style={getAssetStyle(pos.width, pos.height, pos.top, pos.left)} resizeMode="contain" />);
            }
        };
        add('left', leftSlug);
        add('right', rightSlug);
    };

    // Handle cape: render back and front separately
    if (equipment.cape) {
        const capeBack = getItemAsset('cape', `${equipment.cape}_back`);
        const capeFront = getItemAsset('cape', `${equipment.cape}_front`);
        const backPos = getItemPosition(capeBack, gender);
        const frontPos = getItemPosition(capeFront, gender);
        if (capeBack && backPos) {
            g.back.push(<Image key="cape_back" source={capeBack.source} style={getAssetStyle(backPos.width, backPos.height, backPos.top, backPos.left)} resizeMode="contain" />);
        }
        if (capeFront && frontPos) {
            g.capeFront.push(<Image key="cape_front" source={capeFront.source} style={getAssetStyle(frontPos.width, frontPos.height, frontPos.top, frontPos.left)} resizeMode="contain" />);
        }
    }
    
    // Separate equipment into proper groups
    addSingle('chest', equipment.chest || undefined, 'chest');
    addSingle('helmet', equipment.helmet || undefined, 'helmet');
    addSingle('legs', equipment.legs || undefined, 'legs');
    addSide('feet', equipment.feet_left, equipment.feet_right, 'feet');

    // Render weapons and shield separately for proper layering
    // Order from weaponRenderHelper: [main-hand weapon (if present), off-hand weapon (if present), shield (if present)]
    console.log('[CharacterFullPreview] Equipment received:', {
        weapon_left: equipment.weapon_left,
        weapon_right: equipment.weapon_right,
        weapon_twohanded: equipment.weapon_twohanded,
        shield: equipment.shield
    });
    const weaponInstructions = getWeaponRenderInstructions(
        equipment.weapon_left,
        equipment.weapon_right,
        equipment.weapon_twohanded,
        equipment.shield,
        gender
    );
    console.log('[CharacterFullPreview] Weapon instructions created:', weaponInstructions.length, 'instructions');
    weaponInstructions.forEach((w, idx) => {
        console.log(`  [${idx}] flipHorizontal:`, w.flipHorizontal, 'hasSource:', !!w.source);
    });
    
    // Separate main-hand weapon, off-hand weapon, and shield
    // Shield is always the last instruction when present
    const shieldIndex = hasShield ? weaponInstructions.length - 1 : -1;
    const hasTwoHanded = !!equipment.weapon_twohanded;
    
    weaponInstructions.forEach((w, i) => {
        const baseStyle = getAssetStyle(w.width, w.height, w.top, w.left);
        const style = w.flipHorizontal 
            ? { ...baseStyle, transform: [{ scaleX: -1 }] }
            : baseStyle;
        
        if (i === shieldIndex) {
            g.shield.push(<Image key={`shield_${i}`} source={w.source} style={style} resizeMode="contain" />);
        } else if (hasTwoHanded) {
            g.weaponMainHand.push(<Image key={`weapon_twohanded_${i}`} source={w.source} style={style} resizeMode="contain" />);
        } else if (w.flipHorizontal) {
            console.log('[CharacterFullPreview] ✅ Off-hand weapon added to weaponOffHand group, index:', i);
            g.weaponOffHand.push(<Image key={`weapon_off_${i}`} source={w.source} style={style} resizeMode="contain" />);
        } else {
            console.log('[CharacterFullPreview] ✅ Main-hand weapon added to weaponMainHand group, index:', i);
            g.weaponMainHand.push(<Image key={`weapon_main_${i}`} source={w.source} style={style} resizeMode="contain" />);
        }
    });
    
    // Handle hands/gloves with conditional layering based on shield
    // When shield is equipped: 
    //   - Left hand/glove in front of shield
    //   - Right hand/glove behind main-hand weapon
    // When no shield:
    //   - Left hand/glove in front of off-hand weapon
    //   - Right hand/glove in front of main-hand weapon
    
    // Left hand/glove
    if (equipment.glove_left && bodyData) {
        const assetSlug = `${equipment.glove_left}_left`;
        const asset = getItemAsset('glove', assetSlug);
        const pos = getItemPosition(asset, gender);
        if (asset && pos) {
            g.handOffHandFront.push(<Image key="glove_left" source={asset.source} style={getAssetStyle(pos.width, pos.height, pos.top, pos.left)} resizeMode="contain" />);
        }
    } else if (!hasGloves && bodyData) {
        // Bare left hand
        g.handOffHandFront.push(<Image key="hand_left" source={bodyData.left_arm.source} style={getAssetStyle(bodyData.left_arm.width, bodyData.left_arm.height, bodyData.left_arm.top, bodyData.left_arm.left)} resizeMode="contain" />);
    }
    
    // Right hand/glove
    if (equipment.glove_right && bodyData) {
        const assetSlug = `${equipment.glove_right}_right`;
        const asset = getItemAsset('glove', assetSlug);
        const pos = getItemPosition(asset, gender);
        if (asset && pos) {
            const handImage = <Image key="glove_right" source={asset.source} style={getAssetStyle(pos.width, pos.height, pos.top, pos.left)} resizeMode="contain" />;
            if (hasShield) {
                g.handMainHandBehind.push(handImage);
            } else {
                g.handMainHandFront.push(handImage);
            }
        }
    } else if (!hasGloves && bodyData) {
        // Bare right hand
        const handImage = <Image key="hand_right" source={bodyData.right_arm.source} style={getAssetStyle(bodyData.right_arm.width, bodyData.right_arm.height, bodyData.right_arm.top, bodyData.right_arm.left)} resizeMode="contain" />;
        if (hasShield) {
            g.handMainHandBehind.push(handImage);
        } else {
            g.handMainHandFront.push(handImage);
        }
    }

    return g;
};

export const computeAutoOffsetX = (
    appearance: CharacterAppearance | null | undefined,
    equipment: EquippedMap | null | undefined,
    BASE_CANVAS: number,
) => {
    if (!appearance) return 0;

    let minLeft = Number.POSITIVE_INFINITY;
    let maxRight = Number.NEGATIVE_INFINITY;

    const include = (pos?: { width: number; height: number; top: number; left: number } | null) => {
        if (!pos) return;
        minLeft = Math.min(minLeft, pos.left);
        maxRight = Math.max(maxRight, pos.left + pos.width);
    };

    const gender = appearance.gender;
    const hairKey = `${appearance.hair}_${appearance.hairColor}`;
    const hasHelmet = !!equipment?.helmet;
    const orderedAssets: (any | null)[] = [
        characterAssets[gender].head[appearance.skinTone],
        characterAssets[gender].eyes[appearance.eyes],
        (gender === 'male' && appearance.beard?.includes('full')) ? null : characterAssets[gender].mouth[appearance.mouth],
        appearance.markings ? characterAssets[gender].markings[appearance.markings] : null,
        (gender === 'male' && appearance.beard) ? characterAssets[gender].beards[appearance.beard] : null,
        // Hide hair when helmet is equipped
        hasHelmet ? null : characterAssets[gender].hair[hairKey],
    ];
    orderedAssets.filter(Boolean).forEach((asset: any) => include({ width: asset.width, height: asset.height, top: asset.top, left: asset.left }));

    // Always include body arms in bounding box calculation to maintain consistent positioning
    // even when gloves are equipped (which hide the body arms)
    const bodyData = characterAssets[gender]?.body?.[appearance.skinTone];
    if (bodyData) {
        // Include body parts (left arm, torso, right arm) to maintain consistent bounds
        include({ width: bodyData.left_arm.width, height: bodyData.left_arm.height, top: bodyData.left_arm.top, left: bodyData.left_arm.left });
        include({ width: bodyData.body.width, height: bodyData.body.height, top: bodyData.body.top, left: bodyData.body.left });
        include({ width: bodyData.right_arm.width, height: bodyData.right_arm.height, top: bodyData.right_arm.top, left: bodyData.right_arm.left });
    }

    // Use item-specific positioning instead of slotMeta
    // Exclude cape and gloves from bounding box to prevent character shifting when equipping/unequipping them
    const addSinglePos = (slot: 'helmet' | 'chest' | 'cape' | 'legs', slug?: string) => {
        if (!slug) return;
        const asset = getItemAsset(slot, slug);
        const pos = getItemPosition(asset, gender);
        if (pos) include(pos);
    };
    
    // Exclude cape from bounding box calculation - it can extend beyond character bounds
    // and cause unwanted shifting when equipped/unequipped
    
    addSinglePos('chest', equipment?.chest || undefined);
    addSinglePos('helmet', equipment?.helmet || undefined);
    addSinglePos('legs', equipment?.legs || undefined);
    
    // Exclude gloves and boots from bounding box calculation - they can extend beyond character bounds
    // and cause unwanted shifting when equipped/unequipped

    // Exclude all weapons and shields from bounding box calculation to prevent character shifting
    // when equipping/unequipping them
    // (Weapons are handled separately and don't affect character centering)

    if (!isFinite(minLeft) || !isFinite(maxRight)) return 0;
    const centerOfContent = (minLeft + maxRight) / 2;
    const canvasCenter = BASE_CANVAS / 2;
    return Math.round(canvasCenter - centerOfContent);
};


