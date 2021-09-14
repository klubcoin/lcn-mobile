import routes from "../../../common/routes";

export const FriendRequestTypes = ({
  Request: 'Friend Request',
  Accept: 'Accept Friend',
  Revoke: 'Friend Revoked',
});

export const LiquichainNameCard = (selectedAddress, type) => ({
  from: selectedAddress,
  meta: {
    title: routes.mainNetWork.name,
    url: routes.mainNetWork.blockExploreUrl,
    icon: 'logo.png',
  },
  data: JSON.stringify({
    /*
    domain: {
      chainId: routes.mainNetWork.chainId,
      name: routes.mainNetWork.name,
    },
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'chainId', type: 'string' },
      ],
      LiquichainNameCard: [
        { name: 'type', type: 'string' },
        { name: 'from', type: 'string' },
        { name: 'content', type: 'string' },
      ]
    },
    primaryType: 'LiquichainNameCard',
    */
    message: {
      type: type || 'Name Card', // type or action for name card
      from: selectedAddress,
      content: `${selectedAddress} - ${routes.mainNetWork.name}`,
    },
  }),
});