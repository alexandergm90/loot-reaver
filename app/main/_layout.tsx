import { useAuthGuard } from '@/auth/hooks/useAuthGuard';
import BottomNav from '@/components/ui/BottomNav';
import FullScreenBackground from '@/components/ui/FullScreenBackground';
import TopBar from '@/components/ui/TopBar';
import { HIDE_BOTTOM_NAV_ROUTES } from '@/constants/routes';
import { Slot, usePathname } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MainLayout() {
    const status = useAuthGuard(true); // requireCharacter = true
    const pathname = usePathname();

    if (status !== 'ok') return null; // guard will redirect as needed

    // Hide TopBar and BottomNav on combat page
    const isCombatPage = pathname === '/main/combat';
    const shouldShowBottomNav = !(HIDE_BOTTOM_NAV_ROUTES as readonly string[]).includes(pathname);

    // For combat page, use clean layout without TopBar or BottomNav
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
            <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
                <TopBar />
                <Slot />
                {shouldShowBottomNav && <BottomNav />}
            </SafeAreaView>
        </FullScreenBackground>
    );
}
