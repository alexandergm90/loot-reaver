import { bootstrapAuth } from '@/services/authService';
import { useEffect, useState } from 'react';

export function useAuthBootstrap() {
    const [status, setStatus] = useState<'pending' | 'login' | 'character' | 'game'>('pending');

    useEffect(() => {
        bootstrapAuth().then(setStatus);
    }, []);

    return status;
}
