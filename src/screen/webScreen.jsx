import React, { useEffect } from 'react';

import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    ActivityIndicator,
    Text,
    Platform
} from 'react-native';
import { WebView } from 'react-native-webview';

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


const WebScreen = (props) => {
    const { diviceToken } = props;

    const [webUrl, setWebUrl] = React.useState('');

    const [location, setLocation] = React.useState({});
    const [status, setStatus] = React.useState(null);

    const onMessage = (payload) => {
        // console.log('payload asses', payload);
    };

    useEffect(() => {

        async function requestLocationPermission() {
            let getStatus = "";
            if (Platform.OS === 'ios') {
                getStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE); // For iOS
            }
            else {
                getStatus = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION); // For Android
            }
            console.log('getStatus', getStatus);
            setStatus(getStatus)
        }
    
        requestLocationPermission();
    }, []);

    React.useEffect(() => {
        getCurrentPosition = () => {
            // Get the current location
            Geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + latitude + ',' + longitude + '&key=' + "AIzaSyD2c4H1Ldomf95Y_dBG64KbNvE9tzmLDbk")
                        .then((response) => response.json())
                        .then((responseJson) => {

                            setLocation({
                                latitude,
                                longitude,
                                country_name:responseJson.results[0].address_components[6].long_name,
                                code:responseJson.results[0].address_components[6].short_name,
                                city:responseJson.results[0].address_components[5].long_name,
                                address:responseJson.results[0].formatted_address
                            });
                            // if (Config?.APPNAME === "resident") {
                                setWebUrl(`${Config?.PROJECT_URL}?deviceToken=${diviceToken}&device=mobile&latitude=${location?.latitude}&longitude=${location?.longitude}=${location?.city}&code=${location?.code}&country_name=${location?.country_name}`)
                            // } else if (Config?.APPNAME === "rafal" || Config?.APPNAME === "RealEsteatePro360") {
                            //     // url for rafal and RealEsteatePro360
                            //     setWebUrl(`${Config?.PROJECT_URL}`)
                            // } else {
                            //     // url
                            //     setWebUrl(`${Config?.PROJECT_URL}`)
                            // }
                        })
                },
                (error) => {
                    console.error('Error getting location:', error);
                },
                { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
            );
            // Location permission has been granted by the user.
        };
        if (status === RESULTS.GRANTED) {
            getCurrentPosition();
        }
    }, [status]);
    console.log(webUrl + ' webUrl');
    const WebviewRender = () => {
        if (webUrl?.length > 0) {
            return <WebView
                injectedJavaScript={INJECTED_JAVASCRIPT}
                onMessage={onMessage}
                // overScrollMode='never'
                // pullToRefreshEnabled={true}
                // onLoadEnd={() => {
                //     setVisible(false)
                // }}
                incognito={true}
                cacheEnabled={false}
                // cacheMode={'LOAD_NO_CACHE'}
                source={{ uri: webUrl }} style={{ marginTop: 20 }}
                renderLoading={() => {
                    return <ActivityIndicator size="large" />
                }}
            />
        } else {
            return <ActivityIndicator size="large" />
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <WebviewRender />
            {/* <Text>{Config?.APPNAME}</Text> */}
        </SafeAreaView>
    );
}

export default WebScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: -StatusBar.currentHeight + 10,
    },
});