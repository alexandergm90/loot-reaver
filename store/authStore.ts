import * as SecureStore from 'expo-secure-store';

let token: string | null = null;

export async function loadToken() {
    token = await SecureStore.getItemAsync('access_token');
    return token;
}

export function getToken() {
    return token;
}