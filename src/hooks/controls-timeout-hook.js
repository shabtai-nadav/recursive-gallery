import {useEffect, useRef, useState} from "react";
import {isNumber, throttle} from "lodash";

export function useControlsTimeout() {
    const [controlsTimeoutId, setControlsTimeoutId] = useState(null);
    const throttledStartControlsTimeout = useRef(throttle(() => {
        setControlsTimeoutId(setTimeout(
            () => {
                setControlsTimeoutId(null);
            },
            3 * 1000
        ))
    }, 100));


    useEffect(() => {
        function onMouseMove() {
            throttledStartControlsTimeout.current();
        }

        document.addEventListener('mousemove', onMouseMove);

        return () => document.removeEventListener('mousemove', onMouseMove)
    }, []);


    useEffect(() => () => {
        if (!isNumber(controlsTimeoutId)) {
            return;
        }

        clearTimeout(controlsTimeoutId);
    }, [controlsTimeoutId]);

    return controlsTimeoutId;
}