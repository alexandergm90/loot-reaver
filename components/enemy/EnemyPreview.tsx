import { EnemyAnimation, EnemyInstance } from '@/types/enemy';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, View } from 'react-native';

interface EnemyPreviewProps {
  enemy: EnemyInstance;
  containerWidth?: number;
  containerHeight?: number;
  showAnimation?: boolean;
}

export default function EnemyPreview({
  enemy,
  containerWidth = 100,
  containerHeight = 100,
  showAnimation = true,
}: EnemyPreviewProps) {
  const [animation, setAnimation] = useState<EnemyAnimation>({
    isPlaying: false,
    currentFrame: 0,
    startTime: 0,
  });

  const animationRef = useRef<Animated.Value>(new Animated.Value(0));

  useEffect(() => {
    if (showAnimation) {
      startIdleAnimation();
    }
  }, [showAnimation]);

  const startIdleAnimation = () => {
    setAnimation({
      isPlaying: true,
      currentFrame: 0,
      startTime: Date.now(),
    });

    // Create a looping animation
    const animate = () => {
      const now = Date.now();
      const elapsed = now - animation.startTime;
      const progress = (elapsed % enemy.template.animation.idle.duration) / enemy.template.animation.idle.duration;
      
      animationRef.current.setValue(progress);
      
      if (animation.isPlaying) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  const stopAnimation = () => {
    setAnimation({
      isPlaying: false,
      currentFrame: 0,
      startTime: 0,
    });
  };

  const renderEnemyPart = (part: any, index: number) => {
    const { image, width, height, offsetX = 0, offsetY = 0, zIndex = 0 } = part;
    
    // Calculate scaling based on container size
    const scale = Math.min(containerWidth / 64, containerHeight / 64);
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    const scaledOffsetX = offsetX * scale;
    const scaledOffsetY = offsetY * scale;

    // Add subtle animation to the part
    const animatedStyle = showAnimation ? {
      transform: [
        {
          translateY: animationRef.current.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, -2, 0],
          }),
        },
        {
          scale: animationRef.current.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 1.02, 1],
          }),
        },
      ],
    } : {};

    return (
      <Animated.View
        key={index}
        style={[
          {
            position: 'absolute',
            left: scaledOffsetX,
            top: scaledOffsetY,
            width: scaledWidth,
            height: scaledHeight,
            zIndex,
          },
          animatedStyle,
        ]}
      >
        <Image
          source={image}
          style={{
            width: '100%',
            height: '100%',
          }}
          resizeMode="contain"
        />
      </Animated.View>
    );
  };

  return (
    <View
      style={{
        width: containerWidth,
        height: containerHeight,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Render all enemy parts in order */}
      {Object.values(enemy.template.parts).map((part, index) => 
        renderEnemyPart(part, index)
      )}
    </View>
  );
}
