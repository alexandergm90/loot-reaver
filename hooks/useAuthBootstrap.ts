import { bootstrapAuth } from '@/services/authService';
import { useEffect, useState, useCallback } from 'react';

export function useAuthBootstrap() {
    const [status, setStatus] = useState<'pending' | 'login' | 'character' | 'game' | 'error'>('pending');
    const [error, setError] = useState<null | 'network' | 'unauthorized' | 'unknown'>(null);

    const runBootstrap = useCallback(async () => {
        setStatus('pending');
        setError(null);

        try {
            const result = await bootstrapAuth();

            console.log('[useAuthBootstrap] bootstrapAuth result:', result);

            if (result === 'error-network') {
                setError('network');
                setStatus('error');
            } else if (result === 'error-auth') {
                setError('unauthorized');
                setStatus('login');
            } else {
                setStatus(result); // 'login' | 'character' | 'game'
            }
        } catch (err) {
            console.error('[useAuthBootstrap] Unexpected error:', err);
            setError('unknown');
            setStatus('error');
        }
    }, []);

    useEffect(() => {
        runBootstrap();
    }, [runBootstrap]);

    return { status, error, retry: runBootstrap };
}
