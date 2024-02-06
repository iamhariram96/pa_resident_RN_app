import messaging from '@react-native-firebase/messaging';

import { onDisplayNotificationFun } from './notificationHandler';
import invokeApp from 'react-native-invoke-app';


export default async (remoteMessage) => {
  messaging().onMessage(async (message) => {
    onDisplayNotificationFun(message);
    invokeApp()
    console.log("background")
  });
  // Perform tasks, update data, show notifications, etc.
  // Note: This function runs in the background, so avoid UI-related actions.
};