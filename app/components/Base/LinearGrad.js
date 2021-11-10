import React from 'react';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

const LinearGrad = ({ start, end, colors, ...rest }) => {
  return (
    <Svg height="100%" width="100%" {...rest}>
      <Defs>
        <LinearGradient id="grad" x1={start.x} y1={start.y} x2={end.x} y2={end.y}>
          <Stop offset="0" stopColor={colors[0]} stopOpacity="1" />
          <Stop offset="1" stopColor={colors[1]} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
    </Svg>
  )
}

export default LinearGrad;