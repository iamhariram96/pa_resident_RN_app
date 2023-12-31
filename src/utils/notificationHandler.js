import notifee, { AndroidImportance, AndroidVisibility, AndroidCategory, AndroidStyle } from '@notifee/react-native';



export const onDisplayNotificationFun = async (data) => {
  // Create a channel (required for Android)

  console.log(JSON.stringify(data) + " onDisplayNotificationFun");
  const channelId = await notifee.createChannel({
    id: 'important',
    name: 'Important Notifications 34',
    importance: AndroidImportance.HIGH,
    sound: "doorbell.wav",
    category: AndroidCategory.CALL,
    visibility: AndroidVisibility.PUBLIC,
    timestamp: Date.now(),
    showTimestamp: true,
    fullScreenAction: {
      id: 'default 1',
    },
    timestamp: Date.now() - 480000, // 8 minutes ago
  });

  // Display a notification
  let varTitle = "";
  let varBody = "";
  // let varLargeIcon = "https://my-cdn.com/user/123/upload/456.png";
  let varLargeIcon = "https://img.freepik.com/free-photo/half-profile-image-handsome-young-caucasian-man-with-good-skin-brown-eyes-black-stylish-hair-stubble-posing-isolated-against-blank-wall-looking-front-him-smiling_343059-4560.jpg";
  let bigPicture = "https://img.freepik.com/free-photo/half-profile-image-handsome-young-caucasian-man-with-good-skin-brown-eyes-black-stylish-hair-stubble-posing-isolated-against-blank-wall-looking-front-him-smiling_343059-4560.jpg";

  console.log(data?.data?.image)
  if (Object.keys(data?.data).length > 0) {
    // PA push
    varTitle = data?.data?.title;
    varBody = data?.data?.body;
  } else {
    // FCM testfcm console push notification
    varTitle = data?.notification?.title;
    varBody = data?.notification?.body;
  }
  if (data?.data?.image?.length > 0) {
    bigPicture = data?.data?.image;
  }

  if (data?.notification?.android?.smallIcon?.length > 0) {
    varLargeIcon = data?.notification?.android?.smallIcon;
  }



  return await notifee.displayNotification({
    id: data?.messageId,
    title: varTitle,
    body: varBody,
    timestamp: Date.now() - 480000, // 8 minutes ago
    android: {
      // smallIcon: 'ic_launcher_adaptive_fore',
      channelId,
      ongoing: true,
      category: AndroidCategory.CALL,
      visibility: AndroidVisibility.PUBLIC,
      importance: AndroidImportance.HIGH,
      timestamp: Date.now(),
      showTimestamp: true,
      largeIcon: varLargeIcon,
      loopSound: true,
      timestamp: Date.now() - 480000, // 8 minutes ago
      color: '#4caf50',
      fullScreenAction: {
        id: 'default 2',
      },
      actions: [
        {
          id: 'myButtonAction', // Action identifier
          title: 'My Button', // Action button title
        },
      ],
      style: { type: AndroidStyle.BIGPICTURE, picture: bigPicture },
      actions: [
        {
          title: '<p style="background-color: #9c27b0;"><p style="color: #f44336;"><b>Do Not Allow</b></p></p>',
          pressAction: { id: 'rejected' },
        },
        {
          title: '<p style="color: #008000;"><b>Allow</b></p>',
          pressAction: { id: 'accept' },
        },
        {
          title: '<p><b>Video</b></p>',
          pressAction: { id: 'video' },
        },
      ],
    },
    ios: {
      sound: "doorbell.wav",
      critical: true,
      interruptionLevel: "critical",
      timestamp: Date.now() - 480000,
      attachments: [
        {
          url: bigPicture,
          id: 'big-picture',
          options: {
            thumbnailClippingRect: {
              x: 0.1,
              y: 0.1,
              width: 0.8,
              height: 0.8,
            },
            thumbnailTime: 10,
          }
        }
      ],
    },
  });
}