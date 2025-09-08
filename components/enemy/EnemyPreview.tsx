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
    const { image, width, height, left = 0, top = 0, zIndex = 0, rotation = 0 } = part;
    
    // Calculate scaling based on container size
    const scale = Math.min(containerWidth / 140, containerHeight / 136); // Use actual enemy size as base
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    const scaledLeft = left * scale;
    const scaledTop = top * scale;

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
        {
          rotate: `${rotation}deg`,
        },
      ],
    } : {
      transform: [
        {
          rotate: `${rotation}deg`,
        },
      ],
    };

    return (
      <Animated.View
        key={index}
        style={[
          {
            position: 'absolute',
            left: scaledLeft,
            top: scaledTop,
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

  // Flatten all parts for rendering
  const getAllParts = () => {
    const parts: any[] = [];
    const template = enemy.template;
    
    // Add body
    parts.push(template.parts.body);
    
    // Add head
    parts.push(template.parts.head);
    
    // Add feet (render before hands for proper layering)
    parts.push(template.parts.feet.left);
    parts.push(template.parts.feet.right);
    
    // Add hands
    parts.push(template.parts.hands.left);
    parts.push(template.parts.hands.right);
    
    // Add weapon (on top)
    parts.push(template.parts.weapon);
    
    return parts;
  };

  return (
    <View
      style={{
        width: containerWidth,
        height: containerHeight,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        transform: enemy.template.rotate ? [{ scaleX: -1 }] : undefined, // Horizontal flip if needed
      }}
    >
      {/* Render all enemy parts in order */}
      {getAllParts().map((part, index) => 
        renderEnemyPart(part, index)
      )}
    </View>
  );
}
