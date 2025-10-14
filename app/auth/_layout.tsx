import FullScreenBackground from '@/components/ui/FullScreenBackground';
import { Slot } from 'expo-router';

export default function AuthLayout() {
    return (
        <FullScreenBackground
            backgroundImage={require('@/assets/images/dark_leather.png')}
            backgroundColor="#1a120a"
        >
            <Slot />
        </FullScreenBackground>
    );
}
