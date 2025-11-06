import { useAuthGuard } from '@/auth/hooks/useAuthGuard';
import FullScreenBackground from '@/components/ui/FullScreenBackground';
import TopBar from '@/components/ui/TopBar';
import { Slot, usePathname } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MainLayout() {
    const status = useAuthGuard(true); // requireCharacter = true
    const pathname = usePathname();

    if (status !== 'ok') return null; // guard will redirect as needed

    // Hide TopBar on combat page
    const isCombatPage = pathname === '/main/combat';

    // For combat page, use clean layout without TopBar
    if (isCombatPage) {
        return (
            <View style={{ flex: 1 }}>
                <Slot />
            </View>
        );
    }

    // Normal layout for other pages with global background
    return (
        <FullScreenBackground
            backgroundImage={require('@/assets/images/runed_rock.png')}
            backgroundColor="#111"
        >
            <SafeAreaView style={{ flex: 1 }}>
                <TopBar />
                <Slot />
            </SafeAreaView>
        </FullScreenBackground>
    );
}
