import { Platform } from 'react-native';

const LOCAL_DEV_IP = '192.168.1.4';
export const API_BASE =
    Platform.OS === 'ios' || Platform.OS === 'android'
        ? `http://${LOCAL_DEV_IP}:3000`
        : 'http://localhost:3000';
