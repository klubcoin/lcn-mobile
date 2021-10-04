import routes from '../common/routes';
import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc'
import io from 'socket.io-client';


const SignalServer = 'http://192.168.0.187:9000';

export default class WebRTC {
  fromUserId = '';
  otherUserId = '';

  onReady = null;
  onMessage = null;

  constructor(from) {
    this.fromUserId = from;
    this.initSocket();
  }

  addListener = (type, callback) => {
    switch (type) {
      case 'ready':
        this.onReady = callback;
        break;
      case 'message':
        this.onMessage = callback;
        break;
    }
  }

  initSocket = () => {
    this.socketRef = io(SignalServer, {
      reconnectionDelayMax: 10000,
      query: { auth: routes.mainNetWork.name },
    });

    this.socketRef.on('connected', this.handleConnected);
    this.socketRef.on('offer', this.handleOffer);
    this.socketRef.on('answer', this.handleAnswer);
    this.socketRef.on('ice-candidate', this.handleNewICECandidateMsg);
  }

  connectTo = (address) => {
    this.otherUserId = address;

    this.peerRef = this.Peer(address);
    this.sendChannel = this.peerRef.createDataChannel('sendChannel');

    // listen to incoming messages from other peer
    this.sendChannel.onmessage = this.handleReceiveMessage;
  }

  handleConnected = () => {
    this.socketRef.emit('join', this.fromUserId);
  }

  handleOffer = (incoming) => {
    this.otherUserId = incoming.caller;
    /*
      Here we are exchanging config information
      between the peers to establish communication
    */
    this.peerRef = this.Peer(incoming.caller);
    this.peerRef.ondatachannel = (event) => {
      this.sendChannel = event.channel;
      this.sendChannel.onmessage = this.handleReceiveMessage;
      console.log('[SUCCESS] Connection established')
      if (this.onReady) this.onReady(this.sendChannel);
    }

    /*
      Session Description: It is the config information of the peer
      SDP stands for Session Description Protocol. The exchange
      of config information between the peers happens using this protocol
    */
    const desc = new RTCSessionDescription(incoming.sdp);

    this.peerRef.setRemoteDescription(desc).then(() => {
    }).then(() => {
      return this.peerRef.createAnswer();
    }).then(answer => {
      return this.peerRef.setLocalDescription(answer);
    }).then(() => {
      const payload = {
        target: incoming.caller,
        caller: this.fromUserId,
        sdp: this.peerRef.localDescription
      }
      this.socketRef.emit('answer', payload);
    })
  }

  handleAnswer = (message) => {
    // Handle answer by the receiving peer
    const desc = new RTCSessionDescription(message.sdp);
    this.peerRef.setRemoteDescription(desc).catch(e => console.log('Error handle answer', e));

    if (this.onReady) this.onReady(this.sendChannel);
  }

  handleReceiveMessage = (e) => {
    // Listener for receiving messages from the peer
    console.log('[INFO] Message received from peer', e.data);
    if (this.onMessage) this.onMessage(e.data);
  }

  handleNewICECandidateMsg = (incoming) => {
    const candidate = new RTCIceCandidate(incoming);

    this.peerRef.addIceCandidate(candidate).catch(e => console.log(e));
  }

  Peer = (userID) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.stunprotocol.org'
        },
        {
          urls: 'turn:numb.viagenie.ca',
          credential: 'long3232',
          username: 'dragons3232@gmail.com'
        },
      ]
    });
    peer.onicecandidate = this.handleICECandidateEvent;
    peer.onnegotiationneeded = () => this.handleNegotiationNeededEvent(userID);
    return peer;
  }

  handleICECandidateEvent = (e) => {
    /*
      ICE stands for Interactive Connectivity Establishment. Using this
      peers exchange information over the intenet. When establishing a
      connection between the peers, peers generally look for several 
      ICE candidates and then decide which to choose best among possible
      candidates
    */
    if (e.candidate) {
      const payload = {
        target: this.otherUserId,
        candidate: e.candidate,
      }
      this.socketRef.emit('ice-candidate', payload);
    }
  }

  handleNegotiationNeededEvent = (userID) => {
    // Offer made by the initiating peer to the receiving peer.
    this.peerRef.createOffer()
      .then(offer => {
        return this.peerRef.setLocalDescription(offer);
      })
      .then(() => {
        const payload = {
          target: userID,
          caller: this.fromUserId,
          sdp: this.peerRef.localDescription,
        };
        this.socketRef.emit('offer', payload);
      })
      .catch(err => console.log('Error handling negotiation needed event', err));
  }
}
