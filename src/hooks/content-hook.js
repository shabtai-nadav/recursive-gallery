import {useEffect, useMemo, useState} from "react";
import {findIndex} from "lodash";
import {useContentOptions} from "./options-hook";

const {ipcRenderer} = window.require("electron");

export function useContent(sortedFiles, entryPoint) {
    const [content, setContent] = useState(null);

    const {current} = useContentOptions(content, entryPoint);

    const entryIndex = useMemo(() => {
        if (!entryPoint?.path) {
            return -1;
        }

        const index = findIndex(sortedFiles, file => (current || entryPoint?.path) === file.path);

        return index === -1 ? 0 : index;
    }, [sortedFiles, entryPoint]);

    const [currentIndex, setCurrentIndex] = useState(entryIndex);

    useEffect(() => {
        if (!entryPoint?.path) {
            return;
        }

        setCurrentIndex(entryIndex);
    }, [entryIndex]);

    useEffect(() => {
        getFile(sortedFiles[currentIndex]);
    }, [currentIndex, sortedFiles]);

    function getFile(file) {
        ipcRenderer.invoke('file/get', file?.path)
            .then(extraData => setContent({...file, ...extraData}));

    }

    return {content, currentIndex, setCurrentIndex};
}