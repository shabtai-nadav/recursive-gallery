import {useEffect, useMemo, useState} from "react";
import {Sort, SortDirection} from "../sort.utils";
import {findIndex, isEmpty, keys, map} from "lodash";
import {useSideBar} from "./sidebar-hook";

const DEFAULT_DURATION = 8;

export function useOptions() {
    const options = useOptionsByKey('options', {
        showSideBar: true,
        selectedDuration: DEFAULT_DURATION,
        sort: Sort.Modified,
        sortDirection: SortDirection.Asc
    });

    const {toggleSideBar, showSideBar} = useSideBar(options.showSideBar);

    const [selectedDuration, setSelectedDuration] = useState(options.selectedDuration);
    const [recursive, setRecursive] = useState(options.recursive);

    useEffect(() => {
        changeOptionsLocalStorage();
    }, [recursive, selectedDuration, showSideBar]);

    function changeOptionsLocalStorage() {
        localStorage.setItem(
            'options',
            JSON.stringify({
                selectedDuration,
                recursive,
                showSideBar
            })
        );
    }

    return {
        recursive,
        selectedDuration,
        setRecursive,
        setSelectedDuration,
        showSideBar,
        toggleSideBar,
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

export function useSortOptions(entryPoint, files, sortedFiles) {
    const sortOptions = useOptionsByKey('sortOptions', {
        configByEntryPoint: {}
    });

    const [configByEntryPoint, setConfigByEntryPoint] = useState(sortOptions.configByEntryPoint);

    const currentConfig = configByEntryPoint[entryPoint?.path] || {
        sort: Sort.Modified,
        sortDirection: SortDirection.Asc
    };

    useEffect(() => {
        changeSortOptionsLocalStorage();
    }, [configByEntryPoint]);

    useEffect(() => {
        if (currentConfig.sort !== Sort.Shuffle || isEmpty(files) || isEmpty(sortedFiles)) {
            return;
        }

        setConfigByEntryPoint(config => ({
            ...config,
            [entryPoint?.path]: {
                ...currentConfig,
                shuffleOrder: map(sortedFiles, file => findIndex(files, {path: file.path}))
            }
        }));
    }, [sortedFiles]);

    function changeSortOptionsLocalStorage() {
        localStorage.setItem(
            'sortOptions',
            JSON.stringify({
                configByEntryPoint
            })
        );
    }

    function setSort(sort) {
        setConfigByEntryPoint(config => ({
            ...config,
            [entryPoint?.path]: {
                ...currentConfig,
                sort
            }
        }))
    }

    function setSortDirection(sortDirection) {
        setConfigByEntryPoint(config => ({
            ...config,
            [entryPoint?.path]: {
                ...currentConfig,
                sortDirection
            }
        }))
    }

    return {
        sort: currentConfig.sort,
        sortDirection: currentConfig.sortDirection,
        shuffleOrder: currentConfig.shuffleOrder,
        setSort,
        setSortDirection
    };
}

export function useContentOptions(sortedFiles, content, entryPoint) {
    const contentOptions = useOptionsByKey('contentOptions', {currentByEntryPoint: {}}, [entryPoint]);
    const [currentByEntryPoint, setCurrentByEntryPoint] = useState(contentOptions.currentByEntryPoint);

    useEffect(() => {
        if (!entryPoint?.isDirectory || !content) {
            return;
        }

        setCurrentByEntryPoint({
            ...currentByEntryPoint,
            [entryPoint?.path]: content.path
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
        current: entryPoint?.isDirectory ? currentByEntryPoint[entryPoint?.path] || entryPoint.path : entryPoint?.path,
        previousEntryPoints: keys(currentByEntryPoint)
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