import React, { useState } from 'react'
import ReactPlayer from 'react-player';
import { Volume2, VolumeX} from 'react-feather'
import styles from './Player.module.css'

export const Player = (props) => {
    const {stream , email, muted} = props;
    const [mute, setMute] = useState(muted);
    const handleMute = () => {
        if(!muted) setMute(!mute)
    }
    return (
        <div className={styles.stream}>
            <p>{email}</p>
            <i onClick={handleMute}  >
                { mute ? <VolumeX strokeWidth='1px'/> : <Volume2 strokeWidth='1px'/> }
            </i>              
            <ReactPlayer
                className={styles.videoPlayer}
                width="100%"
                height="100%"
                playing
                muted={mute}
                url={stream}
            />
        </div>
    )
}
