import { ImageStyle } from 'react-native';

export const getAssetStyle = (
    width: number,
    height: number,
    top: number = 0,
    left: number = 0,
): ImageStyle => ({
    position: 'absolute',
    width,
    height,
    top,
    left,
});
