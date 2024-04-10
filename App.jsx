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
import {onDisplayNotificationFun} from './src/utils/notificationHandler';
import {firebase} from '@react-native-firebase/app';
import SplashScreen from 'react-native-splash-screen';
import WebScreen from './src/screen/webScreen';
import Config from 'react-native-config';
// import { myAppVersionName } from './android/app/build.gradle';
import {
  requestCameraPermission,
  requestMicrophonePermission,
} from './src/utils/accessPermissions';
import {Alert, Linking, Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';

const App = () => {
  const [token, setToken] = useState('');
  const [webUrl, setWebUrl] = React.useState(Config?.PROJECT_URL);

  useEffect(() => {
    setWebUrl(`${Config?.PROJECT_URL}?deviceToken=${token}`);
  }, [token]);

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      // eslint-disable-next-line no-undef
      SplashScreen.hide();
    }
    // getVersion();
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

  useEffect(() => {
    setupNotifications();
    permission();
    // eslint-disable-next-line no-undef, react-hooks/exhaustive-deps
  }, []);

  const getVersion = () => {
    fetch(
      `https://dev-auth.propertyautomate.com/api/v1/version_control/get_version`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({build: Config.BUILD_CODE}),
      },
    )
      .then(response => {
        // Check if the response status is OK (status code 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // Parse the response as JSON
        return response.json();
      })
      .then(data => {
        // Handle the data from the successful response
        const current_version = DeviceInfo.getVersion();
        let app_version_data = data?.data?.version_data?.find(
          i => i?.build_code === Config.BUILD_CODE,
        );
        if (app_version_data?.app_version_data !== current_version) {
          showVersionAlert({
            new_version: app_version_data?.app_version,
            priority: app_version_data?.version_priority,
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const permission = async () => {
    const hasCameraAccess = await requestCameraPermission();
    if (hasCameraAccess) {
      const hasMicrophoneAccess = await requestMicrophonePermission();
      if (hasMicrophoneAccess) {
        console.log('You can use the microphone');
      } else {
        console.log('Microphone permission denied');
      }
    }
  };

  const openPlayStore = () => {
    let url;
    if (Platform.OS === 'android') {
      url = `http://play.google.com/store/apps/details?id=${DeviceInfo.getBundleId()}`;
    } else if (Platform.OS === 'ios') {
      url = `itms-apps://itunes.apple.com/app/${DeviceInfo.getBundleId()}`;
    }

    // Use Linking to open the Play Store URL
    Linking.openURL(url).catch(err =>
      console.error('Error opening Play Store:', err),
    );
  };

  const showVersionAlert = ({new_version, priority}) => {
    let buttons = [
      {
        text: 'Update Now',
        onPress: () => openPlayStore(),
      },
    ];
    if (priority !== 'High') {
      buttons.push({
        text: 'Remaind Me Later',
        onPress: () => console.log('OK Pressed'),
        style: 'cancel',
      });
    }

    Alert.alert(
      'Update Available',
      `A newer version is available - v${new_version}`,
      buttons,
      {cancelable: false},
    );
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
      console.log(url, 'url');

      if (url?.length > 0) {
        setWebUrl(url);
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
        setWebUrl(url);
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

export default App;
