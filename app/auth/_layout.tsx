import { Slot } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthLayout() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
            <View style={{ flex: 1 }}>
                <Slot />
            </View>
        </SafeAreaView>
    );
}
