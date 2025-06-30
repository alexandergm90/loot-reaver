import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type Props = {
    label: string;
    value: string;
    onChange: (direction: 'next' | 'prev') => void;
};

const SelectorRow: React.FC<Props> = ({ label, value, onChange }) => (
    <View style={styles.selectorRow}>
        <Text style={styles.label}>{label}:</Text>
        <Pressable style={styles.button} onPress={() => onChange('prev')}>
            <Text style={styles.buttonText}>◀</Text>
        </Pressable>
        <Text style={styles.value}>{value}</Text>
        <Pressable style={styles.button} onPress={() => onChange('next')}>
            <Text style={styles.buttonText}>▶</Text>
        </Pressable>
    </View>
);

export default SelectorRow;

const styles = StyleSheet.create({
    selectorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
    },
    label: {
        color: '#fff',
        fontSize: 16,
        marginRight: 8,
    },
    value: {
        color: '#fff',
        fontSize: 16,
        width: 110,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#222',
        padding: 6,
        borderRadius: 4,
        marginHorizontal: 8,
    },
    buttonText: {
        color: '#fff',
    },
});
