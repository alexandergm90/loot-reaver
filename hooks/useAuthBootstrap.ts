import { useEffect, useState } from 'react';
import { bootstrapAuth } from '@/services/authService';

export function useAuthBootstrap() {
    const [status, setStatus] = useState<'pending' | 'login' | 'character' | 'game'>('pending');

    useEffect(() => {
        bootstrapAuth().then(setStatus);
    }, []);

    return status;
}
