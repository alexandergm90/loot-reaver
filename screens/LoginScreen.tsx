import { getOrCreatePlayerId } from '@/auth/device';
import { useFacebookLogin } from '@/auth/useFacebookLogin';
import { useEffect, useState } from 'react';
import { Button } from 'react-native';

export default function LoginScreen() {
    const [playerId, setPlayerId] = useState<string | null>(null);

    useEffect(() => {
        getOrCreatePlayerId().then(setPlayerId);
    }, []);

    const { loginWithFacebook, request } = useFacebookLogin(playerId || '');

    return <Button title="Login with Facebook" onPress={loginWithFacebook} disabled={!request} />;
}
