import { View } from 'react-native';
import { Slot } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthLayout() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#111' }}>
            <View style={{ flex: 1 }}>
                <Slot />
            </View>
        </SafeAreaView>
    );
}
