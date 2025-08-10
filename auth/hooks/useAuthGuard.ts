// auth/hooks/useAuthGuard.ts
import { ROUTES } from '@/constants/routes';
import { useSession } from '@/auth/hooks/useSession';
import { useEffect } from 'react';
import { router } from 'expo-router';

type GuardStatus = 'pending' | 'ok' | 'unauthorized';

export function useAuthGuard(requireCharacter = true): GuardStatus {
    const { isAuthenticated, hasCharacter, isLoading } = useSession();

    useEffect(() => {
        if (isLoading) return; // Still loading

        if (!isAuthenticated) {
            router.replace(ROUTES.intro);
            return;
        }

        if (requireCharacter && !hasCharacter) {
            router.replace(ROUTES.register);
            return;
        }
    }, [isAuthenticated, hasCharacter, isLoading, requireCharacter]);

    if (isLoading) return 'pending';
    if (!isAuthenticated || (requireCharacter && !hasCharacter)) return 'unauthorized';
    return 'ok';
}