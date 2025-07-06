import { loginToBackendWithFacebook } from '@/services/authService';
import { useEffect } from 'react';
import * as Facebook from 'expo-auth-session/providers/facebook';

export function useFacebookLogin(playerId: string) {
    const [request, response, promptAsync] = Facebook.useAuthRequest({
        clientId: '619505510644125',
        scopes: ['public_profile', 'email'],
    });

    useEffect(() => {
        if (response?.type === 'success') {
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
