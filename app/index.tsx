import CharacterCreationScreen from '@/screens/CharacterCreationScreen';
import LoginScreen from '@/screens/LoginScreen';
import { SafeAreaView } from 'react-native';

export default function Page() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <LoginScreen />
            {/*<CharacterCreationScreen />*/}

        </SafeAreaView>
    );
}
