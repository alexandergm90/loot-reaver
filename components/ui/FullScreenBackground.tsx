import React from 'react';
import { ImageBackground, StyleSheet, View, ViewStyle } from 'react-native';
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

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {backgroundImage && (
        <ImageBackground
          source={backgroundImage}
          style={StyleSheet.absoluteFill}
          imageStyle={{ resizeMode: 'cover' }}
        />
      )}
      <View style={[
        styles.content,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
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
