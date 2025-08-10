import { Slot } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { useAuthGuard } from '@/auth/hooks/useAuthGuard';

export default function MainLayout() {
    const status = useAuthGuard(true); // requireCharacter = true

    if (status !== 'ok') return null; // guard will redirect as needed

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#111' }}>
            <View style={{ flex: 1 }}>
                <Slot />
            </View>
        </SafeAreaView>
    );
}