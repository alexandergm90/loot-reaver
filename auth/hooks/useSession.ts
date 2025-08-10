import { getAuthenticatedUser } from '@/auth/services/authService';
import { tokenService } from '@/auth/services/tokenService';
import storage from '@/auth/utils/storage';
import { usePlayerStore } from '@/store/playerStore';
import { useEffect, useState } from 'react';

export interface SessionState {
    isAuthenticated: boolean;
    hasCharacter: boolean;
    isLoading: boolean;
    error: string | null;
}

export function useSession() {
    const [state, setState] = useState<SessionState>({
        isAuthenticated: false,
        hasCharacter: false,
        isLoading: true,
        error: null,
    });

    const { player, setPlayer, clearPlayer, setHasHydrated } = usePlayerStore();

    const loadSession = async () => {
        try {
            setState((prev) => ({ ...prev, isLoading: true, error: null }));

            // Check if we have a valid token
            const hasValidToken = await tokenService.isTokenValid();

            if (!hasValidToken) {
                setState({
                    isAuthenticated: false,
                    hasCharacter: false,
                    isLoading: false,
                    error: null,
                });
                return;
            }

            // Optimistically use user data from store if present (but still refresh from API)
            if (player) {
                setState({
                    isAuthenticated: true,
                    hasCharacter: player.hasCharacter,
                    isLoading: true,
                    error: null,
                });
            }

            // Try to load from storage (but still refresh from API)
            const savedPlayer = await storage.getItem('player');
            if (savedPlayer && !player) {
                try {
                    const parsedPlayer = JSON.parse(savedPlayer);
                    setPlayer(parsedPlayer);
                    setState({
                        isAuthenticated: true,
                        hasCharacter: parsedPlayer.hasCharacter,
                        isLoading: true,
                        error: null,
                    });
                } catch (err) {
                    console.warn('Invalid player data in storage');
                    await storage.deleteItem('player');
                }
            }

            // Fetch fresh user data (authoritative)
            const user = await getAuthenticatedUser();
            if (user) {
                setPlayer(user);
                await storage.setItem('player', JSON.stringify(user));
                setState({
                    isAuthenticated: true,
                    hasCharacter: user.hasCharacter,
                    isLoading: false,
                    error: null,
                });
            } else {
                await tokenService.clearToken();
                setState({
                    isAuthenticated: false,
                    hasCharacter: false,
                    isLoading: false,
                    error: null,
                });
            }
        } catch (err) {
            console.error('Session loading error:', err);
            setState({
                isAuthenticated: false,
                hasCharacter: false,
                isLoading: false,
                error: err instanceof Error ? err.message : 'Unknown error',
            });
        } finally {
            setHasHydrated();
        }
    };

    const logout = async () => {
        await tokenService.clearToken();
        await storage.deleteItem('player');
        clearPlayer();
        setState({
            isAuthenticated: false,
            hasCharacter: false,
            isLoading: false,
            error: null,
        });
    };

    useEffect(() => {
        loadSession();
    }, []);

    // Reflect store changes immediately in session derived flags
    useEffect(() => {
        setState((prev) => ({
            ...prev,
            isAuthenticated: !!player,
            hasCharacter: !!player?.hasCharacter,
        }));
    }, [player]);

    return {
        ...state,
        player,
        loadSession,
        logout,
    };
}
