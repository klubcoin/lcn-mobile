import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc'
import Messaging, { Message, WSEvent } from './Messaging';


export default class WebRTC {
  fromUserId = '';
  otherUserId = '';

  onReady = null;
  onMessage = null;
  onError = null;

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
      case 'error':
        this.onMessage = callback;
        break;
    }
  }

  initSocket = () => {
    this.messaging = new Messaging(this.fromUserId);
    this.messaging.on(WSEvent.ready, this.handleConnected.bind(this))
    this.messaging.on(WSEvent.message, this.handleWebRtcMessage.bind(this))
    this.messaging.initConnection();
  }

  handleWebRtcMessage = (message) => {
    try {
      const data = JSON.parse(message);
      if (data.webrtc) {
        switch (data.signal) {
          case 'offer': this.handleOffer(data); break;
          case 'answer': this.handleAnswer(data); break;
          case 'ice-candidate': this.handleNewICECandidateMsg(data.candidate); break;
        }
      }
    } catch (e) { }
  }

  sendSignal = (signal, payload) => {
    const message = Message(this.otherUserId, {
      webrtc: true,
      signal,
      ...payload,
    });
    this.messaging.send(message);
  }

  connectTo = (address) => {
    this.otherUserId = address;

    this.peerRef = this.Peer(address);
    this.sendChannel = this.peerRef.createDataChannel('sendChannel');

    // listen to incoming messages from other peer
    this.sendChannel.onmessage = this.handleReceiveMessage;
  }

  handleConnected = () => {

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
      return this.peerRef.createAnswer();
    }).then(answer => {
      return this.peerRef.setLocalDescription(answer);
    }).then(() => {
      const payload = {
        target: incoming.caller,
        caller: this.fromUserId,
        sdp: this.peerRef.localDescription
      }
      this.sendSignal('answer', payload);
    })
  }

  handleAnswer = (message) => {
    // Handle answer by the receiving peer
    const desc = new RTCSessionDescription(message.sdp);
    this.peerRef.setRemoteDescription(desc)
      .catch(err => this.onError && this.onError(err));

    if (this.onReady) this.onReady(this.sendChannel);
  }

  handleReceiveMessage = (e) => {
    // Listener for receiving messages from the peer
    console.log('[INFO] Message received from peer', e.data);
    if (this.onMessage) this.onMessage(e.data);
  }

  handleNewICECandidateMsg = (incoming) => {
    const candidate = new RTCIceCandidate(incoming);

    this.peerRef.addIceCandidate(candidate)
      .catch(err => this.onError && this.onError(err));
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
      this.sendSignal('ice-candidate', payload);
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
        this.sendSignal('offer', payload);
      })
      .catch(err => this.onError && this.onError(err));
  }
}
