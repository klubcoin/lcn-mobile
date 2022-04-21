import AsyncStorage from '@react-native-community/async-storage';
import React, { Component } from 'react';
import { TextInput } from 'react-native-gesture-handler';

export const EXCEPTION_ACTIVE_APP = 'EXCEPTION_ACTIVE_APP';

export default class TrackingTextInput extends Component {
	ref = React.createRef();

	focus = () => {
		this.ref.current.focus();
	};

	blur = () => {
		this.ref.current.blur();
	};

	clear = () => {
		this.ref.current.clear();
	};

	isFocused = () => {
		return this.ref.current.isFocused();
	};

	onTrackingInput = () => {
		AsyncStorage.setItem(EXCEPTION_ACTIVE_APP, `${new Date().getTime()}`);
	};

	render() {
		return (
			<TextInput
				ref={this.ref}
				{...this.props}
				onSelectionChange={() => {
					this.onTrackingInput();
					this.props.onSelectionChange && this.props.onSelectionChange();
				}}
			/>
		);
	}
}
