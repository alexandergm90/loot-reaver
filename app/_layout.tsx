// app/_layout.tsx
import {
    Cinzel_400Regular,
    Cinzel_700Bold,
    Cinzel_900Black,
    useFonts,
} from '@expo-google-fonts/cinzel';
import * as NavigationBar from 'expo-navigation-bar';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { setCustomText, setCustomTextInput } from 'react-native-global-props';
import 'react-native-reanimated'; // MUST be first import on native
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Cinzel_400Regular,
        Cinzel_700Bold,
        Cinzel_900Black,
    });

    useEffect(() => {
        if (!fontsLoaded) return;

        // Global defaults for all <Text> and <TextInput />
        setCustomText({
            style: {
                fontFamily: 'Cinzel_700Bold',
                includeFontPadding: false, // nicer on Android
                textTransform: 'none',
            },
            allowFontScaling: false,
        });

        setCustomTextInput({
            style: {
                fontFamily: 'Cinzel_400Regular',
            },
            allowFontScaling: false,
        });

        // Ensure system UI (status/home areas) uses dark background
        SystemUI.setBackgroundColorAsync('#1a120a');
        
        // Android navigation bar transparency
        NavigationBar.setBackgroundColorAsync('transparent');
        NavigationBar.setBehaviorAsync('overlay-swipe');

        SplashScreen.hideAsync();
    }, [fontsLoaded]);

    // Keep splash visible until fonts are ready
    if (!fontsLoaded) {
        return <View style={{ flex: 1, backgroundColor: 'black' }} />;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#1a120a' }}>
            <SafeAreaProvider style={{ backgroundColor: '#1a120a' }}>
                <StatusBar style="light" translucent backgroundColor="transparent" />
                <Slot />
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
