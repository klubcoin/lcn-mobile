import React, { Component } from 'react';
import { View, StyleSheet, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { getNavigationOptionsTitle } from '../../../UI/Navbar';
import { colors } from '../../../../styles/common';
import * as FileIcons from '../../../../util/file-icons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import TextSpan from '../components/TextSpan';
import PartItem from '../components/PartItem';
import StorageChart from '../components/StorageChart';
import { connect } from 'react-redux';
import Identicon from '../../../UI/Identicon';

class StorageStatistic extends Component {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle('Storage', navigation);

	state = {
		contacts: []
	};

	componentDidMount() {
		const { addressBook, network } = this.props;
		const addresses = addressBook[network] || {};
		const contacts = Object.keys(addresses).map(addr => addresses[addr]);

		this.setState(prevState => ({
			...prevState,
			contacts: contacts
		}));
	}

	render() {
		return (
			<View style={styles.container}>
				<StorageChart />
				<Text style={styles.title}>View storage of other recipients</Text>
				{this.state.contacts.map(e => (
					<TouchableOpacity onPress={() => console.log(e)}>
						<View style={styles.contacts}>
							<Identicon address={e.address} diameter={40} />
							<View style={{ flex: 1, marginLeft: 10, maxWidth: 200 }}>
								<Text numberOfLines={1} ellipsizeMode="middle" style={{ fontSize: 14 }}>
									{e.name}
								</Text>
								<Text
									numberOfLines={1}
									ellipsizeMode="middle"
									style={{ fontSize: 14, color: colors.primaryFox, fontWeight: 'bold' }}
								>
									{e.address}
								</Text>
							</View>
						</View>
					</TouchableOpacity>
				))}
			</View>
		);
	}
}

const mapStateToProps = state => ({
	addressBook: state.engine.backgroundState.AddressBookController.addressBook,
	network: state.engine.backgroundState.NetworkController.network,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	identities: state.engine.backgroundState.PreferencesController.identities
});

export default connect(mapStateToProps)(StorageStatistic);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 16
	},

	title: {
		fontSize: 18,
		fontWeight: '500',
		marginBottom: 5
	},

	contacts: {
		flexDirection: 'row',
		marginRight: 5,
		marginTop: 5,
		marginBottom: 50,
		alignItems: 'center'
	}
});
