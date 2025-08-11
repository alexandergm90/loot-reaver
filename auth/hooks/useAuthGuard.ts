import { useSession } from '@/auth/hooks/useSession';
import { ROUTES } from '@/constants/routes';
import { useEffect, useRef } from 'react';
import { router } from 'expo-router';

type GuardStatus = 'pending' | 'ok' | 'unauthorized';

export function useAuthGuard(requireCharacter = true): GuardStatus {
    const { isAuthenticated, hasCharacter, isLoading } = useSession();
    const didRedirect = useRef(false);

    useEffect(() => {
        if (didRedirect.current || isLoading) return;

        if (!isAuthenticated) {
            didRedirect.current = true;
            router.replace(ROUTES.intro);
            return;
        }

        if (requireCharacter && !hasCharacter) {
            didRedirect.current = true;
            router.replace(ROUTES.register);
            return;
        }
    }, [isAuthenticated, hasCharacter, isLoading, requireCharacter]);

    if (isLoading) return 'pending';
    if (!isAuthenticated || (requireCharacter && !hasCharacter)) return 'unauthorized';
    return 'ok';
}
