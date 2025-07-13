import { useCharacterStore } from '@/store/characterStore';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TRAITS } from '@/data/traits';

type Props = {};

const TraitStep: React.FC<Props> = () => {
    const selected = useCharacterStore((s) => s.trait);
    const setTrait = useCharacterStore((s) => s.setTrait);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Choose a Trait</Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                {TRAITS.map((trait) => (
                    <Pressable
                        key={trait.id}
                        onPress={() => setTrait(trait.id)}
                        style={[
                            styles.traitBox,
                            selected === trait.id && { borderColor: '#fff', borderWidth: 2 },
                            { backgroundColor: trait.previewColor },
                        ]}
                    >
                        <Text style={styles.traitLabel}>{trait.label}</Text>
                    </Pressable>
                ))}
            </ScrollView>

            {selected && (
                <View style={styles.descriptionBox}>
                    <Text style={styles.traitTitle}>
                        {TRAITS.find((t) => t.id === selected)?.label}
                    </Text>
                    <Text style={styles.traitDescription}>
                        {TRAITS.find((t) => t.id === selected)?.description}
                    </Text>
                    <Text style={styles.traitBonus}>
                        {TRAITS.find((t) => t.id === selected)?.bonus}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default TraitStep;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#111',
    },
    title: {
        fontSize: 22,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    scrollContainer: {
        paddingHorizontal: 12,
    },
    traitBox: {
        width: 120,
        height: 100,
        borderRadius: 8,
        marginHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    traitLabel: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    descriptionBox: {
        marginTop: 24,
        padding: 16,
        backgroundColor: '#222',
        borderRadius: 8,
    },
    traitTitle: {
        color: '#fff',
        fontSize: 18,
        marginBottom: 6,
    },
    traitDescription: {
        color: '#ccc',
        marginBottom: 4,
    },
    traitBonus: {
        color: '#ffd700',
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
});
