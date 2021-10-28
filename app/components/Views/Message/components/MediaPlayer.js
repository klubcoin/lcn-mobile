import React, { Component } from 'react'
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native'
import { makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';
import moment from 'moment'
import TrackPlayer from 'react-native-track-player';
import { colors } from '../../../../styles/common';
import drawables from '../../../../common/drawables';

let mediaQueueTime = 0;
export default class MediaPlayer extends Component {

    listeners = {};
    paused = false; // autoplay at start

    constructor(props) {
        super(props);

        makeObservable(this, {
            paused: observable,
        })

        if (props.source) {
            const initPlayer = async () => {
                this.listeners.error = TrackPlayer.addEventListener('playback-error', (e) => this.onStateError(e));
                this.listeners.stateChanged = TrackPlayer.addEventListener('playback-state', (e) => this.onStateChange(e));
                this.listeners.trackChanged = TrackPlayer.addEventListener('playback-track-changed', (e) => this.onTrackChanged(e));
                this.listeners.queueEnded = TrackPlayer.addEventListener('playback-queue-ended', (e) => this.onQueueEnded(e));

                await this.queueTrack()
            };
            initPlayer()
        }
    }

    async queueTrack() {
        const milliseconds = moment().valueOf()
        if (milliseconds - mediaQueueTime < 800) return;
        mediaQueueTime = milliseconds

        const { source } = this.props;
        await TrackPlayer.remove(0);
        // Adds a track to the queue
        await TrackPlayer.add({
            id: 'liquichain',
            url: source,
            title: 'audio',
            artist: '',
        });
    }

    onStateError(e) {
        console.warn('media error', e)
        this.paused = true;
    }

    async onStateChange(e) {
        if (e) {
            if (e.state == 2 || e.state == 'paused') {
                this.paused = true;
            } else if (e.state == 3 || e.state == 'playing') {
                this.paused = false;
            }
        }
    }

    onTrackChanged(e) {
        console.log('media track changed', e)
    }

    async onQueueEnded(e) {
        this.paused = true;
        TrackPlayer.pause();
    }

    onPlayPause() {
        if (this.paused) {
            this.paused = false;
            TrackPlayer.play();
        } else {
            this.paused = true;
            TrackPlayer.pause();
        }
    }

    async onReplay() {
        this.paused = false;
        await TrackPlayer.seekTo(0);
        TrackPlayer.play();
    }

    render() {
        const { visible } = this.props;
        const invisible = visible ? null : styles.invisible;

        return (
            <View style={[styles.controls, invisible]}>
                <TouchableOpacity style={styles.button} onPress={() => this.onPlayPause()}>
                    <Image style={styles.control} source={{ uri: this.paused ? drawables.btnPlay : drawables.btnPause }} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.rightBtn]} onPress={() => this.onReplay()}>
                    <Image style={styles.control} source={{ uri: drawables.btnReplay }} />
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 245,
        paddingHorizontal: 10
    },
    button: {
        width: 32,
        height: 32,
        borderRadius: 16,
        elevation: 0,
        backgroundColor: colors.white,
    },
    rightBtn: {
        marginLeft: 8
    },
    control: {
        width: 32,
        height: 32,
        resizeMode: 'contain',
    },
    invisible: {
        display: 'none',
        opacity: 0,
    }
})

observer(MediaPlayer)