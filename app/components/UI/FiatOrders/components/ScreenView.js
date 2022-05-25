import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';
import TrackingScrollView from '../../TrackingScrollView';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		flex: 1
	}
});

const ScreenView = props => (
	<SafeAreaView style={styles.wrapper}>
		<TrackingScrollView {...props} />
	</SafeAreaView>
);

export default ScreenView;
