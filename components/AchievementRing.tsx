import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../theme/colors';

type Props = React.PropsWithChildren<{
  percent: number;
  size: number;
  strokeWidth: number;
}>;

export default function AchievementRing({ percent, size, strokeWidth, children }: Props) {
  const value = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="달성률"
      accessibilityValue={{ min: 0, max: 100, now: value }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={Colors.border} strokeWidth={strokeWidth} />
        {value > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={Colors.blue}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={value < 100 ? [circumference, circumference] : undefined}
            strokeDashoffset={circumference * (1 - value / 100)}
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        )}
      </Svg>
      {children}
    </View>
  );
}
