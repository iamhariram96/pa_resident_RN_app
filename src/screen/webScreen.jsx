import React from 'react';

import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';

import { WebView } from 'react-native-webview';

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

    // console.log(`https://dev-resident-v3.propertyautomate.com/login/?deviceToken=${diviceToken}`+ ' diviceToken');
    const onMessage = (payload) => {
        console.log('payload asses', payload);
    };

    const WebviewRender = () => {
        if (diviceToken?.length > 0) {
            return <WebView
                injectedJavaScript={INJECTED_JAVASCRIPT}
                onMessage={onMessage}
                source={{ uri: `https://dev-resident-v3.propertyautomate.com/login/?deviceToken=${diviceToken}` }} style={{ marginTop: 20 }} />
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
        justifyContent: 'center',
        backgroundColor: 'white',
    },
});