import { useEffect } from 'react';
import { Button, Text, View } from 'react-native';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const FB_APP_ID = 'xxxxxxxxxxxxxxxxx';

export default function FacebookLoginScreen() {
    const [request, response, promptAsync] = Facebook.useAuthRequest({
        clientId: FB_APP_ID,
        redirectUri: 'https://auth.expo.io/@alexander90/loot-reaver',
        scopes: ['public_profile'],
        extraParams: {
            auth_type: 'rerequest', // <- important
            scope: 'public_profile', // <- force this as raw string
        },
    });

    useEffect(() => {
        if (response?.type === 'success' && response.authentication?.accessToken) {
            console.log('✅ FB token:', response.authentication.accessToken);
        } else if (response?.type === 'error') {
            console.warn('❌ FB login error:', response.error);
        }
    }, [response]);

    return (
        <View style={{ padding: 24 }}>
            <Text>Facebook Login Test</Text>
            <Button
                title="Login with Facebook"
                disabled={!request}
                onPress={() => {
                    console.log('🟦 FB Login Clicked');
                    promptAsync({ useProxy: true } as any); // <- crucial
                }}
            />
        </View>
    );
}
