import {useState} from "react";
import {findIndex} from "lodash";


export function useControls(sortedFiles, setCurrentIndex) {
    const [play, setPlay] = useState(false);

    function onPrevious() {
        setCurrentIndex(curr => {
            if (!curr) {
                return sortedFiles.length - 1;
            }

            return curr - 1;
        })
    }

    function onNext() {
        setCurrentIndex(curr => {
            if (curr === sortedFiles.length - 1) {
                return 0;
            }

            return curr + 1;
        })
    }

    function setCurrent(file) {
        setCurrentIndex(findIndex(sortedFiles, {path: file.path}));
    }

    return {
        play,
        setPlay,
        onNext,
        onPrevious,
        setCurrent
    };
}