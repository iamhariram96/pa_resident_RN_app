// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  * @flow strict-local
//  */

import React, { useState, useEffect, useRef } from 'react';
import { View, Button, StatusBar, SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { RTCView, mediaDevices, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
import WebSocket from 'isomorphic-ws'; // For WebSocket support
import FullScreenIcon from '../icons/FullScreen';

const WebRTC = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const ws = useRef(new WebSocket('ws://216.48.187.180:6600'));
  const peerConnectionRef = useRef(null); // Ref for PeerConnection

  useEffect(() => {

    Promise.all([
      setupWebSocket(),
      setupLocalStream(),
      initializePeerConnection(),
    ]).then(()=> {});
    
  }, []);

  const setupWebSocket = () => {
    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      handleSignalingData(JSON.parse(event.data));
    };

    ws.current.onclose = () => {
      console.log('WebSocket closed');
    };
  };

  const setupLocalStream = async () => {
    const stream = await mediaDevices.getUserMedia({ audio: true, video: true });
    setLocalStream(stream);
  };

  const initializePeerConnection = () => {
    const configuration = { iceServers: [] };
    peerConnectionRef.current = new RTCPeerConnection(configuration);

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        sendData({ candidate: event.candidate });
      }
    };

    peerConnectionRef.current.ontrack = (event) => {
      // Handle incoming tracks and set remote stream
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };
  };

  const handleSignalingData = async (data) => {
    if (data.description) {
      const remoteDescription = new RTCSessionDescription(data.description);
      await peerConnectionRef.current.setRemoteDescription(remoteDescription);

      if (data.description.type === 'offer') {
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        sendData({ description: peerConnectionRef.current.localDescription });
      }
    } else if (data.candidate) {
      try {
        await peerConnectionRef.current.addIceCandidate(data.candidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  };

  const sendData = (data) => {
    ws.current.send(JSON.stringify(data));
  };

  const startCall = async () => {

    localStream.getTracks().forEach(track => {
      peerConnectionRef.current.addTrack(track, localStream);
    });

    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);

    sendData({ description: peerConnectionRef.current.localDescription });
  };

  const WaitingComponent = () => {
    return (
      <View style={styles.remoteStyle}>
        <Text style={{color:"#000"}}>
          Waiting for connection ...
        </Text>
      </View>
    )
  }
  return (
    <>
       <StatusBar barStyle="dark-content" />
       <SafeAreaView style={styles.body}>
         {
           <View style={styles.loaclStream}>
             {localStream ? (
              <View style={{flex: 1}}>
                <View style={{position: "absolute", top: 0, right: 0, zIndex: 1, padding: 16}}>
                  <FullScreenIcon color={"#fff"} width={20} height={20}/>
                </View> 
               <RTCView
                 streamURL={localStream && localStream.toURL()}
                 style={styles.stream}
                 objectFit="cover"
                 mirror={true}
               />
               </View>
             ) : (<View><Text>Waiting for Local stream ...</Text></View>)}
           </View>
         }
         {
           <View style={styles.stream}>
             {remoteStream ? (
              <View>
                <RTCView
                  streamURL={remoteStream && remoteStream.toURL()}
                  style={styles?.stream}
                  objectFit="cover"
                  mirror={true}
                />
              </View>
             ) : <WaitingComponent/>}
           </View>
         }
         <View
           style={styles.footer}>
           <Button
             title="Start"
             onPress={startCall} />
           {/* <Button
             title="Stop"
             onPress={stop} /> */}
         </View>
       </SafeAreaView>
     </>
    //  <View>
    //   <RTCView streamURL={localStream && localStream.toURL()} style={{ width: 200, height: 150 }} />
    //   <RTCView streamURL={remoteStream && remoteStream.toURL()} style={{ width: 200, height: 150 }} />
    //   <Button title="Start Call" onPress={startCall} />
    // </View>
  );
};

export default WebRTC;

const styles = StyleSheet.create({
  body: {
    backgroundColor: "#fff",
    ...StyleSheet.absoluteFill
  },
  loaclStream: {
    position: "absolute",
    width: 170,
    height: 250,
    zIndex: 1,
    bottom: 37,
    right: 0,
    
  },
  stream: {
    flex: 1,
  },
  footer: {
    paddingTop: 0,
    backgroundColor: "blue",
  },
  remoteStyle:{
    color: "#000",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderStartColor :"yellow",
  }
});
