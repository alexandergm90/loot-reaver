import { loginToBackendWithFacebook } from '@/services/authService';
import { useEffect } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as Facebook from 'expo-auth-session/providers/facebook';

export function useFacebookLogin(playerId: string | null) {
    const redirectUri = AuthSession.makeRedirectUri({
        useProxy: true,
    } as any);

    const [request, response, promptAsync] = Facebook.useAuthRequest({
        clientId: '619505510644125',
        scopes: ['public_profile', 'email'],
        redirectUri,
    });

    useEffect(() => {
        if (response?.type === 'success' && playerId) {
            const accessToken = response.authentication?.accessToken;
            if (accessToken) {
                loginToBackendWithFacebook(playerId, accessToken)
                    .then((token) => console.log('✅ FB logged in:', token))
                    .catch((err) => console.error('❌ Login failed:', err));
            }
        }
    }, [response]);

    return {
        loginWithFacebook: () => promptAsync({ useProxy: true } as any),
        request,
    };
}
