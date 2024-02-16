import './Renderer.css';
import {useContext, useEffect, useMemo, useState} from "react";
import {slideshowContext} from "../SlideshowContext/SlideshowContext";
import {isNumber, map} from 'lodash';

export function Renderer() {
    const [videoRef, setVideoRef] = useState(null);
    const [intervalId, setIntervalId] = useState(null);
    const {content, play, selectedDuration, timeByVideo, onNext, setVideoTime} = useContext(slideshowContext);
    
    const isVideo = useMemo(
        () => [
            'video/x-matroska',
            'video/quicktime',
            'video/mp4',
            'video/webm',
            'video/mp2t'
        ].includes(content.mimeType),
        [content]
    );

    useEffect(() => {
        if (isVideo || !play) {
            resetInterval();

            return;
        }

        if (isNumber(intervalId)) {
            return;
        }

        setIntervalId(setInterval(onNext, selectedDuration * 1000));
    }, [play, content]);

    useEffect(() => {
        if (isVideo || !play) {
            return;
        }

        if (isNumber(intervalId)) {
            resetInterval();
        }

        setIntervalId(setInterval(onNext, selectedDuration * 1000));
    }, [selectedDuration]);

    useEffect(() => {
        if (!videoRef || !timeByVideo) {
            return;
        }

        videoRef.currentTime = timeByVideo[content.path] || 0;
    }, [content, videoRef])

    function resetInterval() {
        clearInterval(intervalId);
        setIntervalId(null);
    }

    function encodePath(path) {
        const fragments = path?.split('/');
        const encodedPath = map(fragments, encodeURIComponent).join('/');

        return `file://${encodedPath}`;
    }

    function _setVideoTime(e) {
        setVideoTime(content, e.target.currentTime);
    }
  
    if (isVideo) {
        return (
            <video muted
                   controls
                   autoPlay
                   ref={setVideoRef}
                   key={content.path}
                   onTimeUpdate={_setVideoTime}
                   className='Renderer'
                   loop={!play}
                   onEnded={onNext}>
                <source src={encodePath(content.path)} type='video/mp4' />
            </video>
        );
    }

    return <img key={content.path + (play ? '1' : '0') + selectedDuration} className='Renderer' src={/*`data:${content.mimeType};base64,${content.file}`*/encodePath(content.path)} />
  }