import React, { Component } from 'react';
import { StyleSheet, View, Button, Text, Platform, PermissionsAndroid, TouchableOpacity, Animated } from 'react-native';
import Sound from 'react-native-sound';
import SoundRecorder from 'react-native-sound-recorder';
import Modal from 'react-native-modal';
import { colors } from '../../../styles/common';
import Icon from 'react-native-vector-icons/FontAwesome';
import { RFValue } from 'react-native-responsive-fontsize';
import { testID } from '../../../util/Logger';
import RBSheet from 'react-native-raw-bottom-sheet';
import Device from '../../../util/Device';
import StyledButton from '../StyledButton';
import { strings } from '../../../../locales/i18n';

export default class RecordingBS extends Component {
	sound = null;
	state = {
		audioFile: '',
		recording: false,
		loaded: false,
		paused: true,
		animated: new Animated.Value(0),
		opacity: new Animated.Value(1)
	};

	start = async () => {
		this.setState({ audioFile: '', recording: true, loaded: false });
		if (Platform.OS === 'android') {
			try {
				const grants = await PermissionsAndroid.requestMultiple([
					PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
					PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
					PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
				]);

				console.log('write external stroage', grants);

				if (
					grants['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
					grants['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
					grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
				) {
					console.log('Permissions granted');
				} else {
					console.log('All required permissions not granted');
					return;
				}
			} catch (err) {
				console.warn(err);
				return;
			}
		}
		SoundRecorder.start(
			SoundRecorder.PATH_CACHE + `/${new Date().getTime().toString()}.mp4`,
			Platform.OS == 'ios' ? null : { format: 2, encoder: 4 }
		).then(function() {
			console.log('started recording');
		});
	};

	stop = async () => {
		if (!this.state.recording) return;
		console.log('stop record');
		let audioFile = await SoundRecorder.stop();
		this.setState({ audioFile: audioFile.path, recording: false });
	};

	load = () => {
		return new Promise((resolve, reject) => {
			if (!this.state.audioFile) {
				return reject('file path is empty');
			}

			this.sound = new Sound(this.state.audioFile, '', error => {
				if (error) {
					console.log('failed to load the file', error);
					return reject(error);
				}
				this.setState({ loaded: true });
				return resolve();
			});
		});
	};

	play = async () => {
		if (!this.state.loaded) {
			try {
				await this.load();
			} catch (error) {
				console.log(error);
			}
		}

		this.setState({ paused: false });
		Sound.setCategory('Playback');

		this.sound.play(success => {
			if (success) {
				console.log('successfully finished playing');
			} else {
				console.log('playback failed due to audio decoding errors');
			}
			this.setState({ paused: true });
			this._stopAnimation();
		});
	};

	pause = () => {
		this.sound.pause();
		this._stopAnimation();
		this.setState({ paused: true });
	};

	_runAnimation() {
		const { animated, opacity } = this.state;

		Animated.loop(
			Animated.parallel([
				Animated.timing(animated, {
					toValue: 1,
					duration: 1000
				}),
				Animated.timing(opacity, {
					toValue: 0,
					duration: 1000
				})
			])
		).start();
	}

	_stopAnimation() {
		const { animated, opacity } = this.state;

		Animated.loop(Animated.parallel([Animated.timing(animated), Animated.timing(opacity)])).stop();
	}

	_micButton() {
		const { recording, animated, opacity } = this.state;
		if (recording) {
			this._runAnimation();

			return (
				<TouchableOpacity style={styles.micWrapper} onPress={this.stop}>
					<Animated.View
						style={[
							styles.micButtonCircle,
							styles.micOverlay,
							{
								opacity: opacity,
								transform: [
									{
										scale: animated
									}
								]
							}
						]}
					/>
					<View style={styles.micButtonCircle}>
						<Icon name="microphone" size={30} style={styles.micIcon} />
					</View>
				</TouchableOpacity>
			);
		} else {
			return (
				<TouchableOpacity style={styles.micButtonCircle} onPress={this.start}>
					<Icon name="microphone" size={30} style={styles.micIcon} />
				</TouchableOpacity>
			);
		}
	}

	render() {
		const { recording, paused, audioFile } = this.state;
		const { onHide, sendVoice, RBRef } = this.props;

		return (
			<RBSheet
				ref={RBRef}
				closeOnDragDown={true}
				height={Device.getDeviceHeight() / 2}
				customStyles={{
					wrapper: {
						backgroundColor: colors.greytransparent100
					},
					container: {
						backgroundColor: colors.grey
					}
				}}
			>
				<View style={styles.container}>
					<Text style={styles.header}>{strings('chat.recording_audio')}</Text>
					{this._micButton()}
					<TouchableOpacity
						disabled={!audioFile}
						onPress={paused ? this.play : this.pause}
						{...testID('play-button')}
						style={{ marginTop: 30 }}
					>
						<Icon
							name={paused ? 'play' : 'pause'}
							size={30}
							color={audioFile ? colors.purple100 : colors.white}
						/>
					</TouchableOpacity>
					<StyledButton
						type={'normal'}
						onPress={() => {
							sendVoice(audioFile);
							this.setState({ audioFile: '' });
						}}
						containerStyle={styles.confirmButton}
						{...testID('send-button')}
					>
						<Text style={styles.confirmText}>{strings('chat.send')}</Text>
					</StyledButton>
				</View>
			</RBSheet>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.grey,
		paddingHorizontal: 20,
		borderRadius: 10,
		alignItems: 'center'
	},
	header: {
		fontSize: RFValue(18),
		fontWeight: '400',
		marginBottom: 15,
		color: colors.white
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%'
	},
	spaceEvenly: {
		justifyContent: 'space-evenly'
	},
	micWrapper: {
		justifyContent: 'center',
		alignItems: 'center'
	},
	micButtonCircle: {
		width: 80,
		height: 80,
		borderRadius: 50,
		backgroundColor: colors.primary,
		opacity: 0.6,
		justifyContent: 'center'
	},
	micIcon: {
		alignSelf: 'center',
		color: colors.white
	},
	micOverlay: {
		width: 100,
		height: 100,
		position: 'absolute'
	},
	confirmButton: {
		width: '100%',
		borderRadius: 10,
		marginTop: 50
	},
	confirmText: {
		fontSize: RFValue(15),
		color: colors.white,
		alignSelf: 'center',
		fontWeight: 'bold'
	}
});
