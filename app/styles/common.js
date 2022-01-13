/**
 * Common styles and variables
 */

import ccolors from "../common/colors";

/**
 * Map of color names to HEX values
 */

export const colors = Object.assign({}, ccolors, {
	fontPrimary: '#000000',
	fontSecondary: '#777777',
	fontTertiary: '#AAAAAA',
	fontError: '#D73A49',
	fontWarning: '#f66a0a',
	primaryFox: '#370e75',
	primaryFox100: 'rgba(55, 14, 117, 0.1)',
	black: '#24292E',
	white: '#FFFFFF',
	white100: '#F9FAFB',
	grey450: '#8E8E93',
	grey700: '#3C3F42',
	grey600: '#5B5D67',
	grey500: '#6a737d',
	grey400: '#848c96',
	grey300: '#9fa6ae',
	grey200: '#bbc0c5',
	grey100: '#d6d9dc',
	grey050: '#D8D8D8',
	grey000: '#f2f3f4',
	greytransparent: 'rgba(36, 41, 46, 0.6)',
	greytransparent100: 'rgba(115, 115, 115, 0.5)',
	grey: '#333333',
	red: '#D73A49',
	red000: '#fcf2f3',
	blue: '#370e75',
	blue000: '#370e75',
	blue200: '#370e75',
	blue500: '#370e75',
	blue600: '#370e75',
	blue700: '#0074C8',
	green600: '#1e7e34',
	green500: '#28a745',
	green400: '#28A745',
	green300: '#86e29b',
	green200: '#afecbd',
	green100: '#e6f9ea',
	yellow: '#FFD33D',
	yellow700: '#705700',
	yellow200: '#ffe281',
	yellow300: '#FFD33D',
	yellow100: '#fffcdb',
	orange: '#f66a0a',
	orange300: '#faa66c',
	orange000: '#fef5ef',
	spinnerColor: '#037DD6',
	success: '#219E37',
	dimmed: '#00000080',
	transparent: 'transparent',
	lightOverlay: 'rgba(0,0,0,.2)',
	overlay: 'rgba(0,0,0,.5)',
	darkAlert: 'rgba(0,0,0,.75)',
	normalAlert: 'rgba(55,55,55,.97)',
	spinnerBackground: `rgba(185, 156, 171, 0.396)`,
	wordColor: '#0e4fb4',
	excelColor: '#237e4c',
	pdfColor: '#b30d02',
	pptColor: '#d04523',
	mediaIcColor: '#28afea',
});

/**
 * Map of reusable base styles
 */
export const baseStyles = {
	flexGrow: {
		flex: 1
	},
	flexStatic: {
		flex: 0
	}
};

/**
 * Map of reusable fonts
 */
export const fontStyles = {
	normal: {
		fontFamily: 'EuclidCircularB-Regular',
		fontWeight: '400'
	},
	light: {
		fontFamily: 'EuclidCircularB-Regular',
		fontWeight: '300'
	},
	thin: {
		fontFamily: 'EuclidCircularB-Regular',
		fontWeight: '100'
	},
	bold: {
		fontFamily: 'EuclidCircularB-Bold',
		fontWeight: '600'
	}
};
