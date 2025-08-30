import React from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
    label: string;
    item?: any | null;
    onPress?: (i: any) => void;
    fallback?: string;
};

const SlotChip: React.FC<Props> = ({ label, item, onPress, fallback }) => {
    const text = item?.template?.name || fallback || label;
    const clickable = !!item;
    const Comp: any = clickable ? Pressable : View;
    return (
        <Comp onPress={clickable ? () => onPress && onPress(item) : undefined} className="px-2 py-1 rounded-xl border-2 border-stone-900 bg-amber-100/80">
            <Text className="text-[10px] font-black">{text}</Text>
        </Comp>
    );
};

export default SlotChip;


