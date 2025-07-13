import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CharacterCustomizer from '@/components/character/CharacterCustomizer';

type Props = {};

const CharacterStep: React.FC<Props> = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Your Character</Text>

            <CharacterCustomizer />
        </View>
    );
};

export default CharacterStep;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: '#111',
    },
    title: {
        color: '#fff',
        fontSize: 22,
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 16,
    },
    button: {
        marginTop: 32,
        alignSelf: 'center',
        width: 240,
    },
});
