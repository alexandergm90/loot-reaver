// TypeScript declaration for React Native's resolveAssetSource
declare module 'react-native/Libraries/Image/resolveAssetSource' {
  interface AssetSource {
    width: number;
    height: number;
    uri: string;
    scale?: number;
  }
  
  function resolveAssetSource(source: any): AssetSource | null;
  export default resolveAssetSource;
}
