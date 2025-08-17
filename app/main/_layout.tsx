import { useAuthGuard } from '@/auth/hooks/useAuthGuard';
import TopBar from '@/components/ui/TopBar';
import { Slot } from 'expo-router';
import { ImageBackground, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MainLayout() {
    const status = useAuthGuard(true); // requireCharacter = true

    if (status !== 'ok') return null; // guard will redirect as needed

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#111' }}>
            <ImageBackground
                source={require('@/assets/images/parchment_texture_orange.png')}
                resizeMode="cover"
                style={{ flex: 1 }}
            >
                <View style={{ flex: 1 }}>
                    <TopBar />
                    <Slot />
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
}
