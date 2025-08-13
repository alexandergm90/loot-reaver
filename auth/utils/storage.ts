import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// set to false if you want to force AsyncStorage for all platforms in dev
/*const useSecureStore =
    Platform.OS === 'ios' ||
    (Platform.OS === 'android' && !__DEV__);*/
const useSecureStore = false;

const storage = {
    async getItem(key: string): Promise<string | null> {
        // console.log(`[storage] using ${useSecureStore ? 'SecureStore' : 'AsyncStorage'} for ${key}`);

        if (useSecureStore) {
            return SecureStore.getItemAsync(key);
        } else {
            return AsyncStorage.getItem(key);
        }
    },

    async setItem(key: string, value: string): Promise<void> {
        // console.log(`[storage] using ${useSecureStore ? 'SecureStore' : 'AsyncStorage'} for ${key}`);
        if (useSecureStore) {
            return SecureStore.setItemAsync(key, value, {
                keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            });
        } else {
            return AsyncStorage.setItem(key, value);
        }
    },

    async deleteItem(key: string): Promise<void> {
        if (useSecureStore) {
            return SecureStore.deleteItemAsync(key);
        } else {
            return AsyncStorage.removeItem(key);
        }
    },
};

export default storage;
