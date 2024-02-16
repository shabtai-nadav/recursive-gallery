import './App.css';
import {isEmpty, isNumber} from 'lodash';
import {Renderer} from './Renderer/Renderer';
import {SlideshowContextProvider} from './SlideshowContext/SlideshowContext';
import {Controls} from './Controls/Controls';
import {SideBar} from "./SideBar/SideBar";
import {useOptions, useVideoOptions} from "./hooks/options-hook";
import {useControls} from "./hooks/controls-hook";
import {useSort} from "./hooks/sort-hook";
import {useLoad} from "./hooks/load-hook";
import {useControlsTimeout} from "./hooks/controls-timeout-hook";
import {useContent} from "./hooks/content-hook";
import {devtoolsApi} from "./api/devtools-api";
import {directoryApi} from "./api/directory-api";

function App() {
    const controlsTimeoutId = useControlsTimeout();
    const {
        recursive,
        selectedDuration,
        setRecursive,
        setSelectedDuration,
        showSideBar,
        toggleSideBar,
    } = useOptions();

    const {
        timeByVideo,
        setVideoTime
    } = useVideoOptions();

    const {root, files, entryPoint, selectEntryPoint, selectDirectory, selectFile} = useLoad(
        recursive
    );

    const {sortedFiles, shuffleContent, sort, sortDirection, setSort, setSortDirection} = useSort(files);

    const {content, currentIndex, setCurrentIndex, previousEntryPoints} = useContent(sortedFiles, entryPoint);

    const {
        play,
        setPlay,
        setCurrent,
        onPrevious,
        onNext
    } = useControls(sortedFiles, setCurrentIndex);

    return (
        <SlideshowContextProvider value={{
            showSideBar,
            entryPoint,
            root,
            timeByVideo,
            setVideoTime,
            setCurrent,
            toggleSideBar,
            files: sortedFiles,
            content,
            play,
            selectedDuration,
            currentIndex,
            recursive,
            showControls: isNumber(controlsTimeoutId),
            sort,
            sortDirection,
            openDirectory: directoryApi.openInExplorer.bind(null, sortedFiles[currentIndex]?.dirPath),
            setSort,
            setSortDirection,
            selectDirectory,
            selectEntryPoint,
            selectFile,
            openDevTools: devtoolsApi.open,
            setRecursive,
            shuffleContent,
            onNext,
            onPrevious,
            setPlay,
            setSelectedDuration,
            previousEntryPoints
        }}>
            <div className="Slideshow">
                {!isEmpty(sortedFiles) && <Renderer/>}
                <Controls/>
            </div>
            <SideBar/>
        </SlideshowContextProvider>
    );
}

export default App;
