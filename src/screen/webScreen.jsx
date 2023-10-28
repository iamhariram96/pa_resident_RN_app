import React, { useEffect } from 'react';

import {
    // SafeAreaView,
    StatusBar,
    StyleSheet,
    ActivityIndicator,
    Text,
    Platform,
    View,
    Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Config from "react-native-config";

import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';

const INJECTED_JAVASCRIPT = `(function() {
    const authLocalStorage = window.localStorage.getItem('authToken');
    const clientLocalStorage = window.localStorage.getItem('client');
    const userProfileIdLocalStorage = window.localStorage.getItem('userProfileId');

    const obj = {
        authLocalStorage,
        clientLocalStorage,
        userProfileIdLocalStorage
    }

    const getItemLocalStorage = JSON.stringify(obj);
    window.ReactNativeWebView.postMessage(getItemLocalStorage);
})();`;

export const getGeoLocationJS = () => {
    const getCurrentPosition = `
      navigator.geolocation.getCurrentPosition = (success, error, options) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'getCurrentPosition', options: options }));
  
        window.addEventListener('message', (e) => {
          let eventData = {}
          try {
            eventData = JSON.parse(e.data);
          } catch (e) {}
  
          if (eventData.event === 'currentPosition') {
            success(eventData.data);
          } else if (eventData.event === 'currentPositionError') {
            error(eventData.data);
          }
        });
      };
      true;
    `;
  
    const watchPosition = `
      navigator.geolocation.watchPosition = (success, error, options) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'watchPosition', options: options }));
  
        window.addEventListener('message', (e) => {
          let eventData = {}
          try {
            eventData = JSON.parse(e.data);
          } catch (e) {}
  
          if (eventData.event === 'watchPosition') {
            success(eventData.data);
          } else if (eventData.event === 'watchPositionError') {
            error(eventData.data);
          }
        });
      };
      true;
    `;
  
    const clearWatch = `
      navigator.geolocation.clearWatch = (watchID) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'clearWatch', watchID: watchID }));
      };
      true;
    `;
  
    return `
      (function() {
        ${getCurrentPosition}
        ${watchPosition}
        ${clearWatch}
      })();
    `;
  };

let webview = null;

const isIOS = Platform.OS === 'ios';
const { height } = Dimensions.get('window');

const WebScreen = (props) => {
    const { diviceToken } = props;

    const [webUrl, setWebUrl] = React.useState('');

    const [location, setLocation] = React.useState({});
    const [status, setStatus] = React.useState(null);
    
    const onMessage = (payload) => {
        console.log('payload asses', payload);
    };


    useEffect(() => {
        setWebUrl(`${Config?.PROJECT_URL}?deviceToken=${diviceToken}`)
        // async function requestLocationPermission() {
        //     let getStatus = "";
        //     if (Platform.OS === 'ios') {
        //         getStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE); // For iOS
        //     }
        //     else {
        //         getStatus = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION); // For Android
        //     }
        //     console.log('getStatus', getStatus);
        //     setStatus(getStatus)
        // }
    
        // requestLocationPermission();
    }, []);

    // React.useEffect(() => {
    //     getCurrentPosition = () => {
    //         // Get the current location
    //         // Geolocation.getCurrentPosition(
    //         //     async (position) => {
    //         //         const { latitude, longitude } = position.coords;
    //         //         await fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + latitude + ',' + longitude + '&key=' + "AIzaSyD2c4H1Ldomf95Y_dBG64KbNvE9tzmLDbk")
    //         //             .then((response) => response.json())
    //         //             .then((responseJson) => {

    //         //                 setLocation({
    //         //                     latitude,
    //         //                     longitude,
    //         //                     country_name:responseJson.results[0].address_components[6].long_name,
    //         //                     code:responseJson.results[0].address_components[6].short_name,
    //         //                     city:responseJson.results[0].address_components[5].long_name,
    //         //                     address:responseJson.results[0].formatted_address
    //         //                 });
    //         //                 // if (Config?.APPNAME === "resident") {
    //         //                     setWebUrl(`${Config?.PROJECT_URL}?deviceToken=${diviceToken}&device=mobile&latitude=${location?.latitude}&longitude=${location?.longitude}=${location?.city}&code=${location?.code}&country_name=${location?.country_name}`)
    //         //                 // } else if (Config?.APPNAME === "rafal" || Config?.APPNAME === "RealEsteatePro360") {
    //         //                 //     // url for rafal and RealEsteatePro360
    //                             setWebUrl(`${Config?.PROJECT_URL}?deviceToken=${diviceToken}`)
    //         //                 // } else {
    //         //                 //     // url
    //         //                 //     setWebUrl(`${Config?.PROJECT_URL}`)
    //         //                 // }
    //         //             })
    //         //     },
    //         //     (error) => {
    //         //         console.error('Error getting location:', error);
    //         //         setWebUrl(`${Config?.PROJECT_URL}?deviceToken=${diviceToken}`);
    //         //     },
    //         //     { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
    //         // );
    //         // Location permission has been granted by the user.
    //     };
    //     if (status === RESULTS.GRANTED) {
    //         getCurrentPosition();
    //     }else{
    //         getCurrentPosition();
    //     }
    // }, [status]);

    const WebviewRender = () => {
        if (webUrl?.length > 0) {
            return <WebView
                injectedJavaScript={getGeoLocationJS()}
                onMessage={ event => {
                    let data = {}
                    try {
                      data = JSON.parse(event.nativeEvent.data);
                    } catch (e) {
                      console.log(e);
                    }
                
                    if (data?.event && data.event === 'getCurrentPosition') {
                      Geolocation.getCurrentPosition((position) => {
                        webview.postMessage(JSON.stringify({ event: 'currentPosition', data: position }));
                      }, (error) => {
                        webview.postMessage(JSON.stringify({ event: 'currentPositionError', data: error }));
                      }, data.options);
                    } else if (data?.event && data.event === 'watchPosition') {
                      Geolocation.watchPosition((position) => {
                        webview.postMessage(JSON.stringify({ event: 'watchPosition', data: position }));
                      }, (error) => {
                        webview.postMessage(JSON.stringify({ event: 'watchPositionError', data: error }));
                      }, data.options);
                    } else if (data?.event && data.event === 'clearWatch') {
                      Geolocation.clearWatch(data.watchID);
                    } 
                  }}
                  ref={ ref => {
                    webview = ref;
                    // if (onRef) {
                    //   onRef(webview)
                    // }
                  }}
                overScrollMode='never'
                pullToRefreshEnabled={true}

                cacheEnabled={true}
                // cacheMode={'LOAD_NO_CACHE'}
                source={{ uri: webUrl }} style={{ marginTop: isIOS ? 0 : 10 }}

                geolocationEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                
                cacheMode={'LOAD_DEFAULT'}
                sharedCookiesEnabled={true}
                setBuiltInZoomControls={false}

                useWebKit
                originWhitelist={['*']}
                incognito={false}

                mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"

                geolocationPermissionRequest={(request) => {
                  if (true) {
                    // You have geolocation permission
                    request.grant();
                  } else {
                    // You don't have geolocation permission
                    request.deny();
                  }
                }}
            />
        } else {
            return <ActivityIndicator size="large" />
        }
    }

    return (
        <View style={{flex: 1,backgroundColor:"#1976d2"}}>
            <SafeAreaProvider style={{flex: 1}}>
                <StatusBar translucent backgroundColor={"#1976d2"} barStyle="light-content"/>
                <SafeAreaView style={{flex:1, paddingBottom: isIOS && height < 812 ? -1 : -40}}>
                    <WebviewRender />
                </SafeAreaView>
            </SafeAreaProvider>
        </View>
    );
}

const styles = StyleSheet.create({
    StatusBar: {
        height: 0,
        backgroundColor: 'rgba(22,7,92,1)'
    }
});

export default WebScreen;