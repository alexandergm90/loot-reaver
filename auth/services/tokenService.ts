import storage from '@/auth/utils/storage';

export interface TokenData {
    access_token: string;
    expires_at?: number;
}

class TokenService {
    private readonly TOKEN_KEY = 'access_token';
    private readonly EXPIRES_KEY = 'token_expires_at';

    async getToken(): Promise<string | null> {
        const token = await storage.getItem(this.TOKEN_KEY);
        if (!token) return null;

        // Check if token is expired
        const expiresAt = await storage.getItem(this.EXPIRES_KEY);
        if (expiresAt && Date.now() > parseInt(expiresAt)) {
            await this.clearToken();
            return null;
        }

        return token;
    }

    async setToken(tokenData: TokenData): Promise<void> {
        await storage.setItem(this.TOKEN_KEY, tokenData.access_token);
        if (tokenData.expires_at) {
            await storage.setItem(this.EXPIRES_KEY, tokenData.expires_at.toString());
        }
    }

    async clearToken(): Promise<void> {
        await storage.deleteItem(this.TOKEN_KEY);
        await storage.deleteItem(this.EXPIRES_KEY);
    }

    async isTokenValid(): Promise<boolean> {
        const token = await this.getToken();
        return token !== null;
    }
}

export const tokenService = new TokenService();
