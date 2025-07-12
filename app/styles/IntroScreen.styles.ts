import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
        marginBottom: 32,
    },
    progressBar: {
        width: 250,
        height: 12,
        backgroundColor: '#222',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#f0b90b',
    },
    loadingText: {
        marginTop: 24,
        fontSize: 16,
        color: '#fff',
    },
});

export default styles;
