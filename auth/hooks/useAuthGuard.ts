import { ROUTES } from '@/constants/routes';
import { getAuthenticatedUser } from '@/auth/services/authService';
import { usePlayerStore } from '@/store/playerStore';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

// Type alias for guard status.
type GuardStatus = 'pending' | 'ok' | 'unauthorized';

// Constants for auth guard status.
const STATUS_PENDING: GuardStatus = 'pending';
const STATUS_UNAUTHORIZED: GuardStatus = 'unauthorized';
const STATUS_OK: GuardStatus = 'ok';

export function useAuthGuard(requireCharacter = true): GuardStatus {
    const [status, setStatus] = useState<GuardStatus>(STATUS_PENDING);

    const player = usePlayerStore((state) => state.player);
    const setPlayer = usePlayerStore((state) => state.setPlayer);

    const checkAuthStatus = async () => {
        if (player) {
            if (requireCharacter && !player.hasCharacter) {
                setStatus(STATUS_UNAUTHORIZED);
                router.replace(ROUTES.register);
                return;
            }

            setStatus(STATUS_OK);
            return;
        }

        const user = await getAuthenticatedUser();

        if (!user || (requireCharacter && !user.hasCharacter)) {
            setStatus(STATUS_UNAUTHORIZED);
            router.replace(requireCharacter ? ROUTES.register : ROUTES.main);
            return;
        }

        setPlayer(user);
        setStatus(STATUS_OK);
    };

    // Effect to check auth status on mount and when dependencies change.
    useEffect(() => {
        checkAuthStatus();
    }, [requireCharacter, player]);

    return status;
}
