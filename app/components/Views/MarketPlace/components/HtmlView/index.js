import React from 'react'
import RenderHtml from 'react-native-render-html';

export default HtmlView = ({ width, source, style, ...rest }) => {

  return (
    <RenderHtml baseStyle={style} contentWidth={width} source={source} {...rest} />
  )
}