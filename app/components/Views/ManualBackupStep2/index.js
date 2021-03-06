import React, { PureComponent } from 'react';
import { InteractionManager, Alert, Text, TouchableOpacity, View, SafeAreaView, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import OnboardingProgress from '../../UI/OnboardingProgress';
import { colors, fontStyles } from '../../../styles/common';
import ActionView from '../../UI/ActionView';
import { strings } from '../../../../locales/i18n';
import { connect } from 'react-redux';
import { seedphraseBackedUp } from '../../../actions/user';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Device from '../../../util/Device';
import { getOnboardingNavbarOptions } from '../../UI/Navbar';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import styles from './styles/index';

/**
 * View that's shown during the fifth step of
 * the backup seed phrase flow
 */
class ManualBackupStep2 extends PureComponent {
	static navigationOptions = ({ navigation }) => getOnboardingNavbarOptions(navigation);

	static propTypes = {
		/**
		/* navigation object required to push and pop other views
		*/
		navigation: PropTypes.object,
		/**
		 * The action to update the seedphrase backed up flag
		 * in the redux store
		 */
		seedphraseBackedUp: PropTypes.func
	};

	constructor(props) {
		super(props);
		const words = props.navigation.getParam('words');
		if (process.env.JEST_WORKER_ID === undefined) {
			this.words = [...words].sort(() => 0.5 - Math.random());
		} else {
			this.words = words;
		}
		this.steps = props.navigation.getParam('steps');
	}

	state = {
		confirmedWords: [],
		wordsDict: {},
		currentIndex: 0,
		seedPhraseReady: false,
		currentStep: 2
	};

	componentDidMount = () => {
		const { navigation } = this.props;
		const words = navigation.getParam('words', []);
		this.setState(
			{
				confirmedWords: Array(words.length).fill({ word: undefined, originalPosition: undefined })
			},
			this.createWordsDictionary
		);
	};

	createWordsDictionary = () => {
		const dict = {};
		this.words.forEach((word, i) => {
			dict[`${word},${i}`] = { currentPosition: undefined };
		});
		this.setState({ wordsDict: dict });
	};

	findNextAvailableIndex = () => {
		const { confirmedWords } = this.state;
		return confirmedWords.findIndex(({ word }) => !word);
	};

	selectWord = (word, i) => {
		const { wordsDict, confirmedWords } = this.state;
		let currentIndex = this.state.currentIndex;
		if (wordsDict[`${word},${i}`].currentPosition !== undefined) {
			currentIndex = wordsDict[`${word},${i}`].currentPosition;
			wordsDict[`${word},${i}`].currentPosition = undefined;
			confirmedWords[currentIndex] = { word: undefined, originalPosition: undefined };
		} else {
			wordsDict[`${word},${i}`].currentPosition = currentIndex;
			confirmedWords[currentIndex] = { word, originalPosition: i };
			currentIndex = this.findNextAvailableIndex();
		}
		this.setState({
			currentIndex,
			wordsDict,
			confirmedWords,
			seedPhraseReady: this.findNextAvailableIndex() === -1
		});
	};

	clearConfirmedWordAt = i => {
		const { confirmedWords, wordsDict } = this.state;
		const { word, originalPosition } = confirmedWords[i];
		const currentIndex = i;
		if (word && (originalPosition || originalPosition === 0)) {
			wordsDict[[word, originalPosition]].currentPosition = undefined;
			confirmedWords[i] = { word: undefined, originalPosition: undefined };
		}
		this.setState({
			currentIndex,
			wordsDict,
			confirmedWords,
			seedPhraseReady: this.findNextAvailableIndex() === -1
		});
	};

	goBack = () => {
		this.props.navigation.goBack();
	};

	goNext = () => {
		const { seedphraseBackedUp, navigation } = this.props;
		if (this.validateWords()) {
			seedphraseBackedUp();
			InteractionManager.runAfterInteractions(() => {
				const words = navigation.getParam('words');
				navigation.navigate('ManualBackupStep3', { steps: this.steps, words });
			});
		} else {
			Alert.alert(strings('account_backup_step_5.error_title'), strings('account_backup_step_5.error_message'));
		}
	};

	validateWords = () => {
		const words = this.props.navigation.getParam('words', []);
		const { confirmedWords: wordMap } = this.state;
		const confirmedWords = wordMap.map(confirmedWord => confirmedWord.word);
		if (words.join('') === confirmedWords.join('')) {
			return true;
		}
		return false;
	};

	renderWords = () => {
		const { wordsDict } = this.state;
		return (
			<View style={styles.words}>
				{Object.keys(wordsDict).map((key, i) => this.renderWordSelectableBox(key, i))}
			</View>
		);
	};

	renderSuccess = () => (
		<View style={styles.successRow}>
			<MaterialIcon name="check-circle" size={15} color={colors.blue} />
			<Text style={styles.successText}>{strings('manual_backup_step_2.success')}</Text>
		</View>
	);

	renderWordBox = (word, i) => {
		const { currentIndex, confirmedWords } = this.state;
		return (
			<View key={`word_${i}`} style={styles.wordBoxWrapper}>
				<Text style={styles.wordText}>{i + 1}.</Text>
				<TouchableOpacity
					// eslint-disable-next-line react/jsx-no-bind
					onPress={() => {
						this.clearConfirmedWordAt(i);
					}}
					style={[
						styles.wordWrapper,
						i === currentIndex && styles.currentWord,
						confirmedWords[i].word && styles.confirmedWord
					]}
				>
					<Text style={styles.word}>{word}</Text>
				</TouchableOpacity>
			</View>
		);
	};

	renderWordSelectableBox = (key, i) => {
		const { wordsDict } = this.state;
		const [word] = key.split(',');
		const selected = wordsDict[key].currentPosition !== undefined;
		return (
			<TouchableOpacity
				// eslint-disable-next-line react/jsx-no-bind
				onPress={() => this.selectWord(word, i)}
				style={[styles.selectableWord, selected && styles.selectedWord]}
				key={`selectableWord_${i}`}
			>
				<Text style={[styles.selectableWordText, selected && styles.selectedWordText]}>{word}</Text>
			</TouchableOpacity>
		);
	};

	render = () => {
		const { confirmedWords, seedPhraseReady } = this.state;
		const wordLength = confirmedWords.length;
		const half = wordLength / 2;
		return (
			<OnboardingScreenWithBg screen="a">
				<SafeAreaView style={styles.mainWrapper}>
					<View style={styles.onBoardingWrapper}>
						<OnboardingProgress currentStep={this.state.currentStep} steps={this.steps} />
					</View>
					<ActionView
						confirmTestID={'manual-backup-step-2-continue-button'}
						confirmText={strings('manual_backup_step_2.complete')}
						onConfirmPress={this.goNext}
						confirmDisabled={!seedPhraseReady || !this.validateWords()}
						showCancelButton={false}
						confirmButtonMode={'normal'}
					>
						<View style={styles.wrapper} testID={'protect-your-account-screen'}>
							<Text style={styles.action}>{strings('manual_backup_step_2.action')}</Text>
							<View style={styles.infoWrapper}>
								<Text style={styles.info}>{strings('manual_backup_step_2.info')}</Text>
							</View>

							<View
								style={[
									styles.seedPhraseWrapper,
									seedPhraseReady && styles.seedPhraseWrapperError,
									this.validateWords() && styles.seedPhraseWrapperComplete
								]}
							>
								<View style={styles.colLeft}>
									{confirmedWords.slice(0, half).map(({ word }, i) => this.renderWordBox(word, i))}
								</View>
								<View style={styles.colRight}>
									{confirmedWords
										.slice(-half)
										.map(({ word }, i) => this.renderWordBox(word, i + half))}
								</View>
							</View>
							{this.validateWords() ? this.renderSuccess() : this.renderWords()}
						</View>
					</ActionView>
				</SafeAreaView>
			</OnboardingScreenWithBg>
		);
	};
}

const mapDispatchToProps = dispatch => ({
	seedphraseBackedUp: () => dispatch(seedphraseBackedUp())
});

export default connect(
	null,
	mapDispatchToProps
)(ManualBackupStep2);
