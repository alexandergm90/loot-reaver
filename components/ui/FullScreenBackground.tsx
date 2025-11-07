import React from 'react';
import { Dimensions, ImageBackground, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FullScreenBackgroundProps {
  children: React.ReactNode;
  backgroundImage?: any;
  backgroundColor?: string;
  contentStyle?: ViewStyle;
}

export default function FullScreenBackground({
  children,
  backgroundImage,
  backgroundColor = '#1a120a',
  contentStyle,
}: FullScreenBackgroundProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {backgroundImage && (
        <ImageBackground
          source={backgroundImage}
          style={[StyleSheet.absoluteFill, { width: screenWidth, height: screenHeight }]}
          resizeMode="cover"
        />
      )}
      <View style={[
        styles.content,
        { paddingBottom: insets.bottom },
        contentStyle
      ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
