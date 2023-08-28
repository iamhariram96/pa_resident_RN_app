
// import React, { Component } from 'react';
// import {
//   RTCView,
//   mediaDevices,
//   RTCPeerConnection,
//   RTCIceCandidate,
//   RTCSessionDescription,
//   // WebSocket,
// } from 'react-native-webrtc';

// import WebSocket from 'isomorphic-ws';
// class WebRTC extends Component {
//   constructor(props) {
//     super(props);
//     this.peerConnection = null;
//     this.localStream = null;
//     this.ws = null;
//     this.onLocalStream = (stream) => {
//       this.localStream = stream;
//       this.peerConnection.addTrack(stream, this.localStream);
//     };
//     this.onIceCandidate = (candidate) => {
//       this.peerConnection.addIceCandidate(candidate);
//     };
//     this.onMessage = (event) => {
//       const data = JSON.parse(event.data);
//       if (data.type === 'offer') {
//         this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
//         this.peerConnection.answer();
//       } else if (data.type === 'candidate') {
//         this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
//       }
//     };
//   }
//   componentDidMount() {
//     this.getLocalStream();
//     this.ws = new WebSocket('ws://216.48.187.180:6600');
//     this.ws.onmessage = this.onMessage;
//   }
//   getLocalStream() {
//     const constraints = {
//       audio: true,
//       video: {
//         width: 640,
//         height: 480,
//       },
//     };
//     mediaDevices.getUserMedia(constraints).then((stream) => {
//       this.onLocalStream(stream);
//     });
//   }
//   render() {
//     return (
//       <RTCView
//         style={{ width: 200, height: 200 }}
//         onLocalStream={this.onLocalStream}
//       />
//     );
//   }
// }
// export default WebRTC;

// import React, { Component } from 'react';
// import { View, Button } from 'react-native';
// import { RTCView, mediaDevices, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
// import WebSocket from 'isomorphic-ws'; // For WebSocket support

// class WebRTC extends Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       localStream: null,
//       remoteStream: null,
//       ws: new WebSocket('ws://216.48.187.180:6600'),
//       peerConnection: null,
//     };

//     this.setupWebSocket();
//   }

//   componentDidMount() {
//     this.setupLocalStream();
//   }

//   setupWebSocket = () => {
//     const { ws } = this.state;

//     ws.onopen = () => {
//       console.log('WebSocket connected');
//     };

//     ws.onmessage = (event) => {
//       // Handle incoming signaling messages

//       console.log(JSON.parse(event.data)  + ' asdfasfsafsafasdf')
//       this.handleSignalingData(JSON.parse(event.data));
//     };

//     ws.onclose = () => {
//       console.log('WebSocket closed');
//     };
//   };

//   setupLocalStream = async () => {
//     const stream = await mediaDevices.getUserMedia({ audio: true, video: true });
//     this.setState({ localStream: stream });
//   };

//   handleSignalingData = async (data) => {
//     const { peerConnection } = this.state;

//     if (data.description) {
//       const remoteDescription = new RTCSessionDescription(data.description);
//       await peerConnection.setRemoteDescription(remoteDescription);

//       if (data.description.type === 'offer') {
//         const answer = await peerConnection.createAnswer();
//         await peerConnection.setLocalDescription(answer);

//         this.sendData({ description: peerConnection.localDescription });
//       }
//     } else if (data.candidate) {
//       try {
//         await peerConnection.addIceCandidate(data.candidate);
//       } catch (error) {
//         console.error('Error adding ICE candidate:', error);
//       }
//     }
//   };

//   sendData = (data) => {
//     const { ws } = this.state;
//     ws.send(JSON.stringify(data));
//   };

//   startCall = async () => {
//     const configuration = { iceServers: [] };

//     this.state.peerConnection = new RTCPeerConnection(configuration);
//     // this.setState({ 
//     //   ...this.state,
//     //   peerConnection: new RTCPeerConnection(configuration) 
//     // });
//     // const peerConnection = new RTCPeerConnection(configuration);

//     const { localStream, peerConnection} = this.state;
//     localStream.getTracks().forEach(track => {
//       peerConnection.addTrack(track, localStream);
//     });

//     peerConnection.onicecandidate = (event) => {
//       if (event.candidate) {
//         this.sendData({ candidate: event.candidate });
//       }
//     };

//     const offer = await peerConnection.createOffer();
//     await peerConnection.setLocalDescription(offer);

//     this.sendData({ description: peerConnection.localDescription });

//     this.setState({ peerConnection });
//   };

//   render() {
//     const { localStream, remoteStream } = this.state;

//     return (
//       <View>
//         <RTCView streamURL={localStream && localStream.toURL()} style={{ width: 200, height: 150 }} />
//         <RTCView streamURL={remoteStream && remoteStream.toURL()} style={{ width: 200, height: 150 }} />
//         <Button title="Start Call" onPress={this.startCall} />
//       </View>
//     );
//   }
// }

// export default WebRTC;

// import React, { useEffect, useRef, useState } from 'react';
// import { View, Text, StyleSheet, Button } from 'react-native';
// import { RTCView, mediaDevices } from 'react-native-webrtc';
// import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';

// const WebRTC = () => {
//   const ws = new WebSocket('ws://216.48.187.180:6600');
//   let pc = null; // Ref for PeerConnection
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);

//   useEffect(() => {
//     // Set up WebSocket event listeners
//     ws.onopen = () => {
//       console.log('WebSocket connection opened');
//     };

//     ws.onclose = () => {
//       console.log('WebSocket connection closed');
//     };

//     // Set up PeerConnection
//     pc = new RTCPeerConnection(configuration);

//     // Set up local media stream
//     setupLocalStream();
//   }, []);

//   const configuration = {
//     iceServers: [
//       {
//         urls: [
//           'stun:stun1.l.google.com:19302',
//           'stun:stun2.l.google.com:19302',
//         ],
//       },
//     ],
//     iceCandidatePoolSize: 10,
//   };

//   const setupLocalStream = async () => {
//     try {
//       const stream = await mediaDevices.getUserMedia({ audio: true, video: true });
//       setLocalStream(stream);
//       stream.getTracks().forEach(track => {
//         pc.addTrack(track, stream);
//       });

//       ws.onmessage = (event) => {
//         const message = JSON.parse(event.data);
//         handleSignalingData(message);
//       };

//     } catch (error) {
//       console.error('Error setting up local media stream:', error);
//     }
//   };

//   const handleSignalingData = (data) => {

//     console.log(data + ' asdfasfsafsafasdf')
//     if (data.description) {
//       const description = new RTCSessionDescription(data.description);
//       pc.setRemoteDescription(description)
//         .then(() => {
//           if (description.type === 'offer') {
//             pc.createAnswer()
//               .then(answer => {
//                 pc.setLocalDescription(answer);
//                 ws.send(JSON.stringify({ sdp: answer }));
//               })
//               .catch(error => console.error('Error creating answer', error));
//           }
//         })
//         .catch(error => console.error('Error setting remote description', error));
//     } else if (data.iceCandidate) {
//       const candidate = new RTCIceCandidate(data.iceCandidate);
//       pc.addIceCandidate(candidate)
//         .catch(error => console.error('Error adding ICE candidate', error));
//     }else if (data.remoteStream) {
//       try {
//         // Parse the remote stream data if it's a JSON string
//         const parsedRemoteStream = JSON.parse(data.remoteStream);

//         // Create a new MediaStream object and add tracks to it
//         const newRemoteStream = new MediaStream();
//         parsedRemoteStream.tracks.forEach(trackInfo => {
//           const newTrack = new RTCRtpReceiver().track;
//           newTrack.enabled = true;
//           newTrack.id = trackInfo.id;
//           newRemoteStream.addTrack(newTrack);
//         });

//         // Update the remote stream state
//         setRemoteStream(newRemoteStream);
//       } catch (error) {
//         console.error('Error parsing or handling remote stream data:', error);
//       }
//     }
//   };

//   const handleICECandidate = (event) => {
//     console.log(JSON.stringify(event) + ' 1 event');
//     if (event.candidate) {
//       ws.send(JSON.stringify({ iceCandidate: event.candidate }));
//     }
//   };

//   useEffect(() => {

//     const funCall = async () => {
//       pc.onicecandidate = handleICECandidate;
//       pc.ontrack = handleTrack;
//     }

//     funCall();
//   }, []);

//   const handleTrack = (event) => {
//     console.log(JSON.stringify(event) + ' 2 event');
//     if (event.track.kind === 'audio' || event.track.kind === 'video') {
//       setRemoteStream(prevStream => {
//         if (!prevStream) {
//           return new MediaStream([event.track]);
//         }
//         prevStream.addTrack(event.track);
//         return prevStream;
//       });
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.videoContainer}>
//         <RTCView
//           streamURL={localStream && localStream.toURL()}
//           style={styles.rtcView}
//           objectFit="cover"
//           mirror
//         />
//       </View>
//       <View style={styles.videoContainer}>
//         <RTCView
//           streamURL={remoteStream && remoteStream.toURL()}
//           style={styles.rtcView}
//           objectFit="cover"
//         />
//       </View>

//       <Button onPress={}></Button>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: 'row',
//     padding: 20,
//   },
//   videoContainer: {
//     flex: 1,
//     backgroundColor: 'pink', // Change to desired background color
//   },
//   rtcView: {
//     flex: 1,
//   },
// });

// export default WebRTC;

// import React, { useEffect, useState, useRef } from 'react';
// import {
//   Button,
//   SafeAreaView,
//   StyleSheet,
//   ScrollView,
//   View,
//   Text,
//   StatusBar,
// } from 'react-native';
// import { Colors } from 'react-native/Libraries/NewAppScreen';
// import { mediaDevices, RTCView, RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';

// const WebRTC = () => {

//   const ws = useRef(new WebSocket('ws://216.48.187.180:6600'));
//   const pc = useRef(new RTCPeerConnection()); // Ref for PeerConnection

//   const [loaclStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);

//   const configuration = {
//     iceServers: [
//       {
//         urls: [
//           'stun:stun1.l.google.com:19302',
//           'stun:stun2.l.google.com:19302',
//         ],
//       },
//     ],
//     iceCandidatePoolSize: 10,
//   };

//   pc.current.ontrack = function ({ streams: [stream] }) {
//     // Set the remote stream state
//     console.log(stream + ' 3 stream');
//     setRemoteStream(stream);
//   };

// useEffect(() => {
//   ws.current.onopen = () => {
//     console.log('WebSocket connection opened');
//   };

//   ws.current.onmessage = (event) => {
//     const message = JSON.parse(event.data);
//     handleSignalingData(message);
//   };

//   ws.current.onclose = () => {
//     console.log('WebSocket connection closed');
//   };

//   ws.current.onerror = (error) => {
//     console.error('WebSocket error:', error);
//   }

//   // ws.current.send(JSON.stringify({ 'create or join': 'test' }));
// }, []);

//   useEffect(() => {
//     const Camstart = async () => {
//       if (!loaclStream) {
//         // let s;
//         try {
//           mediaDevices.getUserMedia({ audio: true, video: true, }).then((stream) => {
//             console.log(JSON.stringify(stream) + ' 2 stream');
//             setLocalStream(stream);
//           });
//         } catch (e) {
//           console.error(e);
//         }
//       }

//     };

//     // Set up PeerConnection
//     pc.current = new RTCPeerConnection(configuration);

//     Camstart();
//   }, []);

//   const handleICECandidate = event => {
//     if (event.candidate) {
//       // Send ICE candidate data through WebSocket
//       ws.current.send(JSON.stringify({ iceCandidate: event.candidate }));
//     }
//   };

//   const handleSignalingData = (data) => {
//     // Handle signaling data received through WebSocket
//       if (data.sdp) {
//         pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp))
//           .then(() => {
//             if (data.sdp.type === 'offer') {
//               pc.current.createAnswer().then((answer) => {
//                   pc.current.setLocalDescription(answer);
//                   ws.current.send(JSON.stringify({ sdp: answer }));
//                 })
//                 .catch((error) => console.error('Error creating answer', error));
//             }
//           })
//           .catch((error) => console.error('Error setting remote description', error));
//       } else if (data.iceCandidate) {
//         pc.current.addIceCandidate(new RTCIceCandidate(data.iceCandidate)).catch((error) => console.error('Error adding ICE candidate', error));
//       }
    // else if (data.remoteStream) {
    //   try {
    //     // Parse the remote stream data if it's a JSON string
    //     const parsedRemoteStream = JSON.parse(data.remoteStream);

    //     // Create a new MediaStream object and add tracks to it
    //     const newRemoteStream = new MediaStream();
    //     parsedRemoteStream.tracks.forEach(trackInfo => {
    //       const newTrack = new RTCRtpReceiver().track;
    //       newTrack.enabled = true;
    //       newTrack.id = trackInfo.id;
    //       newRemoteStream.addTrack(newTrack);
    //     });

    //     // Update the remote stream state
    //     setRemoteStream(newRemoteStream);
    //   } catch (error) {
    //     console.error('Error parsing or handling remote stream data:', error);
    //   }
    // }
//   };

//   useEffect(() => {
//     // Set up event listeners for ICE candidates and remote tracks
//     pc.current.onicecandidate = handleICECandidate;
//   }, []);
//   const start = async () => {
//     console.log('start');
//     if (!loaclStream) {
//       let s;
//       try {
//         s = await mediaDevices.getUserMedia({ audio: true, video: true, });
//         setLocalStream(s);
//       } catch (e) {
//         console.error(e);
//       }
//     }
//   };
//   const stop = () => {
//     console.log('stop');
//     if (loaclStream) {
//       stream.release();
//       setLocalStream(false);
//       console.log(JSON.stringify(loaclStream) + ' 1 stream');
//     }
//   };
//   return (
//     <>
//       <StatusBar barStyle="dark-content" />
//       <SafeAreaView style={styles.body}>
//         {
//           <View style={styles.loaclStream}>
//             {loaclStream ? (
//               <RTCView
//                 streamURL={loaclStream.toURL()}
//                 style={styles.stream}
//                 objectFit="cover"
//                 mirror={true}
//               />
//             ) : (<View><Text>Waiting for Local stream ...</Text></View>)}
//           </View>
//         }
//         {
//           <View style={styles.stream}>
//             {remoteStream ? (
//               <RTCView
//                 streamURL={remoteStream.toURL()}
//                 style={styles.stream}
//                 objectFit="cover"
//                 mirror={true}
//               />
//             ) : (<View><Text>Waiting for Peer connection ...</Text></View>)}
//           </View>
//         }
//         <View
//           style={styles.footer}>
//           <Button
//             title="Start"
//             onPress={start} />
//           <Button
//             title="Stop"
//             onPress={stop} />
//         </View>
//       </SafeAreaView>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   body: {
//     // backgroundColor: Colors.white,
//     ...StyleSheet.absoluteFill
//   },
//   loaclStream: {
//     flex: 1,
//     paddingBottom: 20
//   },
//   stream: {
//     flex: 1,
//   },
//   footer: {
//     paddingTop: 0,
//     backgroundColor: "blue",
//   },
// });

// export default WebRTC;

// import React, { useEffect, useRef, useState } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { RTCView, mediaDevices, RTCPeerConnection } from 'react-native-webrtc';

// const WebRTC = () => {
//   const ws = useRef(new WebSocket('ws://216.48.187.180:6600'));
//   const pc = useRef(); // Ref for PeerConnection
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);

//   const configuration = {
//     iceServers: [
//       {
//         urls: [
//           'stun:stun1.l.google.com:19302',
//           'stun:stun2.l.google.com:19302',
//         ],
//       },
//     ],
//     iceCandidatePoolSize: 10,
//   };

//   useEffect(() => {
//     // Set up WebSocket event listeners
//     ws.current.onopen = () => {
//       console.log('WebSocket connection opened');
//     };

//     ws.current.onmessage = (event) => {
//       const message = JSON.parse(event.data);
//       handleSignalingData(message);
//     };

//     ws.current.onclose = () => {
//       console.log('WebSocket connection closed');
//     };

//     // Set up PeerConnection
//     pc.current = new RTCPeerConnection(configuration);

//     // Set up local media stream
//     setupLocalStream();

//     // Open camera
//     startWebcam();
//   }, []);

//   const setupLocalStream = async () => {
//     try {
//       const stream = await mediaDevices.getUserMedia({ audio: true, video: true });
//       setLocalStream(stream);
//       stream.getTracks().forEach(track => {
//         pc.current.addTrack(track, stream);
//       });
//     } catch (error) {
//       console.error('Error setting up local media stream:', error);
//     }
//   };

//   const startWebcam = async () => {
//     // const constraints = { audio: true, video: true };

//     pc.current = new RTCPeerConnection(configuration);
//     const local = await mediaDevices.getUserMedia({
//     video: true,
//     audio: true,
//     });
//     // pc.current.addStream(local);
//     pc.current.getTrack(local);
//     const mediaStream = await mediaDevices.getUserMedia({ audio: true, video: true });

//     const devices = await mediaDevices?.enumerateDevices();
//     const facing = 'front';
//     const videoSourceId = devices.find(
//       device => device.kind === 'videoinput' && device.facing === facing
//     );
//     const facingMode = 'user';
//     const constraints = {
//       audio: true,
//       video: {
//         mandatory: {
//           minWidth: 500, // Provide your own width, height and frame rate here
//           minHeight: 300,
//           minFrameRate: 30,
//         },
//         facingMode,
//         optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
//       },
//     };

//     try {
//       const stream = await mediaDevices.getUserMedia(constraints);
//       setLocalStream(stream);
//       stream.getTracks().forEach(track => {
//         pc.current.addTrack(track, stream);
//       });
//     } catch (error) {
//       console.error('Error starting webcam:', error);
//     }
//   };

//   const handleSignalingData = (data) => {
//     // Handle signaling data received through WebSocket
//     if (data.sdp) {
//       // ... (same as your original code)
//     } else if (data.iceCandidate) {
//       // ... (same as your original code)
//     }
//   };

//   const LocalStream = () => {
//     if (localStream) {
//       return (
//         <RTCView
//           streamURL={localStream.toURL()}
//           style={styles.rtcView}
//           mirror
//           objectFit="cover"
//         />
//       );
//     } else {
//       return <Text>No LocalStream</Text>;
//     }
//   };

//   const RemoteStream = () => {
//     if (remoteStream) {
//       return (
//         <RTCView
//           streamURL={remoteStream.toURL()}
//           style={styles.rtcView}
//           objectFit="cover"
//         />
//       );
//     } else {
//       return <Text>No RemoteStream</Text>;
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.videoLocalContainer}>
//         <LocalStream />
//       </View>
//       <View style={styles.videoRemoteContainer}>
//         <RemoteStream />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   videoLocalContainer: {
//     flex: 1,
//     backgroundColor: 'pink', // Change to desired background color
//   },
//   videoRemoteContainer: {
//     flex: 1,
//     backgroundColor: 'orange', // Change to desired background color
//   },
//   rtcView: {
//     flex: 1,
//   },
// });

// export default WebRTC;


// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, Button } from 'react-native';
// import { RTCView, mediaDevices } from 'react-native-webrtc';

// const WebRTC = () => {
//   const [localStream, setLocalStream] = useState(null);

//   useEffect(() => {
//     const getCam = async () => {
      // const devices = await mediaDevices?.enumerateDevices();
      // const facing = 'front';
      // const videoSourceId = devices.find(
      //   device => device.kind === 'videoinput' && device.facing === facing
      // );
      // const facingMode = 'user';
      // const constraints = {
      //   audio: true,
      //   video: {
      //     mandatory: {
      //       minWidth: 500, // Provide your own width, height and frame rate here
      //       minHeight: 300,
      //       minFrameRate: 30,
      //     },
      //     facingMode,
      //     optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
      //   },
      // };
//       const newStream = await mediaDevices.getUserMedia(constraints);
//       setLocalStream(newStream);
//     };
//     getCam();
//   }, []);

//   return (
//     <View style={styles.container}>
      // <RTCView
      //   streamURL={localStream && localStream.toURL()}
      //   style={styles.rtcView}
      // />
//     </View>
//   );
// };



// export default WebRTC;

// import React, { useEffect, useRef, useState } from 'react';
// import { View, Button, TouchableOpacity, Text, StyleSheet } from 'react-native';
// import { RTCPeerConnection, mediaDevices, RTCView } from 'react-native-webrtc';


// const WebRTC = () => {
//   const ws = useRef(new WebSocket('ws://216.48.187.180:6600'));
//   const configuration = { iceServers: [
//     {
//       urls: [
//         'stun:stun1.l.google.com:19302',
//         'stun:stun2.l.google.com:19302',
//       ],
//     },
//   ],
//   iceCandidatePoolSize: 10, };
//   const pc = useRef(new RTCPeerConnection(configuration));
//   const cameraRef = useRef(null);
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);

//   useEffect(() => {
//     // WebSocket event listeners
//     ws.current.onopen = () => {
//       console.log('WebSocket connection opened');
//     };

//     ws.current.onmessage = (event) => {
//       const message = JSON.parse(event.data);
//       handleSignalingData(message);
//     };

//     ws.current.onclose = () => {
//       console.log('WebSocket connection closed');
//     };

//     // ... (Media stream setup and WebRTC event listeners)
//   }, []);

//   const setupStream = async () => {
//     try {
//       const stream = await mediaDevices.getUserMedia({ audio: true, video: true });

//       console.log(JSON.stringify(stream)  + ' stream data');

//       // console.log(localStream.toURL()  + ' localStream.toURL()');
//       setLocalStream(stream);
//       stream.getTracks().forEach(track => {
//         pc.current.addTrack(track, stream);
//       });
//       if (cameraRef.current) {
//         cameraRef.current.srcObject = stream;
//       }
//     } catch (error) {
//       console.error('Error setting up media stream:', error);
//     }
//   };
  
//   useEffect(() => {
//     // Set up event listeners for ICE candidates and remote tracks
//     pc.current.onicecandidate = handleICECandidate;
//     pc.current.ontrack = handleTrack;

//     pc.current = new RTCPeerConnection(configuration);
    
//     // Set up the local media stream
//     setupLocalStream();
//   }, []);

//   const setupLocalStream = async () => {
//     try {
//       const local = await mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });
//       // pc.current.addStream(local);
//       const mediaStream = await mediaDevices.getUserMedia({ audio: true, video: true });
          
//       // Add audio and video tracks to the peer connection
//       mediaStream.getTracks().forEach(track => {
//         pc.current.addTrack(track, mediaStream);
//       });

//       const stream = await mediaDevices.getUserMedia({ audio: true, video: true });

//       setLocalStream(stream);
//       stream.getTracks().forEach(track => {
//         pc.current.addTrack(track, stream);
        
//       });
//       if (cameraRef.current) {
//         cameraRef.current.srcObject = stream;
//       }
//     } catch (error) {
//       console.error('Error setting up local media stream:', error);
//     }
//   };


//   const handleICECandidate = event => {
//     if (event.candidate) {
//       // Send the ICE candidate to the remote peer (using your signaling mechanism)
//       // For example, you might use WebSocket to send the ICE candidate
//       sendSignalingData({ iceCandidate: event.candidate });
//     }
//   };

//   const handleTrack = event => {
//     // Handle remote tracks here
//     if (event.track.kind === 'video' || event.track.kind === 'audio') {
//       setRemoteStream(event.streams[0]);
//     }
//   };

//   const sendSignalingData = data => {
//     // Send the signaling data to the remote peer (using your signaling mechanism)
//     // For example, you might use WebSocket to send the signaling data
//     ws.current.send(JSON.stringify(data));
//   };
//   useEffect(() => {
//     setupStream();
//   }, []);

//   // ... (handleSignalingData function)

//   const handleSignalingData = (data) => {
//     // Handle signaling data received through WebSocket
//     if (data.sdp) {
//       pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp))
//         .then(() => {
//           if (data.sdp.type === 'offer') {
//             // Create answer
//             pc.current.createAnswer()
//               .then((answer) => {
//                 pc.current.setLocalDescription(answer);
//                 // Send answer through WebSocket
//                 ws.current.send(JSON.stringify({ sdp: answer }));
//               })
//               .catch((error) => console.error('Error creating answer', error));
//           }
//         })
//         .catch((error) => console.error('Error setting remote description', error));
//     } else if (data.iceCandidate) {
//       // Add received ICE candidate to peer connection
//       pc.current.addIceCandidate(new RTCIceCandidate(data.iceCandidate))
//         .catch((error) => console.error('Error adding ICE candidate', error));
//     }
//   };
  
//   // }
//   const LocalStream = () => {
//     if(localStream?.toURL().length > 0) {
//       return (
//           <RTCView
//             streamURL={localStream && localStream.toURL()}
//             style={styles.rtcView}
//             mirror
//             objectFit="cover"
//           />
//       )
//     } else{
//       return <Text>no LocalStream</Text>
//     } 
//   }

//   const RemoteStream = () => {
//     if(remoteStream?.toURL().length > 0) {
//       return (
//         <RTCView streamURL={remoteStream && remoteStream.toURL()} 
//           style={styles.rtcView}
//           mirror
//           objectFit="cover"
//         />
//       )
//     } else{
//       return <Text>no RemoteStream</Text>
//     }
//   }
//   return (
//     <>
//       <View
//         style={{
//         flex: 1,
//           padding: 20,
//         }}>
//         <View style={{backgroundColor: 'pink', flex: 1}} >
//           <LocalStream />
//         </View>
//         <View style={{backgroundColor: 'yellow', flex: 1}} >
//           <RemoteStream />
//         </View>
//       </View>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   rtcView: {
//     flex: 1,
//   },
// });

// export default WebRTC;


// import React, {useRef} from 'react';

// import {
//   Button,
//   KeyboardAvoidingView,
//   SafeAreaView,
//   StyleSheet,
//   TextInput,
//   View,
// } from 'react-native';

// import {
//   RTCPeerConnection,
//   RTCIceCandidate,
//   RTCSessionDescription,
//   RTCView,
//   MediaStream,
//   mediaDevices,
// } from 'react-native-webrtc';
// import {useState} from 'react';

// import firestore from '@react-native-firebase/firestore';

// const WebRTC = () => {
  // const [remoteStream, setRemoteStream] = useState(null);
  // const [webcamStarted, setWebcamStarted] = useState(false);
  // const [localStream, setLocalStream] = useState(null);
  // const [channelId, setChannelId] = useState(null);
  // const pc = useRef();
  // const servers = {
  //   iceServers: [
  //     {
  //       urls: [
  //         'stun:stun1.l.google.com:19302',
  //         'stun:stun2.l.google.com:19302',
  //       ],
  //     },
  //   ],
  //   iceCandidatePoolSize: 10,
  // };

  // const startWebcam = async () => {
  //   pc.current = new RTCPeerConnection(servers);
  //   const local = await mediaDevices.getUserMedia({
  //     video: true,
  //     audio: true,
  //   });
  //   // pc.current.addStream(local);
  //   const mediaStream = await mediaDevices.getUserMedia({ audio: true, video: true });
        
  //   // Add audio and video tracks to the peer connection
  //   mediaStream.getTracks().forEach(track => {
  //     pc.current.addTrack(track, mediaStream);
  //   });
  //   setLocalStream(local);
  //   const remote = new MediaStream();
  //   setRemoteStream(remote);

  //   // Push tracks from local stream to peer connection
  //   // local.getTracks().forEach(track => {
  //     // console.log(pc.current.getLocalStreams());
  //     pc.current.getSenders().forEach(sender => {
  //       mediaStream.getTracks().forEach(track => {
  //         if (track.kind === sender.track.kind) {
  //           sender.replaceTrack(track);
  //         }
  //       });
  //     });
  //   // });

  //   // Pull tracks from remote stream, add to video stream
  //   pc.current.ontrack = event => {
  //     event.streams[0].getTracks().forEach(track => {
  //       remote.addTrack(track);
  //     });
  //   };

//     pc.current.onaddstream = event => {
//       setRemoteStream(event.stream);
//     };

  //   setWebcamStarted(true);
  // };

//   const startCall = async () => {
//     const channelDoc = firestore().collection('channels').doc();
//     const offerCandidates = channelDoc.collection('offerCandidates');
//     const answerCandidates = channelDoc.collection('answerCandidates');

//     setChannelId(channelDoc.id);

//     pc.current.onicecandidate = async event => {
//       if (event.candidate) {
//         await offerCandidates.add(event.candidate.toJSON());
//       }
//     };

//     //create offer
//     const offerDescription = await pc.current.createOffer();
//     await pc.current.setLocalDescription(offerDescription);

//     const offer = {
//       sdp: offerDescription.sdp,
//       type: offerDescription.type,
//     };

//     await channelDoc.set({offer});

//     // Listen for remote answer
//     channelDoc.onSnapshot(snapshot => {
//       const data = snapshot.data();
//       if (!pc.current.currentRemoteDescription && data?.answer) {
//         const answerDescription = new RTCSessionDescription(data.answer);
//         pc.current.setRemoteDescription(answerDescription);
//       }
//     });

//     // When answered, add candidate to peer connection
//     answerCandidates.onSnapshot(snapshot => {
//       snapshot.docChanges().forEach(change => {
//         if (change.type === 'added') {
//           const data = change.doc.data();
//           pc.current.addIceCandidate(new RTCIceCandidate(data));
//         }
//       });
//     });
//   };

//   const joinCall = async () => {
//     const channelDoc = firestore().collection('channels').doc(channelId);
//     const offerCandidates = channelDoc.collection('offerCandidates');
//     const answerCandidates = channelDoc.collection('answerCandidates');

//     pc.current.onicecandidate = async event => {
//       if (event.candidate) {
//         await answerCandidates.add(event.candidate.toJSON());
//       }
//     };

//     const channelDocument = await channelDoc.get();
//     const channelData = channelDocument.data();

//     const offerDescription = channelData.offer;

//     await pc.current.setRemoteDescription(
//       new RTCSessionDescription(offerDescription),
//     );

//     const answerDescription = await pc.current.createAnswer();
//     await pc.current.setLocalDescription(answerDescription);

//     const answer = {
//       type: answerDescription.type,
//       sdp: answerDescription.sdp,
//     };

//     await channelDoc.update({answer});

//     offerCandidates.onSnapshot(snapshot => {
//       snapshot.docChanges().forEach(change => {
//         if (change.type === 'added') {
//           const data = change.doc.data();
//           pc.current.addIceCandidate(new RTCIceCandidate(data));
//         }
//       });
//     });
//   };

//   return (
//     <KeyboardAvoidingView style={styles.body} behavior="position">
//       <SafeAreaView>
//         {localStream && (
//           <RTCView
//             stream={localStream}
//             style={styles.stream}
//             objectFit="cover"
//             mirror
//           />
//         )}

//         {remoteStream && (
//           <RTCView
//             streamURL={remoteStream?.toURL()}
//             style={styles.stream}
//             objectFit="cover"
//             mirror
//           />
//         )}
//         <View style={styles.buttons}>
//           {!webcamStarted && (
//             <Button title="Start webcam" onPress={startWebcam} />
//           )}
//           {webcamStarted && <Button title="Start call" onPress={startCall} />}
//           {webcamStarted && (
//             <View style={{flexDirection: 'row'}}>
//               <Button title="Join call" onPress={joinCall} />
//               <TextInput
//                 value={channelId}
//                 placeholder="callId"
//                 minLength={45}
//                 style={{borderWidth: 1, padding: 5}}
//                 onChangeText={newText => setChannelId(newText)}
//               />
//             </View>
//           )}
//         </View>
//       </SafeAreaView>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   body: {
//     backgroundColor: '#fff',

//     justifyContent: 'center',
//     alignItems: 'center',
//     ...StyleSheet.absoluteFill,
//   },
//   stream: {
//     flex: 2,
//     width: 200,
//     height: 100,
//   },
//   buttons: {
//     alignItems: 'flex-start',
//     flexDirection: 'column',
//   },
// });

// export default WebRTC;


// import React, { useEffect, useRef, useState } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { RTCView, mediaDevices } from 'react-native-webrtc';
// import WebSocket from 'ws';

// const WebRTC = () => {
//   const ws = useRef(new WebSocket('ws://your_websocket_server_address'));
//   const pc = useRef(); // Ref for PeerConnection
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);

//   useEffect(() => {
//     ws.current.onopen = () => {
//       console.log('WebSocket connection opened');
//     };

//     ws.current.onmessage = (event) => {
//       const message = JSON.parse(event.data);
//       handleSignalingData(message);
//     };

//     ws.current.onclose = () => {
//       console.log('WebSocket connection closed');
//     };

//     // Set up PeerConnection
//     pc.current = new RTCPeerConnection(configuration);

//     // Set up local media stream
//     setupLocalStream();
//   }, []);

//   const configuration = {
//     iceServers: [
//       {
//         urls: [
//           'stun:stun1.l.google.com:19302',
//           'stun:stun2.l.google.com:19302',
//         ],
//       },
//     ],
//     iceCandidatePoolSize: 10,
//   };

//   const setupLocalStream = async () => {
//     try {
//       const stream = await mediaDevices.getUserMedia({ audio: true, video: true });
//       setLocalStream(stream);
//       stream.getTracks().forEach(track => {
//         pc.current.addTrack(track, stream);
//       });
//     } catch (error) {
//       console.error('Error setting up local media stream:', error);
//     }
//   };

//   const handleSignalingData = (data) => {
//     // Handle signaling data received through WebSocket
//     if (data.sdp) {
//       // ... (same as your original code)
//     } else if (data.iceCandidate) {
//       // ... (same as your original code)
//     }
//   };

//   // ... (other functions and components)

//   return (
//     <View style={styles.container}>
//       <View style={styles.videoContainer}>
//         <RTCView
//           streamURL={localStream && localStream.toURL()}
//           style={styles.rtcView}
//         />
//       </View>
//       <View style={styles.videoContainer}>
//         <RTCView
//           streamURL={remoteStream && remoteStream.toURL()}
//           style={styles.rtcView}
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: 'row',
//     padding: 20,
//   },
//   videoContainer: {
//     flex: 1,
//     backgroundColor: 'pink', // Change to desired background color
//   },
//   rtcView: {
//     flex: 1,
//   },
// });

// export default WebRTC;
