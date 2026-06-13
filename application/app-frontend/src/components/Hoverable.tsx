import React, { useState } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  hoverStyle?: StyleProp<ViewStyle> | false;
  children: React.ReactNode | ((hovered: boolean) => React.ReactNode);
};

export function Hoverable({ style, hoverStyle, children, ...rest }: Props) {
  const [hovered, setHovered] = useState(false);
  const content = typeof children === 'function' ? (children as (h: boolean) => React.ReactNode)(hovered) : children;
  return (
    <Pressable
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[style, hovered ? hoverStyle : null]}
      {...rest}
    >
      {content}
    </Pressable>
  );
}
