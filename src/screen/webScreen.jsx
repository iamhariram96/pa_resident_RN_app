import React, { useEffect } from 'react';

import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    ActivityIndicator,
    Text,
    View
} from 'react-native';

import { WebView } from 'react-native-webview';

import Config from "react-native-config";

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

    const onMessage = (payload) => {
        // console.log('payload asses', payload);
    };

    console.log(JSON.stringify(Config) + ' asdfnasdkfjs');

    useEffect(() => {
        if (Config?.APPNAME === "resident") {
            setWebUrl(`${Config?.PROJECT_URL}/?deviceToken=${diviceToken}`)
        } else if (Config?.APPNAME === "rafal" || Config?.APPNAME === "RealEsteatePro360") {
            // url for rafal and RealEsteatePro360
            setWebUrl(`${Config?.PROJECT_URL}`)
        } else {
            // url
            setWebUrl(`${Config?.PROJECT_URL}`)
        }
    }, []);

    const WebviewRender = () => {
        if (webUrl?.length > 0) {
            return <WebView
                injectedJavaScript={INJECTED_JAVASCRIPT}
                onMessage={onMessage}
                source={{ uri: webUrl }} style={{ marginTop: 20 }}
            />
        } else {
            return <ActivityIndicator size="large" />
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <WebviewRender />
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