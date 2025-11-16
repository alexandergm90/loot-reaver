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
    weapon_main: string; weapon_off: string; weapon_twohanded: string; shield: string;
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
    const g: Record<string, React.ReactNode[]> = { back: [], body: [], feet: [], weapon: [], hands: [] };
    if (!equipment || !appearance) return g;

    const gender = appearance.gender;

    const addSingle = (slot: 'helmet' | 'chest' | 'cape' | 'legs', slug?: string, bucket: keyof typeof g = 'body') => {
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

    // Handle cape: render back first, then front
    if (equipment.cape) {
        const capeBack = getItemAsset('cape', `${equipment.cape}_back`);
        const capeFront = getItemAsset('cape', `${equipment.cape}_front`);
        const backPos = getItemPosition(capeBack, gender);
        const frontPos = getItemPosition(capeFront, gender);
        if (capeBack && backPos) {
            g.back.push(<Image key="cape_back" source={capeBack.source} style={getAssetStyle(backPos.width, backPos.height, backPos.top, backPos.left)} resizeMode="contain" />);
        }
        if (capeFront && frontPos) {
            g.body.push(<Image key="cape_front" source={capeFront.source} style={getAssetStyle(frontPos.width, frontPos.height, frontPos.top, frontPos.left)} resizeMode="contain" />);
        }
    }
    
    addSingle('chest', equipment.chest || undefined, 'body');
    addSingle('helmet', equipment.helmet || undefined, 'body');
    addSingle('legs', equipment.legs || undefined, 'body');
    addSide('feet', equipment.feet_left, equipment.feet_right, 'feet');

    const main = equipment.weapon_twohanded
        ? { ...getItemAsset('weapon', equipment.weapon_twohanded)!, weaponType: 'twohanded' as const, itemType: 'weapon' as const }
        : equipment.weapon_main
            ? { ...getItemAsset('weapon', equipment.weapon_main)!, weaponType: 'main' as const, itemType: 'weapon' as const }
            : null;
    const off = equipment.shield
        ? { ...getItemAsset('shield', equipment.shield)!, itemType: 'shield' as const }
        : equipment.weapon_off
            ? { ...getItemAsset('weapon', equipment.weapon_off)!, itemType: 'weapon' as const, weaponType: 'off' as const }
            : null;
    getWeaponRenderInstructions(main as any, off as any, gender)
        .forEach((w, i) => g.weapon.push(<Image key={`weapon_${i}`} source={w.source} style={getAssetStyle(w.width, w.height, w.top, w.left)} resizeMode="contain" />));
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

    // Use item-specific positioning instead of slotMeta
    const addSinglePos = (slot: 'helmet' | 'chest' | 'cape' | 'legs', slug?: string) => {
        if (!slug) return;
        const asset = getItemAsset(slot, slug);
        const pos = getItemPosition(asset, gender);
        if (pos) include(pos);
    };
    
    // Handle cape front/back
    if (equipment?.cape) {
        const capeBack = getItemAsset('cape', `${equipment.cape}_back`);
        const capeFront = getItemAsset('cape', `${equipment.cape}_front`);
        const backPos = getItemPosition(capeBack, gender);
        const frontPos = getItemPosition(capeFront, gender);
        if (backPos) include(backPos);
        if (frontPos) include(frontPos);
    }
    
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
    addSidePos('glove', equipment?.glove_left, equipment?.glove_right);

    const main = equipment?.weapon_twohanded
        ? { ...getItemAsset('weapon', equipment.weapon_twohanded)!, weaponType: 'twohanded' as const, itemType: 'weapon' as const }
        : equipment?.weapon_main
            ? { ...getItemAsset('weapon', equipment.weapon_main)!, weaponType: 'main' as const, itemType: 'weapon' as const }
            : null;
    const off = equipment?.shield
        ? { ...getItemAsset('shield', equipment.shield)!, itemType: 'shield' as const }
        : equipment?.weapon_off
            ? { ...getItemAsset('weapon', equipment.weapon_off)!, itemType: 'weapon' as const, weaponType: 'off' as const }
            : null;
    const weaponLayers = getWeaponRenderInstructions(main as any, off as any, gender);
    weaponLayers.forEach(w => include({ width: w.width, height: w.height, top: w.top, left: w.left }));

    if (!isFinite(minLeft) || !isFinite(maxRight)) return 0;
    const centerOfContent = (minLeft + maxRight) / 2;
    const canvasCenter = BASE_CANVAS / 2;
    return Math.round(canvasCenter - centerOfContent);
};


