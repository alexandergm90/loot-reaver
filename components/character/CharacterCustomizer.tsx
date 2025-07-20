import { useCharacterStore } from '@/store/characterStore';
import { CharacterPreviewProps } from '@/types';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import SelectorRow from '@/components/ui/SelectorRow';
import { characterAssets } from '@/data/characterAssets';
import { cycleOption } from '@/utils/cycleOption';
import CharacterHeadPreview from './CharacterHeadPreview';

const HAIR_COLORS = ['blue', 'red', 'yellow', 'black', 'white', 'brown'];
const SKIN_TONES = Object.keys(characterAssets.male.head);

type Props = {
    editable?: boolean;
};

const CharacterCustomizer: React.FC<Props> = ({ editable = true }) => {
    const character = useCharacterStore((s) => s.character);
    const setPart = useCharacterStore((s) => s.setPart);
    const randomize = useCharacterStore((s) => s.randomize);

    const [skinIndex, setSkinIndex] = useState(0);
    const visibleSkins = SKIN_TONES.slice(skinIndex, skinIndex + 4);

    const toggleGender = () => {
        const newGender = character.gender === 'male' ? 'female' : 'male';
        setPart('gender', newGender);
        if (newGender === 'female') setPart('beard', null);
    };

    const updatePart = (part: keyof CharacterPreviewProps, direction: 'next' | 'prev') => {
        let options: string[] = [];

        if (part === 'skinTone') {
            options = Object.keys(characterAssets[character.gender].head);
        } else if (part === 'eyes') {
            options = Object.keys(characterAssets[character.gender].eyes);
        } else if (part === 'hair') {
            options = Object.keys(characterAssets[character.gender].hair).filter((key) =>
                key.endsWith('_' + character.hairColor),
            );

            const currentHairKey = character.hair + '_' + character.hairColor;
            const newFullHairKey = cycleOption(options, currentHairKey, direction);
            const [newHair] = newFullHairKey.split('_');
            setPart('hair', newHair);
            return;
        } else if (part === 'mouth') {
            options = Object.keys(characterAssets[character.gender].mouth);
        } else if (part === 'beard') {
            options = Object.keys(characterAssets.male.beards).concat(['none']);
        } else if (part === 'markings') {
            options = Object.keys(characterAssets[character.gender].markings).concat(['none']);
        }

        setPart(part, cycleOption(options, character[part] || 'none', direction));
    };

    const ColorSwatch = ({
        color,
        selected,
        onPress,
    }: {
        color: string;
        selected: boolean;
        onPress: () => void;
    }) => (
        <Pressable
            onPress={onPress}
            style={{
                width: 24,
                height: 24,
                marginHorizontal: 4,
                borderRadius: 12,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? '#fff' : '#666',
                backgroundColor: color,
            }}
        />
    );

    return (
        <View style={styles.wrapper}>
            <CharacterHeadPreview
                {...character}
                hair={`${character.hair}_${character.hairColor}`}
            />

            {editable && (
                <View style={styles.controls}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Gender:</Text>
                        <Pressable style={styles.button} onPress={toggleGender}>
                            <Text style={styles.buttonText}>{character.gender.toUpperCase()}</Text>
                        </Pressable>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Skin Tone:</Text>
                        <Pressable onPress={() => setSkinIndex((i) => Math.max(0, i - 1))}>
                            <Text style={styles.buttonText}>◀</Text>
                        </Pressable>
                        <View style={{ flexDirection: 'row', marginHorizontal: 8 }}>
                            {visibleSkins.map((tone) => (
                                <Pressable
                                    key={tone}
                                    style={{
                                        width: 24,
                                        height: 24,
                                        backgroundColor:
                                            characterAssets[character.gender].head[tone]
                                                .previewColor || '#999',
                                        borderRadius: 4,
                                        marginHorizontal: 4,
                                        borderWidth: character.skinTone === tone ? 2 : 1,
                                        borderColor: character.skinTone === tone ? '#fff' : '#666',
                                    }}
                                    onPress={() => setPart('skinTone', tone)}
                                />
                            ))}
                        </View>
                        <Pressable
                            onPress={() =>
                                setSkinIndex((i) => Math.min(SKIN_TONES.length - 4, i + 1))
                            }
                        >
                            <Text style={styles.buttonText}>▶</Text>
                        </Pressable>
                    </View>

                    <SelectorRow
                        label="Eyes"
                        value={character.eyes}
                        onChange={(dir) => updatePart('eyes', dir)}
                    />
                    <SelectorRow
                        label="Hair"
                        value={character.hair}
                        onChange={(dir) => updatePart('hair', dir)}
                    />

                    <View style={styles.row}>
                        <Text style={styles.label}>Hair Color:</Text>
                        <View style={{ flexDirection: 'row', marginLeft: 8 }}>
                            {HAIR_COLORS.map((color) => (
                                <ColorSwatch
                                    key={color}
                                    color={color}
                                    selected={character.hairColor === color}
                                    onPress={() => setPart('hairColor', color)}
                                />
                            ))}
                        </View>
                    </View>

                    {(character.gender !== 'male' || !character.beard?.includes('full')) && (
                        <SelectorRow
                            label="Mouth"
                            value={character.mouth}
                            onChange={(dir) => updatePart('mouth', dir)}
                        />
                    )}

                    {character.gender === 'male' && (
                        <SelectorRow
                            label="Beard"
                            value={character.beard || 'none'}
                            onChange={(dir) => updatePart('beard', dir)}
                        />
                    )}

                    <SelectorRow
                        label="Mark"
                        value={character.markings || 'none'}
                        onChange={(dir) => updatePart('markings', dir)}
                    />

                    <Pressable style={styles.button} onPress={randomize}>
                        <Text style={styles.buttonText}>🎲 Random</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
};

export default CharacterCustomizer;

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    controls: {
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        color: '#fff',
        fontSize: 16,
        marginRight: 8,
    },
    button: {
        backgroundColor: '#333',
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
