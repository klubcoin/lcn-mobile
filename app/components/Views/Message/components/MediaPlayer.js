import React, { Component } from 'react'
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native'
import { makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';
import { colors } from '../../../../styles/common';
import drawables from '../../../../common/drawables';
import Sound from 'react-native-sound';

export default class MediaPlayer extends Component {
    paused = true; // paused at start
    loaded = false

    constructor(props) {
        super(props);
        makeObservable(this, {
            paused: observable,
            loaded: observable
        })

        if (props.source) {
            try {
                this.load();
            } catch (error) {
                console.log(error);
            }
        }
    }

    async onReplay() {

        this.sound.setCurrentTime(0);
        this.play();
    }

    load = () => {
        const { source } = this.props;
        return new Promise((resolve, reject) => {
            if (!source) {
                return reject('file path is empty');
            }

            this.sound = new Sound(source, '', error => {
                if (error) {
                    console.log('failed to load the file', error);
                    return reject(error);
                }
                this.loaded = true;
                return resolve();
            });
        });
    };

    play = async () => {
        if (!this.loaded) {
            try {
                await this.load();
            } catch (error) {
                console.log(error);
            }
        }

        this.paused = false;
        Sound.setCategory('Playback');

        this.sound.play(success => {
            if (success) {
                console.log('successfully finished playing');
            } else {
                console.log('playback failed due to audio decoding errors');
            }
            this.paused = true;
        });
    };

    pause = () => {
        this.sound.pause();
        this.paused = true;
    };

    render() {
        const { visible } = this.props;
        const invisible = visible ? null : styles.invisible;

        return (
            <View style={[styles.controls, invisible]}>
                <TouchableOpacity style={styles.button} onPress={() => this.paused ? this.play() : this.pause()}>
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