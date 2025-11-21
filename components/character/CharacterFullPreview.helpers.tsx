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
    
    // Hide hands when gloves are equipped
    const hasGloves = !!(equipment?.glove_left || equipment?.glove_right);
    
    // Render arms first (behind), then body (on top)
    // Left arm, body, right arm
    const layers = [];
    if (!hasGloves) {
        layers.push(<Image key="body_left_arm" source={bodyData.left_arm.source} style={getAssetStyle(bodyData.left_arm.width, bodyData.left_arm.height, bodyData.left_arm.top, bodyData.left_arm.left)} resizeMode="contain" />);
    }
    layers.push(<Image key="body_torso" source={bodyData.body.source} style={getAssetStyle(bodyData.body.width, bodyData.body.height, bodyData.body.top, bodyData.body.left)} resizeMode="contain" />);
    if (!hasGloves) {
        layers.push(<Image key="body_right_arm" source={bodyData.right_arm.source} style={getAssetStyle(bodyData.right_arm.width, bodyData.right_arm.height, bodyData.right_arm.top, bodyData.right_arm.left)} resizeMode="contain" />);
    }
    return layers;
};

export const buildEquipmentGroups = (equipment: EquippedMap | null | undefined, appearance: CharacterAppearance | null | undefined) => {
    // Separate groups for proper z-index layering:
    // back: cape back (lowest)
    // legs: legs/pants (behind everything except cape back)
    // chest: chest armor (behind cape front)
    // capeFront: cape front (max z-index)
    // feet: boots (max z-index)
    // weapon: weapons/shield (behind gloves, in front of chest & legs)
    // hands: gloves (max z-index)
    // helmet: helmet (max z-index, rendered with head)
    const g: Record<string, React.ReactNode[]> = { 
        back: [],      // cape back - lowest
        legs: [],      // legs/pants - low
        chest: [],     // chest armor
        capeFront: [], // cape front - max
        feet: [],      // boots - max
        weapon: [],    // weapons/shield
        hands: [],     // gloves - max
        helmet: []     // helmet - max (rendered with head)
    };
    if (!equipment || !appearance) return g;

    const gender = appearance.gender;

    const addSingle = (slot: 'helmet' | 'chest' | 'cape' | 'legs', slug?: string, bucket: keyof typeof g = 'chest') => {
        if (!slug) return;
        const asset = getItemAsset(slot, slug);
        const pos = getItemPosition(asset, gender);
        if (asset && pos) {
            g[bucket].push(<Image key={`${slot}_${slug}`} source={asset.source} style={getAssetStyle(pos.width, pos.height, pos.top, pos.left)} resizeMode="contain" />);
        }
    };
    
    const addSide = (slot: 'glove' | 'feet', leftSlug?: string, rightSlug?: string, bucket: keyof typeof g = 'hands') => {
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

    // Render weapons using new left/right/two-handed logic
    getWeaponRenderInstructions(
        equipment.weapon_left,
        equipment.weapon_right,
        equipment.weapon_twohanded,
        equipment.shield,
        gender
    ).forEach((w, i) => g.weapon.push(<Image key={`weapon_${i}`} source={w.source} style={getAssetStyle(w.width, w.height, w.top, w.left)} resizeMode="contain" />));
    addSide('glove', equipment.glove_left, equipment.glove_right, 'hands');

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
    
    const addSidePos = (slot: 'glove' | 'feet', leftSlug?: string, rightSlug?: string) => {
        const add = (slug?: string) => {
            if (!slug) return;
            const assetSlug = `${slug}_left`;
            const asset = getItemAsset(slot, assetSlug);
            const pos = getItemPosition(asset, gender);
            if (pos) include(pos);
        };
        if (leftSlug) {
            const asset = getItemAsset(slot, `${leftSlug}_left`);
            const pos = getItemPosition(asset, gender);
            if (pos) include(pos);
        }
        if (rightSlug) {
            const asset = getItemAsset(slot, `${rightSlug}_right`);
            const pos = getItemPosition(asset, gender);
            if (pos) include(pos);
        }
    };
    addSidePos('feet', equipment?.feet_left, equipment?.feet_right);
    // Exclude gloves from bounding box calculation - they can extend beyond character bounds
    // and cause unwanted shifting when equipped/unequipped

    // Include weapons in bounding box calculation
    const weaponLayers = getWeaponRenderInstructions(
        equipment?.weapon_left,
        equipment?.weapon_right,
        equipment?.weapon_twohanded,
        equipment?.shield,
        gender
    );
    weaponLayers.forEach(w => include({ width: w.width, height: w.height, top: w.top, left: w.left }));

    if (!isFinite(minLeft) || !isFinite(maxRight)) return 0;
    const centerOfContent = (minLeft + maxRight) / 2;
    const canvasCenter = BASE_CANVAS / 2;
    return Math.round(canvasCenter - centerOfContent);
};


