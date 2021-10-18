import React, { PureComponent } from 'react';
import { FlatList, SafeAreaView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import { SwipeListView } from 'react-native-swipe-list-view';
import { colors } from '../../../styles/common';
import { strings } from '../../../../locales/i18n';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import ConfirmModal from '../../UI/ConfirmModal';
import { ConfirmProfileRejected, ConfirmProfileRequest } from '../../../services/Messages';
import Text from '../../Base/Text';
import StyledButton from '../../UI/StyledButton';
import preferences from '../../../store/preferences';
import { store as redux } from '../../../store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		flex: 1
	},
	item: {
		paddingTop: 20,
		paddingHorizontal: 20,
		backgroundColor: colors.white
	},
	head: {
		flexDirection: 'row'
	},
	title: {
		fontWeight: '600',
		fontSize: 17
	},
	desc: {
		fontSize: 15,
		color: colors.black
	},
	time: {
		flex: 1,
		textAlign: 'right'
	},
	line: {
		flex: 1,
		height: 0.5,
		marginTop: 20,
		backgroundColor: colors.grey300
	},
	unread: {
		marginTop: 5,
		marginLeft: 3,
		width: 6,
		height: 6,
		borderRadius: 5,
		backgroundColor: colors.green600
	},
	actionIndicator: {
		width: 22,
		height: 22,
		marginLeft: 5,
		borderRadius: 12,
		backgroundColor: colors.green300,
		alignItems: 'center',
		justifyContent: 'center'
	},
	selectedBar: {
		position: 'absolute',
		width: 5,
		height: '100%',
		left: 0,
		backgroundColor: colors.blue
	},
	actions: {
		flexDirection: 'row'
	},
	swdelete: {
		backgroundColor: colors.red,
		width: 65,
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'flex-end'
	},
	delete: {
		flex: 1,
		marginHorizontal: 20
	},
	cancel: {
		flex: 1,
		marginHorizontal: 20
	}
});

/**
 * View that list notifications
 */
class Notifications extends PureComponent {
	static navigationOptions = ({ navigation }) =>
		getNavigationOptionsTitle(strings('drawer.notifications'), navigation);

	notifications = [];
	selectMode = false;
	selectedIds = [];
	confirmDeleteVisible = false;
	refresh = 0;

	constructor(props) {
		super(props);
		makeObservable(this, {
			notifications: observable,
			selectMode: observable,
			selectedIds: observable,
			confirmDeleteVisible: observable,
			refresh: observable
		});
		const { notifications } = props.store;
		this.notifications = notifications;
	}

	deleteNotification = async item => {
		const items = item ? [item.item] : this.notifications.filter(e => this.selectedIds.includes(e.id));
		items.map(e => this.notifications.splice(this.notifications.indexOf(e), 1));
		this.cancelSelection();
		preferences.saveNotifications(this.notifications);
	};

	parseItem = item => {
		switch (item.action) {
			case ConfirmProfileRejected().action:
				return {
					title: `${item.firstname} ${item.lastname}`,
					content: strings('notifications.could_not_confirm_try_again'),
					time: moment(item.time).format('MMM DD')
				};
			case ConfirmProfileRequest().action:
				return {
					title: `${item.firstname} ${item.lastname}`,
					content: strings('notifications.requested_profile_confirmation'),
					time: moment(item.time).format('MMM DD')
				};
			default:
				return '';
		}
	};

	openItem = item => {
		const { store } = this.props;
		if (!item.read && item.action == ConfirmProfileRequest().action) {
			redux.dispatch({
				type: 'SHOW_CONFIRM_OTHER_IDENTITY',
				data: item
			});
		}
		item.read = true;
		store.saveNotifications(this.notifications);
		this.refresh = moment().valueOf();
	};

	cancelSelection() {
		this.selectedIds = [];
		this.selectMode = false;
	}

	selectItem = item => {
		if (this.selectedIds.includes(item.id)) {
			this.selectedIds.splice(this.selectedIds.indexOf(item.id), 1);
		} else {
			this.selectedIds.push(item.id);
		}
		this.selectMode = true;
		this.refresh = moment().valueOf();
	};

	renderItem = ({ item }) => {
		const { title, content, time } = this.parseItem(item);
		const { read } = item;
		const selected = this.selectedIds.includes(item.id);
		const action = !read && item.action == ConfirmProfileRequest().action;

		return (
			<TouchableOpacity
				activeOpacity={0.8}
				// onLongPress={() => this.selectItem(item)}
				onPress={() => (this.selectMode ? this.selectItem(item) : this.openItem(item))}
			>
				<View style={styles.item}>
					<View style={styles.head}>
						<Text style={styles.title}>{title}</Text>
						{!read && <View style={styles.unread} />}
						<Text style={styles.time}>{time}</Text>
						{action && (
							<View style={styles.actionIndicator}>
								<Icon name={'arrow-right'} size={20} color={colors.white} />
							</View>
						)}
					</View>
					<Text style={styles.desc}>{content}</Text>
					<View style={styles.line} />
				</View>
				{selected && <View style={styles.selectedBar} />}
			</TouchableOpacity>
		);
	};

	renderSwipeDelete = data => {
		return (
			<TouchableOpacity style={styles.swdelete} onPress={() => this.deleteNotification(data)}>
				<Icon name={'delete-outline'} size={32} color={colors.white} />
			</TouchableOpacity>
		);
	};

	render() {
		const { notifications } = this;
		const canDelete = this.selectedIds.length > 0;

		return (
			<SafeAreaView style={styles.wrapper}>
				<SwipeListView
					key={this.refresh}
					keyExtractor={item => `${JSON.stringify(item)}`}
					data={notifications}
					renderItem={(data, rowMap) => this.renderItem(data)}
					renderHiddenItem={(data, rowMap) => this.renderSwipeDelete(data)}
					disableRightSwipe
					leftOpenValue={0}
					rightOpenValue={-65}
				/>

				{this.selectMode && (
					<View style={styles.actions}>
						<StyledButton
							disabled={!canDelete}
							type={'danger'}
							onPress={() => (this.confirmDeleteVisible = true)}
							containerStyle={styles.delete}
						>
							{strings('notifications.delete')}
						</StyledButton>
						<StyledButton
							type={'normal'}
							onPress={() => this.cancelSelection()}
							containerStyle={styles.cancel}
						>
							{strings('notifications.cancel')}
						</StyledButton>
					</View>
				)}
				<ConfirmModal
					visible={this.confirmDeleteVisible}
					title={strings('notifications.confirm_delete')}
					message={strings('notifications.are_you_sure')}
					confirmLabel={strings('notifications.delete')}
					cancelLabel={strings('notifications.cancel')}
					onConfirm={() => this.deleteNotification()}
					hideModal={() => (this.confirmDeleteVisible = false)}
				/>
			</SafeAreaView>
		);
	}
}

export default inject('store')(observer(Notifications));
