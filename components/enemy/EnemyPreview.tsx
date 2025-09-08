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
  const isAnimatingRef = useRef<boolean>(false);

  useEffect(() => {
    if (showAnimation) {
      startIdleAnimation();
    } else {
      stopAnimation();
    }

    // Cleanup animation on unmount
    return () => {
      stopAnimation();
    };
  }, [showAnimation]);

  const startIdleAnimation = () => {
    const startTime = Date.now();
    isAnimatingRef.current = true;
    
    setAnimation({
      isPlaying: true,
      currentFrame: 0,
      startTime,
    });

    // Create a looping animation
    const animate = () => {
      if (!isAnimatingRef.current) return;
      
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = (elapsed % enemy.template.animation.idle.duration) / enemy.template.animation.idle.duration;
      
      animationRef.current.setValue(progress);
      
      // Continue animation if still playing
      if (isAnimatingRef.current) {
        requestAnimationFrame(animate);
      }
    };

    // Start the animation loop
    requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    isAnimatingRef.current = false;
    setAnimation({
      isPlaying: false,
      currentFrame: 0,
      startTime: 0,
    });
  };

  const renderEnemyPart = (part: any, index: number) => {
    const { image, width, height, left = 0, top = 0, zIndex = 0, rotation = 0, name } = part;
    
    // Calculate scaling based on container size
    const scale = Math.min(containerWidth / 140, containerHeight / 136); // Use actual enemy size as base
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    const scaledLeft = left * scale;
    const scaledTop = top * scale;

    // Different animation patterns for different body parts
    const getPartAnimation = () => {
      if (!showAnimation) {
        return {
          transform: [{ rotate: `${rotation}deg` }],
        };
      }

      const baseRotation = rotation;

      switch (name) {
        case 'body':
          // Body: gentle breathing motion
          return {
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
              { rotate: `${baseRotation}deg` },
            ],
          };

        case 'head':
          // Head: subtle bobbing and looking around
          return {
            transform: [
              {
                translateY: animationRef.current.interpolate({
                  inputRange: [0, 0.25, 0.5, 0.75, 1],
                  outputRange: [0, -0.5, 0.3, -0.5, 0],
                }),
              },
              {
                translateX: animationRef.current.interpolate({
                  inputRange: [0, 0.3, 0.7, 1],
                  outputRange: [0, 0.5, -0.5, 0],
                }),
              },
              {
                rotate: animationRef.current.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [`${baseRotation}deg`, `${baseRotation + 1}deg`, `${baseRotation}deg`],
                }),
              },
            ],
          };

        case 'hand_left':
          // Left hand: gentle swinging motion
          return {
            transform: [
              {
                translateY: animationRef.current.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, -1.5, 0],
                }),
              },
              {
                translateX: animationRef.current.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, -1, 0],
                }),
              },
              {
                rotate: animationRef.current.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [`${baseRotation}deg`, `${baseRotation - 5}deg`, `${baseRotation}deg`],
                }),
              },
            ],
          };

        case 'hand_right':
          // Right hand: same pattern as left hand for weapon alignment
          return {
            transform: [
              {
                translateY: animationRef.current.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, -1.5, 0],
                }),
              },
              {
                translateX: animationRef.current.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1, 0],
                }),
              },
              {
                rotate: animationRef.current.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [`${baseRotation}deg`, `${baseRotation + 5}deg`, `${baseRotation}deg`],
                }),
              },
            ],
          };

        case 'foot_left':
          // Left foot: very subtle movement
          return {
            transform: [
              {
                translateY: animationRef.current.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.3, 0],
                }),
              },
              {
                translateX: animationRef.current.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, -0.3, 0],
                }),
              },
              {
                rotate: animationRef.current.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [`${baseRotation}deg`, `${baseRotation - 1}deg`, `${baseRotation}deg`],
                }),
              },
            ],
          };

        case 'foot_right':
          // Right foot: very subtle opposite movement
          return {
            transform: [
              {
                translateY: animationRef.current.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, -0.3, 0],
                }),
              },
              {
                translateX: animationRef.current.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.3, 0],
                }),
              },
              {
                rotate: animationRef.current.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [`${baseRotation}deg`, `${baseRotation + 1}deg`, `${baseRotation}deg`],
                }),
              },
            ],
          };

        case 'weapon':
          // Weapon: same movement as right hand for perfect alignment
          return {
            transform: [
              {
                translateY: animationRef.current.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, -1.5, 0],
                }),
              },
              {
                translateX: animationRef.current.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1, 0],
                }),
              },
              {
                rotate: animationRef.current.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [`${baseRotation}deg`, `${baseRotation + 5}deg`, `${baseRotation}deg`],
                }),
              },
            ],
          };

        default:
          // Default: gentle breathing
          return {
            transform: [
              {
                translateY: animationRef.current.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, -1, 0],
                }),
              },
              { rotate: `${baseRotation}deg` },
            ],
          };
      }
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
          getPartAnimation(),
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
