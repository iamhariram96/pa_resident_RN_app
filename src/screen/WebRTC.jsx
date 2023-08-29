// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  * @flow strict-local
//  */

import React, { useState, useEffect, useRef } from 'react';
import { View, Button, StatusBar, SafeAreaView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { RTCView, mediaDevices, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
import WebSocket from 'isomorphic-ws'; // For WebSocket support

import FullScreenIcon from '../icons/FullScreen';
import OffMic from '../icons/OffMic';
import OnMic from '../icons/OnMic';
import OnVideo from '../icons/OnVideo';
import OffVideo from '../icons/OffVideo';
import CallIcon from '../icons/CallIcon';
import ProfileIcon from '../icons/ProfileIcon';
import SendCall from '../icons/SendCall';

import * as Animatable from 'react-native-animatable';


const WebRTC = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const [Mic, setMic] = useState(true);
  const [Video, setVideo] = useState(true);

  const [IconsShow, setIconsShow] = useState(true);

  const [remoteAndLocalStream, setRemoteAndLocalStream] = useState({
    screen: '1',
    localStreamURl: null,
    remoteStreamURl: null
  });

  const ws = useRef(new WebSocket('ws://216.48.187.180:6600'));
  const peerConnectionRef = useRef(null); // Ref for PeerConnection

  useEffect(() => {

    Promise.all([
      setupWebSocket(),
      setupLocalStream(),
      initializePeerConnection(),
    ]).then(() => { });

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
    setRemoteAndLocalStream({
      ...remoteAndLocalStream,
      localStreamURl: stream,
    });
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

        setRemoteAndLocalStream({
          ...remoteAndLocalStream,
          remoteStreamURl: event.streams[0],
        });
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
        <ProfileIcon />
        <Text style={{ color: "#fff" }}>
          Waiting for connection ...
        </Text>
      </View>
    )
  }

  const ScreenChange = () => {
    if (remoteAndLocalStream.screen === '1') {
      setRemoteAndLocalStream({
        localStreamURl: remoteAndLocalStream.remoteStreamURl,
        remoteStreamURl: remoteAndLocalStream.localStreamURl,
        screen: '2'
      });
    } else {
      setRemoteAndLocalStream({
        localStreamURl: remoteAndLocalStream.remoteStreamURl,
        remoteStreamURl: remoteAndLocalStream.localStreamURl,
        screen: '1'
      });
    }
  }

  const toggleMic = () => {
    if (remoteAndLocalStream?.localStreamURl) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !Mic;
      });
      setMic(!Mic);
    }
  };

  const toggleVideo = () => {
    if (remoteAndLocalStream?.localStreamURl) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !Video;
      });
      setVideo(!Video);
    }
  };

  const Icontoggle = () => {
    setIconsShow(!IconsShow)
  }

  const endCall = () => {

  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.body}>
        <TouchableWithoutFeedback onPress={() => Icontoggle()} style={styles.stream}>
          <View style={[styles.stream, {backgroundColor:'#202124'}]}>
            {
              <View style={[styles.loaclStream, {bottom: IconsShow ? 90 : 0}]}>
                {remoteAndLocalStream.localStreamURl ? (
                  <View style={{ flex: 1 }}>
                    <View style={styles.screenChangeIconView}>
                      <TouchableOpacity onPress={() => ScreenChange()} style={styles.screenChange}>
                        <FullScreenIcon color={"#fff"} width={15} height={15} />
                      </TouchableOpacity>
                    </View>
                    <RTCView
                      streamURL={remoteAndLocalStream.localStreamURl && remoteAndLocalStream.localStreamURl.toURL()}
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
                {remoteAndLocalStream.remoteStreamURl ? (
                  <View style={{ flex: 1 }}>
                    <RTCView
                      streamURL={remoteAndLocalStream.remoteStreamURl && remoteAndLocalStream.remoteStreamURl.toURL()}
                      style={styles?.stream}
                      objectFit="cover"
                      mirror={true}
                    />
                  </View>
                ) : <WaitingComponent />}
              </View>
            }
          </View>
        </TouchableWithoutFeedback>

        <View>
          {IconsShow ? (
            <View style={[ styles.footer ]}>

              <TouchableOpacity onPress={()=> endCall()} style={[styles?.Icons, { backgroundColor: "#e61923" }]}>
                <CallIcon width={26} height={26} color={"#fff"} />
              </TouchableOpacity>

              <TouchableOpacity onPress={()=> startCall()} style={[styles?.Icons, { backgroundColor: "#38af48" }]}>
                <SendCall width={26} height={26} color={"#fff"} />
              </TouchableOpacity>

              {Mic ? (
                <TouchableOpacity onPress={() => toggleMic()} style={styles?.Icons}>
                  <OnMic width={26} height={26} color={"#fff"} />
                </TouchableOpacity>) : (
                <TouchableOpacity onPress={() => toggleMic()} style={styles?.Icons}>
                  <OffMic width={26} height={26} color={"#fff"} />
                </TouchableOpacity>
              )}


              {Video ? (
                <TouchableOpacity onPress={() => toggleVideo()} style={styles?.Icons}>
                  <OnVideo width={26} height={26} color={"#fff"} />
                </TouchableOpacity>) : (
                <TouchableOpacity onPress={() => toggleVideo()} style={styles?.Icons}>
                  <OffVideo width={26} height={26} color={"#fff"} />
                </TouchableOpacity>
              )}

            </View>) : null}
        </View>

        {/* <Button
            title="Start"
            onPress={startCall} 
          /> */}
      </SafeAreaView>
    </>
  );
};

export default WebRTC;

const styles = StyleSheet.create({
  body: {
    backgroundColor: "#000",
    ...StyleSheet.absoluteFill
  },
  loaclStream: {
    position: "absolute",
    width: 170,
    height: 250,
    zIndex: 1,
    // bottom: 90,
    right: 0,
  },
  stream: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: "space-around",
    marginBottom: 20,
    marginTop: 20,
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
  remoteStyle: {
    color: "#000",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  screenChange: {
    backgroundColor: "#80808091", padding: 12, borderRadius: 60
  },
  screenChangeIconView: { position: "absolute", top: 0, right: 0, zIndex: 1, padding: 14 },
  Icons: {
    backgroundColor: "#80808091",
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
  },
});
