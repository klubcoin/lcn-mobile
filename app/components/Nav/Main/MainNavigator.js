import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import Browser from '../../Views/Browser';
import AddBookmark from '../../Views/AddBookmark';
import SimpleWebview from '../../Views/SimpleWebview';
import Approval from '../../Views/Approval';
import Settings from '../../Views/Settings';
import GeneralSettings from '../../Views/Settings/GeneralSettings';
import AdvancedSettings from '../../Views/Settings/AdvancedSettings';
import SecuritySettings from '../../Views/Settings/SecuritySettings';
import ExperimentalSettings from '../../Views/Settings/ExperimentalSettings';
import NetworksSettings from '../../Views/Settings/NetworksSettings';
import NetworkSettings from '../../Views/Settings/NetworksSettings/NetworkSettings';
import AppInformation from '../../Views/Settings/AppInformation';
import ContactsSettings from '../../Views/Settings/Contacts';
import Wallet from '../../Views/Wallet';
import Asset from '../../Views/Asset';
import AddAsset from '../../Views/AddAsset';
import Collectible from '../../Views/Collectible';
import Send from '../../Views/Send';
import SendTo from '../../Views/SendFlow/SendTo';
import RevealPrivateCredential from '../../Views/RevealPrivateCredential';
import WalletConnectSessions from '../../Views/WalletConnectSessions';
import OfflineMode from '../../Views/OfflineMode';
import QrScanner from '../../Views/QRScanner';
import LockScreen from '../../Views/LockScreen';
import ChoosePasswordSimple from '../../Views/ChoosePasswordSimple';
import EnterPasswordSimple from '../../Views/EnterPasswordSimple';
import ChoosePassword from '../../Views/ChoosePassword';
import VerifyOTPOnboarding from '../../Views/VerifyOTPOnboarding';
import EmailVerifyOnboarding from '../../Views/EmailVerifyOnboarding';
import ResetPassword from '../../Views/ResetPassword';
import ChangeEmail from '../../Views/ChangeEmail';
import AccountBackupStep1 from '../../Views/AccountBackupStep1';
import AccountBackupStep1B from '../../Views/AccountBackupStep1B';
import ManualBackupStep1 from '../../Views/ManualBackupStep1';
import ManualBackupStep2 from '../../Views/ManualBackupStep2';
import ManualBackupStep3 from '../../Views/ManualBackupStep3';
import ImportPrivateKey from '../../Views/ImportPrivateKey';
import ImportPrivateKeySuccess from '../../Views/ImportPrivateKeySuccess';
import PaymentRequest from '../../UI/PaymentRequest';
import PaymentRequestSuccess from '../../UI/PaymentRequestSuccess';
import Approve from '../../Views/ApproveView/Approve';
import Amount from '../../Views/SendFlow/Amount';
import Confirm from '../../Views/SendFlow/Confirm';
import ContactForm from '../../Views/Settings/Contacts/ContactForm';
import PaymentMethodSelector from '../../UI/FiatOrders/PaymentMethodSelector';
import PaymentMethodApplePay from '../../UI/FiatOrders/PaymentMethodApplePay';
import TransakWebView from '../../UI/FiatOrders/TransakWebView';
import ActivityView from '../../Views/ActivityView';
import SwapsAmountView from '../../UI/Swaps';
import SwapsQuotesView from '../../UI/Swaps/QuotesView';
import PayPal from '../../UI/FiatOrders/Payments/PayPal';
import Wyre from '../../UI/FiatOrders/Payments/Wyre';
import PurchaseMethods from '../../UI/FiatOrders/Payments/Purchase';
import PayQR from '../../Views/PayQRFlow/PayQR';
import VotingApp from '../../Views/VotingApp';
import Contacts from '../../Views/Contacts';
import VoteDetails from '../../Views/VotingApp/VoteDetails';
import VoteProposals from '../../Views/VotingApp/Proposals';
import VoteProposalDetails from '../../Views/VotingApp/ProposalDetails';
import VoteProposalAddEdit from '../../Views/VotingApp/ProposalAddEdit';
import VoteDelegations from '../../Views/VotingApp/Delegations';
import VoteDelegationDetails from '../../Views/VotingApp/DelegationDetails';
import VoteDelegationAddEdit from '../../Views/VotingApp/DelegationAddEdit';
import Profile from '../../Views/Profile';
import ProfileOnboard from '../../Views/ProfileOnboard';
import FilesManager from '../../Views/FilesManager';
import FileDetails from '../../Views/FilesManager/FileDetails';
import { createDrawerNavigator } from 'react-navigation-drawer';
import StorageStatistic from '../../Views/FilesManager/StorageStatistic';
import Notifications from '../../Views/Notifications';
import Message from '../../Views/Message';
import Chat from '../../Views/Message/Chat';
import MarketPlace from '../../Views/MarketPlace';
import MarketCategory from '../../Views/MarketPlace/Category';
import Partners from '../../Views/Partners';
import PartnerDetails from '../../Views/Partners/PartnerDetails';
import ManageCoin from '../../Views/ManageCoin';
import EditProfile from '../../Views/EditProfile';
import MarketSellerOverview from '../../Views/MarketPlace/SellerOverview';
import MarketAddEditProduct from '../../Views/MarketPlace/AddEditProduct';
import MarketDrawer from '../../Views/MarketPlace/Drawer';
import MarketSellerCategory from '../../Views/MarketPlace/SellerCategory';
import MarketProduct from '../../Views/MarketPlace/ProductDetails';
import ShoppingCart from '../../Views/MarketPlace/ShoppingCart';
import MarketCheckout from '../../Views/MarketPlace/Checkout';
import ShippingInfo from '../../Views/MarketPlace/ShippingInfo';
import StoreProfile from '../../Views/MarketPlace/StoreProfile';
import EditStoreProfile from '../../Views/MarketPlace/EditStoreProfile';
import MarketAddEditReview from '../../Views/MarketPlace/AddEditReview';
import StoreReviews from '../../Views/MarketPlace/StoreReviews';
import MarketPurchase from '../../Views/MarketPlace/Purchase';
import PurchasedOrders from '../../Views/MarketPlace/Order';
import OrderDetails from '../../Views/MarketPlace/OrderDetails';
import StoreOrderDetails from '../../Views/MarketPlace/StoreOrderDetails';
import VendorOrders from '../../Views/MarketPlace/VendorOrder';
import TipperAmount from '../../Views/Tipper/TipperAmount';
import TipperDetails from '../../Views/Tipper/TipperDetails';
import MarketProductReview from '../../Views/MarketPlace/ProductReview';
import Dashboard from '../../Views/Dashboard';
import FAQ from '../../Views/FAQ';
import Collect from '../../Views/Collect';
import FAQAnswer from '../../Views/FAQ/FAQAnswer';
import VerifyOTP from '../../Views/VerifyOTP';
import ComingSoon from '../../Views/ComingSoon';
import Help from '../../Views/Help';
import Trade from '../../Views/Trade';
import PurchaseOrderDetails from '../../Views/PurchaseOrderDetails';
import PurchaseSuccess from '../../Views/PurchaseSuccess';
import ChatList from '../../Views/ChatList';
import NewChat from '../../Views/NewChat';
import ChatMessage from '../../Views/ChatMessage';

const styles = StyleSheet.create({
	headerLogo: {
		width: 125,
		height: 50
	}
});
/**
 * Navigator component that wraps
 * the 2 main sections: Browser, Wallet
 */

export default createStackNavigator(
	{
		Home: {
			screen: createBottomTabNavigator(
				{
					WalletTabHome: createStackNavigator({
						Dashboard: {
							screen: Dashboard
						},
						WalletView: {
							screen: Wallet
						},
						Asset: {
							screen: Asset
						},
						ManualBackupStep1: {
							screen: ManualBackupStep1
						},
						ManualBackupStep2: {
							screen: ManualBackupStep2
						},
						ManualBackupStep3: {
							screen: ManualBackupStep3
						},
						AddAsset: {
							screen: AddAsset
						},
						Collectible: {
							screen: Collectible
						},
						RevealPrivateCredentialView: {
							screen: RevealPrivateCredential
						},
						Contacts: {
							screen: Contacts
						},
						Notifications: {
							screen: Notifications
						},
						FilesManager: {
							screen: FilesManager
						},
						FileDetails: {
							screen: FileDetails
						},
						StorageStatistic: {
							screen: StorageStatistic
						},
						ContactForm: {
							screen: ContactForm
						},
						Profile: {
							screen: Profile
						},
						Partners: {
							screen: Partners
						},
						VerifyOTP: {
							screen: VerifyOTP
						},
						ComingSoon: {
							screen: ComingSoon
						},
						Help: {
							screen: Help
						},
						PartnerDetails: {
							screen: PartnerDetails
						},
						EditProfile: {
							screen: EditProfile
						},
						ShippingInfo: {
							screen: ShippingInfo
						},
						FAQ: {
							screen: FAQ
						},
						FAQAnswer: {
							screen: FAQAnswer
						},
						Collect: {
							screen: Collect
						},
						ChatList: {
							screen: ChatList
						},
						NewChat: {
							screen: NewChat
						},
						Chat: {
							screen: Chat
						}
						// ChatMessage: {
						// 	screen: ChatMessage
						// }
					}),
					VotingAppHome: createDrawerNavigator({
						VotingApp: {
							screen: VotingApp
						},
						VoteDetails: {
							screen: VoteDetails
						},
						VoteProposals: {
							screen: VoteProposals
						},
						VoteProposalDetails: {
							screen: VoteProposalDetails
						},
						VoteProposalAddEdit: {
							screen: VoteProposalAddEdit
						},
						VoteDelegations: {
							screen: VoteDelegations
						},
						VoteDelegationDetails: {
							screen: VoteDelegationDetails
						},
						VoteDelegationAddEdit: {
							screen: VoteDelegationAddEdit
						}
					}),
					BrowserTabHome: createStackNavigator({
						BrowserView: {
							screen: Browser,
							navigationOptions: {
								gesturesEnabled: false
							}
						}
					}),
					TransactionsHome: createStackNavigator({
						TransactionsView: {
							screen: ActivityView
						}
					}),
					ManageCoinFlow: {
						screen: createStackNavigator({
							ManageCoin: ManageCoin,
							ComingSoon: {
								screen: ComingSoon
							},
							PurchaseOrderDetails: {
								screen: PurchaseOrderDetails
							},
							PurchaseSuccess: {
								screen: PurchaseSuccess
							},
							Partners: {
								screen: Partners
							}
						})
					}
				},
				{
					defaultNavigationOptions: () => ({
						tabBarVisible: false
					})
				}
			)
		},
		// MessageApp: createStackNavigator({
		// 	Message: {
		// 		screen: Message
		// 	},
		// 	Chat: {
		// 		screen: Chat
		// 	}
		// }),
		MarketPlaceApp: createDrawerNavigator(
			{
				MarketPlace: createStackNavigator(
					{
						MarketPlaceSearch: {
							screen: MarketPlace
						},
						MarketCategory: {
							screen: MarketCategory
						},
						MarketSellerCategory: {
							screen: MarketSellerCategory
						},
						MarketProduct: {
							screen: MarketProduct
						},
						MarketProductReview: {
							screen: MarketProductReview
						},
						ShoppingCart: {
							screen: ShoppingCart
						},
						MarketCheckout: {
							screen: MarketCheckout
						},
						ShippingInfo: {
							screen: ShippingInfo
						},
						Chat: {
							screen: Chat
						},
						MarketPurchase: {
							screen: MarketPurchase
						}
					},
					{
						defaultNavigationOptions: {
							header: null
						}
					}
				),
				MarketSeller: createStackNavigator(
					{
						MarketSellerOverview: {
							screen: MarketSellerOverview
						},
						MarketSellerCategory: {
							screen: MarketSellerCategory
						},
						MarketProduct: {
							screen: MarketProduct
						},
						MarketAddEditProduct: {
							screen: MarketAddEditProduct
						},
						Chat: {
							screen: Chat
						}
					},
					{
						defaultNavigationOptions: {
							header: null
						}
					}
				),
				StoreProfile: createStackNavigator(
					{
						StoreProfile: {
							screen: StoreProfile
						},
						EditStoreProfile: {
							screen: EditStoreProfile
						}
					},
					{
						defaultNavigationOptions: {
							header: null
						}
					}
				),
				StoreReviews: createStackNavigator(
					{
						StoreReviews: {
							screen: StoreReviews
						}
					},
					{
						defaultNavigationOptions: {
							header: null
						}
					}
				),
				MarketOrders: createStackNavigator(
					{
						PurchasedOrders: {
							screen: PurchasedOrders
						},
						VendorOrders: {
							screen: VendorOrders
						},
						OrderDetails: {
							screen: OrderDetails
						},
						MarketAddEditReview: {
							screen: MarketAddEditReview
						},
						Chat: {
							screen: Chat
						},
						StoreOrderDetails: {
							screen: StoreOrderDetails
						}
					},
					{
						defaultNavigationOptions: {
							header: null
						}
					}
				)
			},
			{
				contentComponent: MarketDrawer,
				drawerWidth: 240,
				overlayColor: 'rgba(0, 0, 0, 0.5)'
			}
		),
		TipperApp: createStackNavigator({
			TipperAmount: {
				screen: TipperAmount
			},
			TipperDetails: {
				screen: TipperDetails
			}
		}),
		Webview: {
			screen: createStackNavigator(
				{
					SimpleWebview: {
						screen: SimpleWebview
					}
				},
				{
					mode: 'modal'
				}
			)
		},
		SettingsView: {
			screen: createStackNavigator({
				Settings: {
					screen: Settings
				},
				GeneralSettings: {
					screen: GeneralSettings
				},
				AdvancedSettings: {
					screen: AdvancedSettings
				},
				SecuritySettings: {
					screen: SecuritySettings
				},
				VerifyOTP: {
					screen: VerifyOTP
				},
				ExperimentalSettings: {
					screen: ExperimentalSettings
				},
				NetworksSettings: {
					screen: NetworksSettings
				},
				NetworkSettings: {
					screen: NetworkSettings
				},
				CompanySettings: {
					screen: AppInformation
				},
				Contacts: {
					screen: Contacts
				},
				ContactsSettings: {
					screen: ContactsSettings
				},
				ContactForm: {
					screen: ContactForm
				},
				RevealPrivateCredentialView: {
					screen: RevealPrivateCredential
				},
				WalletConnectSessionsView: {
					screen: WalletConnectSessions
				},
				ChoosePasswordSimple: {
					screen: ChoosePasswordSimple
				},
				ResetPassword: {
					screen: ResetPassword
				},
				ChangeEmail: {
					screen: ChangeEmail
				},
				ManualBackupStep1: {
					screen: ManualBackupStep1
				},
				ManualBackupStep2: {
					screen: ManualBackupStep2
				},
				ManualBackupStep3: {
					screen: ManualBackupStep3
				},
				EnterPasswordSimple: {
					screen: EnterPasswordSimple
				}
			})
		},
		ImportPrivateKeyView: {
			screen: createStackNavigator(
				{
					ImportPrivateKey: {
						screen: ImportPrivateKey
					},
					ImportPrivateKeySuccess: {
						screen: ImportPrivateKeySuccess
					}
				},
				{
					headerMode: 'none'
				}
			)
		},
		SendView: {
			screen: createStackNavigator({
				Send: {
					screen: Send
				}
			})
		},
		SendFlowView: {
			screen: createStackNavigator({
				SendTo: {
					screen: SendTo
				},
				Amount: {
					screen: Amount
				},
				Confirm: {
					screen: Confirm
				}
			})
		},
		PayQRFlow: {
			screen: createStackNavigator({
				PayQR: {
					screen: PayQR
				}
			})
		},
		ApprovalView: {
			screen: createStackNavigator({
				Approval: {
					screen: Approval
				}
			})
		},
		ApproveView: {
			screen: createStackNavigator({
				Approve: {
					screen: Approve
				}
			})
		},
		AddBookmarkView: {
			screen: createStackNavigator({
				AddBookmark: {
					screen: AddBookmark
				}
			})
		},
		OfflineModeView: {
			screen: createStackNavigator({
				OfflineMode: {
					screen: OfflineMode
				}
			})
		},
		/** ALL FULL SCREEN MODALS SHOULD GO HERE */
		QRScanner: {
			screen: QrScanner
		},
		LockScreen: {
			screen: LockScreen
		},
		PaymentRequestView: {
			screen: createStackNavigator(
				{
					PaymentRequest: {
						screen: PaymentRequest
					},
					PaymentRequestSuccess: {
						screen: PaymentRequestSuccess
					}
				},
				{
					mode: 'modal'
				}
			)
		},
		FiatOnRamp: {
			screen: createStackNavigator({
				PurchaseMethods: { screen: PurchaseMethods },
				PaymentMethodSelector: { screen: PaymentMethodSelector },
				PaymentMethodApplePay: { screen: PaymentMethodApplePay },
				TransakFlow: { screen: TransakWebView },
				Trade: { screen: Trade },
				BuyWithPayPal: { screen: PayPal },
				BuyWithWyre: { screen: Wyre }
			})
		},
		Swaps: {
			screen: createStackNavigator({
				SwapsAmountView: { screen: SwapsAmountView },
				SwapsQuotesView: { screen: SwapsQuotesView }
			})
		},
		SetPasswordFlow: {
			screen: createStackNavigator(
				{
					ChoosePassword: {
						screen: ChoosePassword
					},
					VerifyOTPOnboarding: {
						screen: VerifyOTPOnboarding
					},
					EmailVerifyOnboarding: {
						screen: EmailVerifyOnboarding
					},
					ProfileOnboard: {
						screen: ProfileOnboard
					},
					AccountBackupStep1: {
						screen: AccountBackupStep1
					},
					AccountBackupStep1B: {
						screen: AccountBackupStep1B
					},
					ManualBackupStep1: {
						screen: ManualBackupStep1
					},
					ManualBackupStep2: {
						screen: ManualBackupStep2
					},
					ManualBackupStep3: {
						screen: ManualBackupStep3
					}
				},
				{
					defaultNavigationOptions: {
						// eslint-disable-next-line
						headerTitle: () => (
							<Image
								style={styles.headerLogo}
								source={require('../../../images/metamask-name.png')}
								resizeMode={'contain'}
							/>
						),
						headerStyle: {
							borderBottomWidth: 0
						}
					}
				}
			)
		}
	},
	{
		mode: 'modal',
		headerMode: 'none',
		lazy: true
	}
);
