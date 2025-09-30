import React from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';

type LRTextProps = TextProps & {
    weight?: 'regular' | 'bold' | 'black';
    style?: StyleProp<TextStyle>;
};

const FONT_BY_WEIGHT: Record<NonNullable<LRTextProps['weight']>, string> = {
    regular: 'Cinzel_400Regular',
    bold: 'Cinzel_700Bold',
    black: 'Cinzel_900Black',
};

const LRText: React.FC<LRTextProps> = ({ weight = 'bold', style, children, ...rest }) => {
    const fontFamily = FONT_BY_WEIGHT[weight];
    const merged: StyleProp<TextStyle> = [
        { fontFamily },
        ...(Array.isArray(style) ? style : style ? [style] : []),
    ];

    return (
        <Text {...rest} style={merged}>
            {children}
        </Text>
    );
};

export default LRText;


