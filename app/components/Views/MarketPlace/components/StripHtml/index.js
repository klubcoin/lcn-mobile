import React from 'react';
import { Text } from 'react-native';

export default StripHtml = ({ ...rest }) => {
  const content = `${rest.children || ''}`.replace(/<[^>]*>?/gm, '');

  return (
    <Text numberOfLines={1} {...rest}>
      {content}
    </Text>
  )
}