/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { mediaDevices, RTCView, RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';

const WebRTC = () => {

  const ws = useRef(new WebSocket('ws://216.48.187.180:6600'));
  const pc = useRef(new RTCPeerConnection()); // Ref for PeerConnection

  const [loaclStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const configuration = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  pc.current.ontrack = function ({ streams: [stream] }) {
    // Set the remote stream state
    console.log(stream + ' 3 stream');
    setRemoteStream(stream);
  };

useEffect(() => {
  ws.current.onopen = () => {
    console.log('WebSocket connection opened');
  };

  ws.current.onmessage = (event) => {
    const message = JSON.parse(event.data);
    handleSignalingData(message);
  };

  ws.current.onclose = () => {
    console.log('WebSocket connection closed');
  };

  ws.current.onerror = (error) => {
    console.error('WebSocket error:', error);
  }

  // ws.current.send(JSON.stringify({ 'create or join': 'test' }));
}, []);

  useEffect(() => {
    const Camstart = async () => {
      if (!loaclStream) {
        // let s;
        try {
          mediaDevices.getUserMedia({ audio: true, video: true, }).then((stream) => {
            console.log(JSON.stringify(stream) + ' 2 stream');
            setLocalStream(stream);
          });
        } catch (e) {
          console.error(e);
        }
      }

    };

    // Set up PeerConnection
    pc.current = new RTCPeerConnection(configuration);

    Camstart();
  }, []);

  const handleICECandidate = event => {
    if (event.candidate) {
      // Send ICE candidate data through WebSocket
      ws.current.send(JSON.stringify({ iceCandidate: event.candidate }));
    }
  };

  const handleSignalingData = (data) => {
    // Handle signaling data received through WebSocket
      if (data.sdp) {
        pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp))
          .then(() => {
            if (data.sdp.type === 'offer') {
              pc.current.createAnswer().then((answer) => {
                  pc.current.setLocalDescription(answer);
                  ws.current.send(JSON.stringify({ sdp: answer }));
                })
                .catch((error) => console.error('Error creating answer', error));
            }
          })
          .catch((error) => console.error('Error setting remote description', error));
      } else if (data.iceCandidate) {
        pc.current.addIceCandidate(new RTCIceCandidate(data.iceCandidate)).catch((error) => console.error('Error adding ICE candidate', error));
      }
    else if (data.remoteStream) {
      try {
        // Parse the remote stream data if it's a JSON string
        const parsedRemoteStream = JSON.parse(data.remoteStream);

        // Create a new MediaStream object and add tracks to it
        const newRemoteStream = new MediaStream();
        parsedRemoteStream.tracks.forEach(trackInfo => {
          const newTrack = new RTCRtpReceiver().track;
          newTrack.enabled = true;
          newTrack.id = trackInfo.id;
          newRemoteStream.addTrack(newTrack);
        });

        // Update the remote stream state
        setRemoteStream(newRemoteStream);
      } catch (error) {
        console.error('Error parsing or handling remote stream data:', error);
      }
    }
  };

  useEffect(() => {
    // Set up event listeners for ICE candidates and remote tracks
    pc.current.onicecandidate = handleICECandidate;
  }, []);
  const start = async () => {
    console.log('start');
    if (!loaclStream) {
      let s;
      try {
        s = await mediaDevices.getUserMedia({ audio: true, video: true, });
        setLocalStream(s);
      } catch (e) {
        console.error(e);
      }
    }
  };
  const stop = () => {
    console.log('stop');
    if (loaclStream) {
      stream.release();
      setLocalStream(false);
      console.log(JSON.stringify(loaclStream) + ' 1 stream');
    }
  };
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.body}>
        {
          <View style={styles.loaclStream}>
            {loaclStream ? (
              <RTCView
                streamURL={loaclStream.toURL()}
                style={styles.stream}
                objectFit="cover"
                mirror={true}
              />
            ) : (<View><Text>Waiting for Local stream ...</Text></View>)}
          </View>
        }
        {
          <View style={styles.stream}>
            {remoteStream ? (
              <RTCView
                streamURL={remoteStream.toURL()}
                style={styles.stream}
                objectFit="cover"
                mirror={true}
              />
            ) : (<View><Text>Waiting for Peer connection ...</Text></View>)}
          </View>
        }
        <View
          style={styles.footer}>
          <Button
            title="Start"
            onPress={start} />
          <Button
            title="Stop"
            onPress={stop} />
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.white,
    ...StyleSheet.absoluteFill
  },
  loaclStream: {
    flex: 1,
    paddingBottom: 20
  },
  stream: {
    flex: 1,
  },
  footer: {
    paddingTop: 0,
    backgroundColor: Colors.lighter,
  },
});

export default WebRTC;