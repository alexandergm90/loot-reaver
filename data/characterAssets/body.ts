import { CharacterAsset } from '@/types/character';

/**
 * Body part structure
 * Each skin tone has: body (torso), left_arm, right_arm
 */
export type BodyAssets = {
    body: CharacterAsset;
    left_arm: CharacterAsset;
    right_arm: CharacterAsset;
};

export const bodyAssets: Record<'male' | 'female', Record<string, BodyAssets>> = {
    male: {
        light1: {
            body: {
                source: require('@/assets/images/character/male/body/skin/light1/body.png'),
                width: 195, // TODO: Measure actual image dimensions
                height: 427, // TODO: Measure actual image dimensions
                top: 70, // Positioned below head (head height is 109)
                left: -39, // TODO: Center based on actual dimensions
            },
            left_arm: {
                source: require('@/assets/images/character/male/body/skin/light1/left_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 45, // TODO: Measure actual image dimensions
                top: 249, // Aligned with body
                left: -39, // TODO: Position based on actual dimensions
            },
            right_arm: {
                source: require('@/assets/images/character/male/body/skin/light1/right_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 57, // TODO: Measure actual image dimensions
                top: 242, // Aligned with body
                left: 121, // TODO: Position based on actual dimensions
            },
        },
        light2: {
            body: {
                source: require('@/assets/images/character/male/body/skin/light2/body.png'),
                width: 195, // TODO: Measure actual image dimensions
                height: 427, // TODO: Measure actual image dimensions
                top: 65, // Positioned below head (head height is 109)
                left: -37, // TODO: Center based on actual dimensions
            },
            left_arm: {
                source: require('@/assets/images/character/male/body/skin/light2/left_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 45, // TODO: Measure actual image dimensions
                top: 244, // Aligned with body
                left: -37, // TODO: Position based on actual dimensions
            },
            right_arm: {
                source: require('@/assets/images/character/male/body/skin/light2/right_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 57, // TODO: Measure actual image dimensions
                top: 237, // Aligned with body
                left: 121, // TODO: Position based on actual dimensions
            },
        },
        light3: {
            body: {
                source: require('@/assets/images/character/male/body/skin/light3/body.png'),
                width: 195, // TODO: Measure actual image dimensions
                height: 427, // TODO: Measure actual image dimensions
                top: 80, // Positioned below head (head height is 109)
                left: -33, // TODO: Center based on actual dimensions
            },
            left_arm: {
                source: require('@/assets/images/character/male/body/skin/light3/left_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 45, // TODO: Measure actual image dimensions
                top: 255, // Aligned with body
                left: -33, // TODO: Position based on actual dimensions
            },
            right_arm: {
                source: require('@/assets/images/character/male/body/skin/light3/right_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 57, // TODO: Measure actual image dimensions
                top: 250, // Aligned with body
                left: 125, // TODO: Position based on actual dimensions
            },
        },
        light4: {
            body: {
                source: require('@/assets/images/character/male/body/skin/light4/body.png'),
                width: 195, // TODO: Measure actual image dimensions
                height: 427, // TODO: Measure actual image dimensions
                top: 65, // Positioned below head (head height is 109)
                left: -37, // TODO: Center based on actual dimensions
            },
            left_arm: {
                source: require('@/assets/images/character/male/body/skin/light4/left_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 45, // TODO: Measure actual image dimensions
                top: 244, // Aligned with body
                left: -37, // TODO: Position based on actual dimensions
            },
            right_arm: {
                source: require('@/assets/images/character/male/body/skin/light4/right_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 57, // TODO: Measure actual image dimensions
                top: 237, // Aligned with body
                left: 121, // TODO: Position based on actual dimensions
            },
        },
        light5: {
            body: {
                source: require('@/assets/images/character/male/body/skin/light5/body.png'),
                width: 195, // TODO: Measure actual image dimensions
                height: 427, // TODO: Measure actual image dimensions
                top: 65, // Positioned below head (head height is 109)
                left: -37, // TODO: Center based on actual dimensions
            },
            left_arm: {
                source: require('@/assets/images/character/male/body/skin/light5/left_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 45, // TODO: Measure actual image dimensions
                top: 244, // Aligned with body
                left: -37, // TODO: Position based on actual dimensions
            },
            right_arm: {
                source: require('@/assets/images/character/male/body/skin/light5/right_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 57, // TODO: Measure actual image dimensions
                top: 237, // Aligned with body
                left: 121, // TODO: Position based on actual dimensions
            },
        },
        light6: {
            body: {
                source: require('@/assets/images/character/male/body/skin/light6/body.png'),
                width: 195, // TODO: Measure actual image dimensions
                height: 427, // TODO: Measure actual image dimensions
                top: 60, // Positioned below head (head height is 109)
                left: -35, // TODO: Center based on actual dimensions
            },
            left_arm: {
                source: require('@/assets/images/character/male/body/skin/light6/left_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 45, // TODO: Measure actual image dimensions
                top: 242, // Aligned with body
                left: -37, // TODO: Position based on actual dimensions
            },
            right_arm: {
                source: require('@/assets/images/character/male/body/skin/light6/right_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 57, // TODO: Measure actual image dimensions
                top: 237, // Aligned with body
                left: 123, // TODO: Position based on actual dimensions
            },
        },
        red: {
            body: {
                source: require('@/assets/images/character/male/body/skin/red/body.png'),
                width: 195, // TODO: Measure actual image dimensions
                height: 427, // TODO: Measure actual image dimensions
                top: 60, // Positioned below head (head height is 109)
                left: -35, // TODO: Center based on actual dimensions
            },
            left_arm: {
                source: require('@/assets/images/character/male/body/skin/red/left_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 45, // TODO: Measure actual image dimensions
                top: 242, // Aligned with body
                left: -37, // TODO: Position based on actual dimensions
            },
            right_arm: {
                source: require('@/assets/images/character/male/body/skin/red/right_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 57, // TODO: Measure actual image dimensions
                top: 237, // Aligned with body
                left: 123, // TODO: Position based on actual dimensions
            },
        },
        purple: {
            body: {
                source: require('@/assets/images/character/male/body/skin/purple/body.png'),
                width: 195, // TODO: Measure actual image dimensions
                height: 427, // TODO: Measure actual image dimensions
                top: 60, // Positioned below head (head height is 109)
                left: -37, // TODO: Center based on actual dimensions
            },
            left_arm: {
                source: require('@/assets/images/character/male/body/skin/purple/left_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 45, // TODO: Measure actual image dimensions
                top: 242, // Aligned with body
                left: -39, // TODO: Position based on actual dimensions
            },
            right_arm: {
                source: require('@/assets/images/character/male/body/skin/purple/right_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 57, // TODO: Measure actual image dimensions
                top: 237, // Aligned with body
                left: 117, // TODO: Position based on actual dimensions
            },
        },
        blue: {
            body: {
                source: require('@/assets/images/character/male/body/skin/blue/body.png'),
                width: 195, // TODO: Measure actual image dimensions
                height: 427, // TODO: Measure actual image dimensions
                top: 70, // Positioned below head (head height is 109)
                left: -35, // TODO: Center based on actual dimensions
            },
            left_arm: {
                source: require('@/assets/images/character/male/body/skin/blue/left_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 45, // TODO: Measure actual image dimensions
                top: 245, // Aligned with body
                left: -36, // TODO: Position based on actual dimensions
            },
            right_arm: {
                source: require('@/assets/images/character/male/body/skin/blue/right_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 57, // TODO: Measure actual image dimensions
                top: 241, // Aligned with body
                left: 121, // TODO: Position based on actual dimensions
            },
        },
        celestial: {
            body: {
                source: require('@/assets/images/character/male/body/skin/celestial/body.png'),
                width: 195, // TODO: Measure actual image dimensions
                height: 427, // TODO: Measure actual image dimensions
                top: 68, // Positioned below head (head height is 109)
                left: -35, // TODO: Center based on actual dimensions
            },
            left_arm: {
                source: require('@/assets/images/character/male/body/skin/celestial/left_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 45, // TODO: Measure actual image dimensions
                top: 244, // Aligned with body
                left: -35, // TODO: Position based on actual dimensions
            },
            right_arm: {
                source: require('@/assets/images/character/male/body/skin/celestial/right_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 57, // TODO: Measure actual image dimensions
                top: 240, // Aligned with body
                left: 121, // TODO: Position based on actual dimensions
            },
        },
        gray: {
            body: {
                source: require('@/assets/images/character/male/body/skin/gray/body.png'),
                width: 195, // TODO: Measure actual image dimensions
                height: 427, // TODO: Measure actual image dimensions
                top: 70, // Positioned below head (head height is 109)
                left: -35, // TODO: Center based on actual dimensions
            },
            left_arm: {
                source: require('@/assets/images/character/male/body/skin/gray/left_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 45, // TODO: Measure actual image dimensions
                top: 247, // Aligned with body
                left: -36, // TODO: Position based on actual dimensions
            },
            right_arm: {
                source: require('@/assets/images/character/male/body/skin/gray/right_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 57, // TODO: Measure actual image dimensions
                top: 240, // Aligned with body
                left: 124, // TODO: Position based on actual dimensions
            },
        },
        green: {
            body: {
                source: require('@/assets/images/character/male/body/skin/green/body.png'),
                width: 195, // TODO: Measure actual image dimensions
                height: 427, // TODO: Measure actual image dimensions
                top: 70, // Positioned below head (head height is 109)
                left: -35, // TODO: Center based on actual dimensions
            },
            left_arm: {
                source: require('@/assets/images/character/male/body/skin/green/left_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 45, // TODO: Measure actual image dimensions
                top: 245, // Aligned with body
                left: -36, // TODO: Position based on actual dimensions
            },
            right_arm: {
                source: require('@/assets/images/character/male/body/skin/green/right_arm.png'),
                width: 46, // TODO: Measure actual image dimensions
                height: 57, // TODO: Measure actual image dimensions
                top: 240, // Aligned with body
                left: 122, // TODO: Position based on actual dimensions
            },
        },
    },
    female: {
        // Female body assets can be added here when they become available
        // light3: { ... }
    },
};

