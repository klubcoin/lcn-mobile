import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors } from '../../../styles/common';
import { RNCamera } from 'react-native-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import { strings } from '../../../../locales/i18n';
import { testID } from '../../../util/Logger';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.black
	},
	preview: {
		flex: 1
	},
	innerView: {
		flex: 1
	},
	closeIcon: {
		marginTop: 20,
		marginRight: 20,
		width: 50,
		height: 50,
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'flex-end'
	},
	frame: {
		width: 250,
		height: 250,
		alignSelf: 'center',
		justifyContent: 'center',
		marginTop: 100,
		opacity: 0.5
	},
	text: {
		flex: 1,
		fontSize: 17,
		color: colors.white,
		textAlign: 'center',
		justifyContent: 'center',
		marginTop: 100
	}
});

const frameImage = require('../../../images/frame.png');
export default class QRScanner extends PureComponent {
	static propTypes = {
		onBarCodeRead: PropTypes.func,
		onClose: PropTypes.func
	};

	render = () => {
		return (
			<View style={styles.container}>
				<RNCamera
					onMountError={this.onError}
					captureAudio={false}
					style={styles.preview}
					type={RNCamera.Constants.Type.back}
					onBarCodeRead={e => this.props.onBarCodeRead(e)}
					flashMode={RNCamera.Constants.FlashMode.auto}
					androidCameraPermissionOptions={{
						title: strings('qr_scanner.allow_camera_dialog_title'),
						message: strings('qr_scanner.allow_camera_dialog_message'),
						buttonPositive: strings('qr_scanner.ok'),
						buttonNegative: strings('qr_scanner.cancel')
					}}
					onStatusChange={this.onStatusChange}
				>
					<SafeAreaView style={styles.innerView}>
						<TouchableOpacity
							style={styles.closeIcon}
							onPress={this.props.onClose}
							{...testID('qr-scanner-component-close-button')}
						>
							<Icon name={'ios-close'} size={50} color={'white'} />
						</TouchableOpacity>
						<Image source={frameImage} style={styles.frame} />
						<Text style={styles.text}>{strings('qr_scanner.scanning')}</Text>
					</SafeAreaView>
				</RNCamera>
			</View>
		);
	};
}
