import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import CharacterHeadPreview from '@/components/character/CharacterHeadPreview';
import {characterAssets} from '@/data/characterAssets';
import {cycleOption} from '@/utils/cycleOption';
import {CharacterPreviewProps} from '@/types/character';
import {generateRandomCharacter} from '@/utils/randomCharacter';
import SelectorRow from '@/components/ui/SelectorRow';

const HAIR_COLORS = ['blue', 'red', 'yellow', 'black', 'white', 'brown'];
const SKIN_TONES = Object.keys(characterAssets.male.head);

const CharacterCreationScreen = () => {
    const [character, setCharacter] = useState<CharacterPreviewProps & { hairColor: string }>({
        gender: 'male',
        skinTone: 'celestial',
        hair: 'spiky',
        hairColor: 'white',
        eyes: 'suspicious',
        mouth: 'mouth1',
        beard: 'none',
        markings: 'mark1',
    });

    const [skinIndex, setSkinIndex] = useState(0);
    const visibleSkins = SKIN_TONES.slice(skinIndex, skinIndex + 4);

    const toggleGender = () => {
        setCharacter(prev => ({
            ...prev,
            gender: prev.gender === 'male' ? 'female' : 'male',
            beard: prev.gender === 'female' ? null : prev.beard,
        }));
    };

    const updatePart = (part: keyof CharacterPreviewProps, direction: 'next' | 'prev') => {
        let options: string[] = [];

        if (part === 'skinTone') {
            options = Object.keys(characterAssets[character.gender].head);
        } else if (part === 'eyes') {
            options = Object.keys(characterAssets[character.gender].eyes);
        } else if (part === 'hair') {
            options = Object.keys(characterAssets[character.gender].hair);
        } else if (part === 'mouth') {
            options = Object.keys(characterAssets[character.gender].mouth);
        } else if (part === 'beard') {
            options = Object.keys(characterAssets.male.beards).concat(['none']);
        } else if (part === 'markings') {
            options = Object.keys(characterAssets[character.gender].markings).concat(['none']);
        }

        setCharacter(prev => ({
            ...prev,
            [part]: cycleOption(options, prev[part] || 'none', direction),
        }));
    };

    const ColorSwatch = ({ color, selected, onPress }: { color: string; selected: boolean; onPress: () => void }) => (
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
        <View style={styles.container}>
            <Text style={styles.title}>Character Creation</Text>
            <CharacterHeadPreview {...character} hair={character.hair + '_' + character.hairColor} />

            <View style={styles.toggleRow}>
                <Text style={styles.label}>Gender:</Text>
                <Pressable style={styles.button} onPress={toggleGender}>
                    <Text style={styles.buttonText}>{character.gender.toUpperCase()}</Text>
                </Pressable>
            </View>

            {/* Skin Tone Carousel */}
            <View style={styles.colorRow}>
                <Text style={styles.label}>Skin Tone:</Text>
                <Pressable onPress={() => setSkinIndex(i => Math.max(0, i - 1))}>
                    <Text style={styles.buttonText}>◀</Text>
                </Pressable>
                <View style={{ flexDirection: 'row', marginHorizontal: 8 }}>
                    {visibleSkins.map(tone => (
                        <Pressable
                            key={tone}
                            style={{
                                width: 24,
                                height: 24,
                                backgroundColor: characterAssets[character.gender].head[tone].previewColor || '#999',
                                borderRadius: 4,
                                marginHorizontal: 4,
                                borderWidth: character.skinTone === tone ? 2 : 1,
                                borderColor: character.skinTone === tone ? '#fff' : '#666',
                            }}
                            onPress={() => setCharacter(prev => ({ ...prev, skinTone: tone }))}
                        />
                    ))}
                </View>
                <Pressable onPress={() => setSkinIndex(i => Math.min(SKIN_TONES.length - 4, i + 1))}>
                    <Text style={styles.buttonText}>▶</Text>
                </Pressable>
            </View>

            <SelectorRow label="Eyes" value={character.eyes} onChange={dir => updatePart('eyes', dir)} />
            <SelectorRow label="Hair" value={character.hair} onChange={dir => updatePart('hair', dir)} />

            <View style={styles.colorRow}>
                <Text style={styles.label}>Hair Color:</Text>
                <View style={{ flexDirection: 'row', marginLeft: 8 }}>
                    {HAIR_COLORS.map(color => (
                        <ColorSwatch
                            key={color}
                            color={color}
                            selected={character.hairColor === color}
                            onPress={() => setCharacter(prev => ({ ...prev, hairColor: color }))}
                        />
                    ))}
                </View>
            </View>

            {(character.gender !== 'male' || !character.beard?.includes('full')) && (
                <SelectorRow label="Mouth" value={character.mouth} onChange={dir => updatePart('mouth', dir)} />
            )}

            {character.gender === 'male' && (
                <SelectorRow label="Beard" value={character.beard || 'none'} onChange={dir => updatePart('beard', dir)} />
            )}

            <SelectorRow label="Mark" value={character.markings || 'none'} onChange={dir => updatePart('markings', dir)} />

            <Pressable style={styles.button} onPress={() => setCharacter(generateRandomCharacter())}>
                <Text style={styles.buttonText}>🎲 Random</Text>
            </Pressable>
        </View>
    );
};

export default CharacterCreationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111',
        alignItems: 'center',
        paddingTop: 40,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        marginBottom: 20,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
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
    selectorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
    },
    selectorButton: {
        backgroundColor: '#222',
        padding: 6,
        borderRadius: 4,
        marginHorizontal: 8,
    },
    selectorValue: {
        color: '#fff',
        fontSize: 16,
        width: 110,
        textAlign: 'center',
    },
    colorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
});
