declare module 'react-native-global-props' {
    import type { TextProps, TextInputProps } from 'react-native';

    /** Apply default props to all <Text> */
    export function setCustomText(customProps: Partial<TextProps>): void;

    /** Apply default props to all <TextInput> */
    export function setCustomTextInput(customProps: Partial<TextInputProps>): void;
}