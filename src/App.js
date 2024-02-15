import './App.css';
import {useEffect, useMemo, useRef, useState} from 'react';
import {findIndex, isEmpty, isNumber, shuffle, throttle} from 'lodash';
import {Renderer} from './Renderer/Renderer';
import {SlideshowContextProvider} from './SlideshowContext/SlideshowContext';
import {Controls} from './Controls/Controls';
import {basicSort, Sort, sortDate, SortDirection} from './sort.utils';

const {ipcRenderer} = window.require("electron");

const DEFAULT_DURATION = 8;

function App() {
    const [entryPoint, setEntryPoint] = useState(null);
    const [shuffleCount, setShuffleCount] = useState(0);
    const [sort, setSort] = useState(Sort.Modified);
    const [sortDirection, setSortDirection] = useState(SortDirection.Asc);
    const [loaded, setLoaded] = useState(false);
    const [root, setRoot] = useState(null);
    const [controlsTimeoutId, setControlsTimeoutId] = useState();
    const [play, setPlay] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(DEFAULT_DURATION);
    const [files, setFiles] = useState([]);
    const sortedFiles = useMemo(() => sortFiles(files), [files, sort, sortDirection, shuffleCount]);

    const entryIndex = useMemo(() => {
        const index = findIndex(sortedFiles, file => entryPoint === file.path);

        return index === -1 ? 0 : index;
    }, [sortedFiles, entryPoint]);

    const [currentIndex, setCurrentIndex] = useState(entryIndex);
    const [content, setContent] = useState(null);
    const [recursive, setRecursive] = useState(true);
    
    const throttledStartControlsTimeout = useRef(throttle(() => {
        setControlsTimeoutId(setTimeout(
            () => {
                setControlsTimeoutId(null);
            },
            3 * 1000
        ))
    }, 100));

    useEffect(() => {
        setCurrentIndex(entryIndex);
    }, [entryIndex])

    useEffect(() => {
        let options = localStorage.getItem('options');

        if (options) {
            options = JSON.parse(options);

            setSelectedDuration(options.selectedDuration || DEFAULT_DURATION);
            setRecursive(options.recursive);
            setSort(options.sort || Sort.Modified);
            setSortDirection(options.sortDirection || SortDirection.Asc);
        }

        ipcRenderer.invoke('file/entrypoint')
            .then((entryPoint) => {
                if (!entryPoint) {
                    return;
                }

                return load(entryPoint, ('recursive' in (options || {}) ? options.recursive : recursive));
            })
            .finally(() => {
                setLoaded(true);
            });

        function onMouseMove() {
            throttledStartControlsTimeout.current();
        }

        document.addEventListener('mousemove', onMouseMove);

        return () => document.removeEventListener('mousemove', onMouseMove)
    }, []);

    useEffect(() => {
        if (!loaded) {
            return;
        }

        ipcRenderer.invoke('file/list', recursive)
            .then((files) => {
                setFiles(files);
            });
    },[recursive]);

    useEffect(() => {
        if (!loaded) {
            return;
        }
        
        changeLocalStorage();
    }, [recursive, selectedDuration, sort, sortDirection]);

    useEffect(() => {
        getFile(sortedFiles[currentIndex]);
    }, [currentIndex, sortedFiles]);

    useEffect(() => () => {
        if (!isNumber(controlsTimeoutId)) {
            return;
        }

        clearTimeout(controlsTimeoutId);
    }, [controlsTimeoutId]);

    useEffect(() => {
        setFiles(sortedFiles);
    }, [sort, sortDirection]);

    function sortFiles(files) {
        let sortedFiles = [...files];

        switch(sort) {
            case Sort.Created:
                sortedFiles = sortedFiles.sort((a, b) => sortDate(a.created, b.created, sortDirection));

                break;
            case Sort.Modified:
                sortedFiles = sortedFiles.sort((a, b) => sortDate(a.updated, b.updated, sortDirection));

                break;
            case Sort.Size:
                sortedFiles = sortedFiles.sort((a, b) => basicSort(a.size, b.size, sortDirection));

                break;
            case Sort.Directory:
                sortedFiles = sortedFiles.sort((a, b) => basicSort(a.dirPath, b.dirPath, sortDirection));

                break;
            case Sort.Name:
                sortedFiles = sortedFiles.sort((a, b) => basicSort(a.name, b.name, sortDirection));

                break;
            case Sort.Shuffle:
            default:
                sortedFiles = shuffle(sortedFiles);

                break;
        }

        return sortedFiles;
    }

    function load(entryPoint, _recursive = recursive) {
        return Promise.all([
            ipcRenderer.invoke('file/list', _recursive),
            ipcRenderer.invoke('file/root')
        ])
            .then(([files, root]) => {
                setFiles(files);
                setEntryPoint(entryPoint);
                setRoot(root);
            })
    }

    function openDevTools() {
        ipcRenderer.invoke('devtools');
    }

    function shuffleContent() {
        setShuffleCount(shuffleCount + 1);
    }

    function getFile(file) {
        ipcRenderer.invoke('file/get', file?.path)
            .then(extraData => setContent({...file, ...extraData}));
    }

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

    function changeLocalStorage() {
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

    function selectFile() {
        setLoaded(false);

        ipcRenderer.invoke('file/entrypoint/file')
            .then((entryPoint) => {
                if (!entryPoint) {
                    return;
                }

                setEntryPoint(entryPoint);

                return load()
            })
            .finally(() => setLoaded(true));
    }

    function selectDirectory() {
        setLoaded(false);

        ipcRenderer.invoke('file/entrypoint/directory')
            .then((entryPoint) => {
                if (!entryPoint) {
                    return;
                }

                setEntryPoint(entryPoint);

                return load()
            })
            .finally(() => setLoaded(true));
    }
    
    function openDirectory() {
        ipcRenderer.invoke('directory/open', sortedFiles[currentIndex]?.dirPath);
    }

    return (
        <SlideshowContextProvider value={{
            root,
            files: sortedFiles,
            content,
            play,
            selectedDuration,
            currentIndex,
            recursive,
            showControls: isNumber(controlsTimeoutId),
            sort,
            sortDirection,
            openDirectory,
            setSort,
            setSortDirection,
            selectDirectory,
            selectFile,
            openDevTools,
            setRecursive,
            shuffleContent,
            onNext,
            onPrevious,
            setPlay,
            setSelectedDuration
        }}>
            <div className="Slideshow">
                {!isEmpty(sortedFiles) && <Renderer/>}
                <Controls/>
            </div>
        </SlideshowContextProvider>
    );
}

export default App;
