// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  * @flow
//  */


// App.jsx
import React, { useEffect, useState } from 'react';
import {View, Text, Image, StyleSheet} from "react-native";
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { onDisplayNotificationFun } from './src/utils/notificationHandler';
import { firebase } from '@react-native-firebase/app';
import SplashScreen from 'react-native-splash-screen';
import Modal from "react-native-modal";

import Logo from './src/assets/logo.png'
import WebScreen from "./src/screen/webScreen";
const App = () => {

  const [token, setToken] = useState("");

  useEffect(() => {
    setupNotifications();
  }, []);

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      // eslint-disable-next-line no-undef
      SplashScreen.hide();
    }
  }, []);
  

  const setupNotifications = async () => {
    // Check if the app has been granted notification permissions    
    
    const settings = await notifee.getNotificationSettings();
    await notifee.requestPermission();
    await setupFCM();
    // await messaging().registerDeviceForRemoteMessages();

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
    // 
    const enabled = await firebase.messaging().hasPermission();
    console.log('FCM Token:', token);
    if (enabled) {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      setToken(token);
    }

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
      // console.log('Notification Press in Foreground:', detail);
    });

    // For handling notification press events in the background
    notifee.onBackgroundEvent(({ type, detail }) => {
      console.log('Notification Press in background:', detail);
    });

  };

  return (
    <>
      {/* <Modal isVisible={true}>
        <View style={styles.modelCard}>
          <View style={styles.title}>
            <Image source={require('./src/assets/logo.png')} style={styles.logo}/>
            <Text>I am the modal content!</Text>
          </View>
        </View>
      </Modal> */}
      <WebScreen diviceToken={token}/>
    </>
  );
};

export default App;



const styles = StyleSheet.create({
  logo:{
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 8
  },
  title: {
    flex: 1,
    flexDirection:"row",
    justifyContent:"start",
    alignItems:"center"
  },
  modelCard:{ backgroundColor:"#fff", width: "100%", height: "40%", borderRadius: 6, padding: 20 }
});
