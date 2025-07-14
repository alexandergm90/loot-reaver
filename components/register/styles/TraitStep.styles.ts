import { StyleSheet } from 'react-native';

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
    traitSlider: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 24,
    },
    traitBox: {
        width: 120,
        height: 100,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    traitLabel: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    arrowButton: {
        minWidth: 36,
        height: 36,
    },
    descriptionBox: {
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
});

export default styles;