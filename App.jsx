// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  * @flow
//  */


// App.jsx
import React, { useEffect, useState } from 'react';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { onDisplayNotificationFun } from './src/utils/notificationHandler';
import useWebSocket from "react-use-websocket";
import WebRTC from "./src/screen/WebRTC";
import WebScreen from "./src/screen/webScreen";
import { Text, TouchableOpacity } from 'react-native';
const App = () => {

  const [token, setToken] = useState("");

  useEffect(() => {
    const ws = new WebSocket('ws://216.48.187.180:6600');

    ws.onopen = () => {
      // Connection opened
      console.log('WebSocket connection opened');
      ws.send('Hello, server!'); // Send a message to the server
    };
    
    ws.onmessage = (e) => {
      // Receive a message from the server
      console.log(e);
    };
    ws.onerror = (e) => {
      // An error occurred
      console.log(e.message);
    };
    ws.onclose = (e) => {
      // Connection closed
      console.log(e.code, e.reason);
    };
  }, []);

  useEffect(() => {
    setupNotifications();
    setupFCM();
  }, []);

  const setupNotifications = async () => {
    // Check if the app has been granted notification permissions
    const settings = await notifee.getNotificationSettings();
    await notifee.requestPermission();

    if (settings.authorizationStatus === AuthorizationStatus.NOT_DETERMINED) {
      // Ask for notification permission if it's not determined yet
      const permissionResult = await notifee.requestPermission();

      if (!permissionResult) {
        return;
      }
    } else if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
      return;
    }
  };

  const setupFCM = async () => {
    // Get the FCM token for this device
    const token = await messaging().getToken();
    // console.log('FCM Token:', token);
    setToken(token);

    // Listen for incoming FCM messages when the app is in the foreground
    messaging().onMessage(async (message) => {
      // console.log('FCM Message received:', message);
      onDisplayNotificationFun(message);
    });

    // Listen for incoming FCM messages when the app is in the background or terminated
    messaging().setBackgroundMessageHandler(async (message) => {
      onDisplayNotificationFun(message);
    });


    // For handling notification press events in the foreground
    notifee.onForegroundEvent(async ({ type, detail }) => {
      console.log('Notification Press in Foreground:', detail);
    });

    // For handling notification press events in the background
    notifee.onBackgroundEvent(({ type, detail }) => {
      console.log('Notification Press in background:', detail);
    });

  };

  return (
    // <WebScreen diviceToken={token} />
    <WebRTC />
  );
};

export default App;