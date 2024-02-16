import {useEffect, useMemo, useState} from "react";
import {Sort, SortDirection} from "../sort.utils";

const DEFAULT_DURATION = 8;

export function useOptions() {
    const options = useOptionsByKey('options', {
        selectedDuration: DEFAULT_DURATION,
        sort: Sort.Modified,
        sortDirection: SortDirection.Asc
    });

    const [selectedDuration, setSelectedDuration] = useState(options.selectedDuration);
    const [recursive, setRecursive] = useState(options.recursive);
    const [sort, setSort] = useState(Sort.Modified);
    const [sortDirection, setSortDirection] = useState(SortDirection.Asc);

    useEffect(() => {
        changeOptionsLocalStorage();
    }, [recursive, selectedDuration, sort, sortDirection]);

    function changeOptionsLocalStorage() {
        localStorage.setItem(
            'options',
            JSON.stringify({
                selectedDuration,
                recursive,
                sort,
                sortDirection
            })
        );
    }

    return {
        sort,
        sortDirection,
        recursive,
        selectedDuration,
        setSort,
        setSortDirection,
        setRecursive,
        setSelectedDuration
    }
}

export function useVideoOptions() {
    const videoOptions = useOptionsByKey('videoOptions', {timeByVideo: {}});

    const [timeByVideo, setTimeByVideo] = useState(videoOptions.timeByVideo);

    useEffect(() => {
        changeVideoOptionsLocalStorage();
    }, [timeByVideo]);

    function changeVideoOptionsLocalStorage() {
        localStorage.setItem(
            'videoOptions',
            JSON.stringify({
                timeByVideo
            })
        );
    }

    function setVideoTime(file, time) {
        setTimeByVideo(curr => ({
            ...curr,
            [file.path]: time
        }));
    }

    return {
        timeByVideo,
        setVideoTime
    };
}

export function useContentOptions(content, entryPoint) {
    const contentOptions = useOptionsByKey('contentOptions', {currentByEntryPoint: {}}, [entryPoint]);
    const [currentByEntryPoint, setCurrentByEntryPoint] = useState(contentOptions.currentByEntryPoint);

    useEffect(() => {
        if (!entryPoint?.isDirectory || !content) {
            return;
        }

        setCurrentByEntryPoint({
            ...currentByEntryPoint,
            [entryPoint.path]: content.path
        });
    }, [content]);

    useEffect(() => {
        changeContentOptionsLocalStorage();
    }, [currentByEntryPoint]);

    function changeContentOptionsLocalStorage() {
        localStorage.setItem(
            'contentOptions',
            JSON.stringify({
                currentByEntryPoint
            })
        );
    }

    return {
        current: entryPoint?.isDirectory ? currentByEntryPoint[entryPoint.path] : entryPoint?.path
    };
}

export function useOptionsByKey(key, defaultValue, deps = []) {
    return useMemo(() => {
        const options = localStorage.getItem(key);

        if (!options) {
            return defaultValue;
        }

        return JSON.parse(options);
    }, deps);
}