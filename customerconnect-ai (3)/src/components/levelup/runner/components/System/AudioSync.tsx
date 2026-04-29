import React, { useEffect } from 'react';
import { useStore } from '../../store';
import { GameStatus } from '../../types';
import { audio } from './Audio';

export const AudioSync: React.FC = () => {
    const status = useStore(state => state.status);
    const musicVolume = useStore(state => state.musicVolume);
    const isMusicEnabled = useStore(state => state.isMusicEnabled);

    useEffect(() => {
        audio.setMasterVolume(musicVolume);
    }, [musicVolume]);

    useEffect(() => {
        if (isMusicEnabled && status === GameStatus.PLAYING) {
            audio.startMusic();
            audio.unmute();
        } else {
            audio.stopMusic();
            audio.mute();
        }
    }, [isMusicEnabled, status]);

    useEffect(() => {
        const sync = () => {
            if (document.hidden || status !== GameStatus.PLAYING) {
                audio.stopMusic();
                audio.mute();
            } else if (isMusicEnabled) {
                audio.unmute();
            }
        };

        sync();
        document.addEventListener('visibilitychange', sync);
        return () => document.removeEventListener('visibilitychange', sync);
    }, [isMusicEnabled, status]);

    useEffect(() => {
        return () => {
            audio.stopMusic();
            audio.mute();
        };
    }, []);

    return null;
};
