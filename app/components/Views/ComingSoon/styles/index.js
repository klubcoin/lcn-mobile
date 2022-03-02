import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import brandStyles from './brand';
import { assignNestedObj } from '../../../../util/object';


const styles = StyleSheet.create({
	scrollView:{},
	image: {},
	imageText:{},
	text1:{},
	text2:{},
	itemWrapper:{},
	itemIcon:{},
	itemText:{},
});

export default assignNestedObj(styles, brandStyles);
