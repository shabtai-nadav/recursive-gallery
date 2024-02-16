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
import {useSideBar} from "./hooks/sidebar-hook";
import {useControlsTimeout} from "./hooks/controls-timeout-hook";
import {useContent} from "./hooks/content-hook";
import {devtoolsApi} from "./api/devtools-api";
import {directoryApi} from "./api/directory-api";

function App() {
    const controlsTimeoutId = useControlsTimeout();
    const {
        recursive,
        selectedDuration,
        sort,
        sortDirection,
        setRecursive,
        setSelectedDuration,
        setSort,
        setSortDirection
    } = useOptions();

    const {
        timeByVideo,
        setVideoTime
    } = useVideoOptions();

    const {toggleSideBar, showSideBar} = useSideBar();

    const {root, files, entryPoint, openDirectory, selectDirectory, selectFile} = useLoad(
        recursive
    );

    const {sortedFiles, shuffleContent} = useSort(files, sort, sortDirection);

    const {content, currentIndex, setCurrentIndex} = useContent(sortedFiles, entryPoint);

    const {
        play,
        setPlay,
        setCurrent,
        onPrevious,
        onNext
    } = useControls(sortedFiles, setCurrentIndex);

    return (
        <SlideshowContextProvider value={{
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
            selectFile,
            openDevTools: devtoolsApi.open,
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
            {showSideBar && <SideBar/>}
            {!showSideBar && <div onClick={toggleSideBar}>open</div>}
        </SlideshowContextProvider>
    );
}

export default App;
