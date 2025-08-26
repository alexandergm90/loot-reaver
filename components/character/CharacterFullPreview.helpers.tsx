import { characterAssets } from '@/data/characterAssets';
import { CharacterAppearance } from '@/types/player';
import { getAssetStyle } from '@/utils/getAssetStyle';
import { getItemAsset } from '@/utils/getItemAsset';
import { getSlotPosition } from '@/utils/getSlotPosiiton';
import { getWeaponRenderInstructions } from '@/utils/weaponRenderHelper';
import React from 'react';
import { Image } from 'react-native';

export type EquippedMap = Partial<{
    helmet: string; chest: string; cape: string;
    glove_left: string; glove_right: string;
    feet_left: string; feet_right: string;
    weapon_main: string; weapon_off: string; weapon_twohanded: string; shield: string;
}>;

export const buildHeadLayers = (appearance: CharacterAppearance | null | undefined) => {
    if (!appearance) return null;
    const gender = appearance.gender;
    const hairKey = `${appearance.hair}_${appearance.hairColor}`;
    const orderedAssets: (any | null)[] = [
        characterAssets[gender].head[appearance.skinTone],
        characterAssets[gender].eyes[appearance.eyes],
        (gender === 'male' && appearance.beard?.includes('full')) ? null : characterAssets[gender].mouth[appearance.mouth],
        appearance.markings ? characterAssets[gender].markings[appearance.markings] : null,
        (gender === 'male' && appearance.beard) ? characterAssets[gender].beards[appearance.beard] : null,
        characterAssets[gender].hair[hairKey],
    ];
    return orderedAssets.filter(Boolean).map((asset: any, idx: number) => (
        <Image key={`head_${idx}`} source={asset.source} style={getAssetStyle(asset.width, asset.height, asset.top, asset.left)} resizeMode="contain" />
    ));
};

export const buildEquipmentGroups = (equipment: EquippedMap | null | undefined) => {
    const g: Record<string, React.ReactNode[]> = { back: [], body: [], feet: [], weapon: [], hands: [] };
    if (!equipment) return g;

    const addSingle = (slot: 'helmet' | 'chest' | 'cape', slug?: string, bucket: keyof typeof g = 'body') => {
        if (!slug) return;
        const asset = getItemAsset(slot, slug); const pos = getSlotPosition(slot);
        if (asset && pos) g[bucket].push(<Image key={`${slot}`} source={asset.source} style={getAssetStyle(pos.width, pos.height, pos.top, pos.left)} resizeMode="contain" />);
    };
    const addSide = (slot: 'glove' | 'feet', leftSlug?: string, rightSlug?: string, bucket: keyof typeof g = 'hands') => {
        const add = (side: 'left' | 'right', slug?: string) => {
            if (!slug) return; const a = getItemAsset(slot, slug); const p = getSlotPosition(slot, side);
            if (a && p) g[bucket].push(<Image key={`${slot}_${side}`} source={a.source} style={getAssetStyle(p.width, p.height, p.top, p.left)} resizeMode="contain" />);
        };
        add('left', leftSlug); add('right', rightSlug);
    };

    addSingle('cape', equipment.cape || undefined, 'back');
    addSingle('chest', equipment.chest || undefined, 'body');
    addSingle('helmet', equipment.helmet || undefined, 'body');
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
    getWeaponRenderInstructions(main as any, off as any)
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
    const orderedAssets: (any | null)[] = [
        characterAssets[gender].head[appearance.skinTone],
        characterAssets[gender].eyes[appearance.eyes],
        (gender === 'male' && appearance.beard?.includes('full')) ? null : characterAssets[gender].mouth[appearance.mouth],
        appearance.markings ? characterAssets[gender].markings[appearance.markings] : null,
        (gender === 'male' && appearance.beard) ? characterAssets[gender].beards[appearance.beard] : null,
        characterAssets[gender].hair[hairKey],
    ];
    orderedAssets.filter(Boolean).forEach((asset: any) => include({ width: asset.width, height: asset.height, top: asset.top, left: asset.left }));

    const addSinglePos = (slot: 'helmet' | 'chest' | 'cape', slug?: string) => { if (slug) include(getSlotPosition(slot)); };
    addSinglePos('cape', equipment?.cape || undefined);
    addSinglePos('chest', equipment?.chest || undefined);
    addSinglePos('helmet', equipment?.helmet || undefined);
    const addSidePos = (slot: 'glove' | 'feet', leftSlug?: string, rightSlug?: string) => {
        if (leftSlug) include(getSlotPosition(slot, 'left'));
        if (rightSlug) include(getSlotPosition(slot, 'right'));
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
    const weaponLayers = getWeaponRenderInstructions(main as any, off as any);
    weaponLayers.forEach(w => include({ width: w.width, height: w.height, top: w.top, left: w.left }));

    if (!isFinite(minLeft) || !isFinite(maxRight)) return 0;
    const centerOfContent = (minLeft + maxRight) / 2;
    const canvasCenter = BASE_CANVAS / 2;
    return Math.round(canvasCenter - centerOfContent);
};


