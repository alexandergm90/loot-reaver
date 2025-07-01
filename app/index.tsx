import CharacterCreationScreen from '@/screens/CharacterCreationScreen';
import { SafeAreaView } from 'react-native';

export default function Page() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <CharacterCreationScreen />
        </SafeAreaView>
    );
}
