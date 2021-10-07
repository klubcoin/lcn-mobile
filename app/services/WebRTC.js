import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc'
import { ReadFile, ReadFileResult, StoreFile } from './FileStore';
import FileTransferWebRTC from './FileTransferWebRTC';
import * as RNFS from 'react-native-fs';
import Messaging, { Message, WSEvent } from './Messaging';


export default class WebRTC {
  fromUserId = '';
  sendChannels = {};

  onReady = null;
  onMessage = null;
  onError = null;
  events = {
    ready: [],
    message: [],
    error: [],
  }

  constructor(from) {
    this.fromUserId = from;
    this.initSocket();
  }

  addListener = (type, callback) => {
    switch (type) {
      case 'ready':
        this.onReady = callback;
        this.events.ready.push(callback);
        return () => this.events.ready.splice(this.events.ready.indexOf(callback), 1);
      case 'message':
        this.onMessage = callback;
        this.events.message.push(callback);
        return () => this.events.message.splice(this.events.message.indexOf(callback), 1);
      case 'error':
        this.onError = callback;
        this.events.error.push(callback);
        return () => this.events.error.splice(this.events.error.indexOf(callback), 1);
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
    const message = Message(payload.target, {
      webrtc: true,
      signal,
      ...payload,
    });
    this.messaging.send(message);
  }

  connectTo = (address) => {
    this.peerRef = this.Peer(address);
    this.sendChannels[address] = this.peerRef.createDataChannel('sendChannel');

    // listen to incoming messages from other peer
    this.sendChannels[address].onmessage = (message) => this.handleReceiveMessage(message, address);
  }

  handleConnected = () => {

  }

  handleOffer = (incoming) => {
    const peerId = incoming.caller;
    /*
      Here we are exchanging config information
      between the peers to establish communication
    */
    this.peerRef = this.Peer(incoming.caller);
    this.peerRef.ondatachannel = (event) => {
      this.sendChannels[peerId] = event.channel;
      this.sendChannels[peerId].onmessage = (message) => this.handleReceiveMessage(message, peerId);
      console.log('[SUCCESS] Connection established')
      event.channel.send(JSON.stringify({ action: 'ping' }));
      // if (this.onReady) this.onReady(this.sendChannels[peerId]);
      this.events.ready.map(callback => callback(this.sendChannels[peerId], peerId));
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

    const peerId = message.caller;
    const sendChannel = this.sendChannels[peerId];
    // if (this.onReady) this.onReady(sendChannel);
    this.events.ready.map(callback => callback(sendChannel, peerId));
  }

  handleReceiveMessage = (e, peer) => {
    // Listener for receiving messages from the peer
    console.log('[INFO] Message received from peer', e.data);

    this.handleFileTransfer(e.data, peer);
    // if (this.onMessage) this.onMessage(e.data, peer);
    this.events.message.map(callback => callback(e.data, peer));
  }

  handleFileTransfer = async (json, peerId) => {
    try {
      const data = JSON.parse(json);
      if (data.action == StoreFile().action) {
        FileTransferWebRTC.storeFile(data)
          .then(message => this.sendToPeer(peerId, JSON.stringify(message)));
      } else if (data.action == ReadFile().action && data.from != this.fromUserId) {
        const { from, hash, name } = data;
        const folder = `${RNFS.DocumentDirectoryPath}/${from}`;
        if (! await RNFS.exists(folder)) await RNFS.mkdir(folder);

        const files = await RNFS.readDir(folder);

        const foundFiles = files.filter(e => e.name.indexOf(hash) === 0 || e.name.indexOf(name) === 0);
        foundFiles.map(async (e) => {
          const content = await RNFS.readFile(e.path, 'utf8');
          const partId = e.name.split('.').reverse()[0];
          const message = ReadFileResult(
            from, hash, name,
            moment(e.mtime).unix(),
            [{ i: partId, v: content }]
          );
          this.sendToPeer(peerId, JSON.stringify(message));
        })
      } else if (data.action == ReadFileResult().action) {
        //responded file
      }
    } catch (e) { }
  }

  handleNewICECandidateMsg = (incoming) => {
    const candidate = new RTCIceCandidate(incoming);

    this.peerRef.addIceCandidate(candidate)
      .catch(err => this.onError && this.onError(err));
  }

  Peer = (peerId) => {
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
    peer.peerId = peerId;
    peer.onicecandidate = this.handleICECandidateEvent;
    peer.onnegotiationneeded = () => this.handleNegotiationNeededEvent(peerId);
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
        target: e.target.peerId,
        candidate: e.candidate,
      }
      this.sendSignal('ice-candidate', payload);
    }
  }

  handleNegotiationNeededEvent = (peerId) => {
    // Offer made by the initiating peer to the receiving peer.
    this.peerRef.createOffer()
      .then(offer => {
        return this.peerRef.setLocalDescription(offer);
      })
      .then(() => {
        const payload = {
          target: peerId,
          caller: this.fromUserId,
          sdp: this.peerRef.localDescription,
        };
        this.sendSignal('offer', payload);
      })
      .catch(err => this.onError && this.onError(err));
  }

  hasChannel(address) {
    return this.sendChannels && this.sendChannels[address];
  }

  sendToPeer(peerId, message) {
    const channel = this.sendChannels[peerId];
    channel && channel.send(message);
  }
}
