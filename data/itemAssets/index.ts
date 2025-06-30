import { chestAssets } from './chest';
import { weaponAssets } from './weapon';
import { helmetAssets } from './helmet';
import { shieldAssets } from './shield';
import { capeAssets } from './cape';
import { gloveAssets } from './glove';
import { neckAssets } from './neck';
import { ringAssets } from './ring';
import { feetAssets } from './feet';
import { EquipmentAssets } from '@/types/equipmentAsset';

export const itemAssets = {
    chest: chestAssets,
    weapon: weaponAssets,
    helmet: helmetAssets,
    shield: shieldAssets,
    cape: capeAssets,
    glove: gloveAssets,
    neck: neckAssets,
    ring: ringAssets,
    feet: feetAssets
} as Record<string, EquipmentAssets>;