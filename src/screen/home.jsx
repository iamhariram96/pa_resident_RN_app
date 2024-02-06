// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  * @flow
//  */

// App.jsx
import React, {useEffect, useState} from 'react';
import notifee, {AuthorizationStatus} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import {onDisplayNotificationFun} from '../utils/notificationHandler';
import {firebase} from '@react-native-firebase/app';
import SplashScreen from 'react-native-splash-screen';
import WebScreen from './webScreen';
import Config from 'react-native-config';
import {
  requestCameraPermission,
  requestMicrophonePermission,
} from '../utils/accessPermissions';
import { Linking } from 'react-native';

const Home = ({navigation,route}) => {
  const [token, setToken] = useState('');
  const [webUrl, setWebUrl] = React.useState(Config?.PROJECT_URL);

  useEffect(() => {
    setupNotifications();
    permission()
  }, []);

  useEffect(() => {

    if(!route?.params?.data){
        setWebUrl(`${Config?.PROJECT_URL}?${token ? `deviceToken=${token}`:''}`);
    }
    if(route?.params?.data){
      setWebUrl(route?.params?.data) 
    }
  }, [token]);

  
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

  const permission = async () => {
    const hasCameraAccess = await requestCameraPermission();
    if(hasCameraAccess){
      const hasMicrophoneAccess = await requestMicrophonePermission();
      if (hasMicrophoneAccess) {
        console.log('You can use the microphone');
      } else {
        console.log('Microphone permission denied');
      }
    }
  };


  const setupFCM = async () => {
    // Get the FCM token for this device
    //
    const enabled = await firebase.messaging().hasPermission();

    if (enabled) {
      const token = await messaging().getToken();
      // console.log('FCM Token:', token);
      setToken(token);
    }

    // Listen for incoming FCM messages when the app is in the foreground
    messaging().onMessage(async message => {
      // console.log('FCM Message received:', message);
      onDisplayNotificationFun(message);
    });

    // Listen for incoming FCM messages when the app is in the background or terminated
    messaging().setBackgroundMessageHandler(async message => {
      onDisplayNotificationFun(message);
    });

    // For handling notification press events in the foreground
    notifee.onForegroundEvent(async ({type, detail}) => {
      let url = '';
      if (detail?.pressAction?.id === 'rejected') {
        url = `${detail?.notification?.data?.redirect_url}&status=rejected`;
      } else if (detail?.pressAction?.id === 'accept') {
        url = `${detail?.notification?.data?.redirect_url}&status=accept`;
      } else if (detail?.pressAction?.id === 'video') {
        url = `${detail?.notification?.data?.redirect_url}&status=video`;
      } else if (type === 1 && !detail?.pressAction?.id) {
        url = `${detail?.notification?.data?.redirect_url}`;
      }

      if (url?.length > 0) {
        // setWebUrl(url);
        navigation.navigate("Home",{data:url})

      }

      console.log('Notification Press in Foreground:', type);
    });

    // For handling notification press events in the background
    notifee.onBackgroundEvent(async ({type, detail}) => {


      let url = '';
      if (detail?.pressAction?.id === 'rejected') {
        url = `${detail?.notification?.data?.redirect_url}&status=rejected`;
      } else if (detail?.pressAction?.id === 'accept') {
        url = `${detail?.notification?.data?.redirect_url}&status=accept`;
      } else if (detail?.pressAction?.id === 'video') {
        url = `${detail?.notification?.data?.redirect_url}&status=video`;
      } else if (type === 1 && !detail?.pressAction?.id) {
        url = `${detail?.notification?.data?.redirect_url}`;
      }

      
      if (url?.length > 0) {
        // setWebUrl(url);
        navigation.navigate("Home",{data:url})
      }

      console.log('Notification Press in background:', type);
    });
  };

  return (
    <>
      <WebScreen diviceToken={token} webUrl={webUrl} />
    </>
  );
};

export default Home;