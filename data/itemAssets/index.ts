import { EquipmentAssets } from '@/types/equipmentAsset';
import { capeAssets } from './cape';
import { chestAssets } from './chest';
import { feetAssets } from './feet';
import { gloveAssets } from './glove';
import { helmetAssets } from './helmet';
import { neckAssets } from './neck';
import { ringAssets } from './ring';
import { shieldAssets } from './shield';
import { weaponAssets } from './weapon';

export const itemAssets = {
    chest: chestAssets,
    weapon: weaponAssets,
    helmet: helmetAssets,
    shield: shieldAssets,
    cape: capeAssets,
    glove: gloveAssets,
    neck: neckAssets,
    ring: ringAssets,
    feet: feetAssets,
} as Record<string, EquipmentAssets>;
