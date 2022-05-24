import AsyncStorage from '@react-native-community/async-storage';
import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { EXCEPTION_ACTIVE_APP } from '../../Nav/Main';

export default class TrackingScrollView extends Component {
	ref = React.createRef();

	flashScrollIndicators = () => {
		this.ref.current.flashScrollIndicators();
	};

	scrollTo = option => {
		this.ref.current.scrollTo(option);
	};

	scrollToEnd = option => {
		this.ref.current.scrollToEnd(option);
	};

	onTrackingScroll = () => {
		AsyncStorage.setItem(EXCEPTION_ACTIVE_APP, `${new Date().getTime()}`);
	};

	render() {
		return (
			<ScrollView
				scrollEventThrottle={0}
				{...this.props}
				onScroll={e => {
					this.onTrackingScroll();
					this.props.onScroll && this.props.onScroll(e);
				}}
				ref={this.ref}
			/>
		);
	}
}
