import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import NotificationPopup from 'react-native-push-notification-popup';
import { setNotifRef } from '../../../util/notify';

export const NoticeType = {
    success: 1,
    info: 2,
    warning: 3,
    error: 4,
}

const color4Type = (type) => {
    switch (type) {
        case NoticeType.success:
            return '#4CAF50';
        case NoticeType.info:
            return '#0088d9';
        default:
            return '#D32F2F';
    }
}

const NotifPopup = (() => {
    return (
        <NotificationPopup
            ref={e => setNotifRef(e)}
            renderPopupContent={({ title, body }) => {
                const type = title;
                const color = color4Type(type);

                return (
                    <View style={[styles.root, { backgroundColor: color }]}>
                        <View style={styles.body}>
                            <Text style={[styles.bodyText, { color }]}>
                                {body}
                            </Text>
                        </View>
                    </View>
                )
            }}
        />
    )
})

const styles = StyleSheet.create({
    root: {
        alignSelf: 'center',
        borderRadius: 5,
        overflow: 'hidden'
    },
    body: {
        minWidth: 300,
        backgroundColor: "#F8F8F8",
        padding: 10,
        marginLeft: 7,
        elevation: 4,
        flexDirection: 'row'
    },
    bodyText: {
        fontWeight: '400',
        fontSize: 14,
        margin: 5,
        alignSelf: 'center'
    }
})
export default NotifPopup