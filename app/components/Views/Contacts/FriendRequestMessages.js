import routes from "../../../common/routes";

export const FriendRequestTypes = ({
  Request: 'Friend Request',
  Accept: 'Accept Friend',
  Revoke: 'Friend Revoked',
});

export const LiquichainNameCard = (selectedAddress, name, type) => ({
  action: 'Namecard',
  from: selectedAddress,
  meta: {
    title: routes.mainNetWork.name,
    chainId: routes.mainNetWork.chainId,
    url: routes.mainNetWork.blockExploreUrl,
    icon: 'logo.png',
  },
  data: {
    type: type || 'Name Card', // type or action for name card
    from: selectedAddress,
    name,
    content: `${selectedAddress} - ${routes.mainNetWork.name}`,
  },
  signature: '', // signature of json of data above
});

export const WalletProfile = (profile) => ({
  action: 'wallet_profile',
  profile,
})