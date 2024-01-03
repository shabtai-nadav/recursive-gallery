import './Controls.css';
import { useContext, useEffect, useState } from "react";
import { slideshowContext } from "../SlideshowContext/SlideshowContext";
import clsx from 'clsx';
import { isEmpty } from 'lodash';
import {Sort, SortDirection} from '../sort.utils';

export function Controls() {
    const { 
        content,
        root,
        play,
        currentIndex,
        files,
        showControls,
        recursive,
        selectedDuration,
        sort,
        sortDirection,
        openDirectory,
        setSortDirection,
        selectDirectory,
        setSort,
        selectFile,
        openDevTools,
        shuffleContent,
        setSelectedDuration,
        setPlay,
        onNext,
        onPrevious,
        setRecursive
    } = useContext(slideshowContext);
    const [fs, setFs] = useState(false);
    const [_selectedDuration, _setSelectedDuration] = useState(selectedDuration);

    const empty = isEmpty(files);

    useEffect(() => {
        _setSelectedDuration(selectedDuration);
    }, [selectedDuration])
    
    useEffect(() => {
        function onKeyUp(e) {
            switch (e.code) {
                case 'F5':
                    e.preventDefault();
                    toggleFullScreen();
                    
                    break;
                case 'F12':
                    e.preventDefault();
                    openDevTools();

                    break;
                case 'Space':
                    togglePlay();

                    break;
                case 'ArrowRight':
                    onNextClick();

                    break;
                case 'ArrowLeft':
                    onPreviousClick();

                    break;

                case 'Escape':
                    exitFs();
            }
        }

        window.addEventListener('keyup', onKeyUp);

        return () => window.removeEventListener('keyup', onKeyUp);
    }, [play, onNext, onPrevious, fs]);

    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            enterFs();
        } else if (document.exitFullscreen) {
            exitFs();
        }
    }

    function enterFs() {
        setPlay(true);
        setFs(true);
        document.documentElement.requestFullscreen();
    }

    function exitFs() {
        setPlay(false);
        setFs(false);
        document.exitFullscreen();
    }

    function togglePlay() {
        setPlay(!play);
    }

    function toggleSortDirection() {
        setSortDirection(sortDirection === SortDirection.Asc ? SortDirection.Desc : SortDirection.Asc);
    }

    function onDurationChange(value) {
        _setSelectedDuration(value);

        if (+value) {
            setSelectedDuration(value);
        }
    }

    function onNextClick() {
        setPlay(false);
        onNext();
    }

    function onPreviousClick() {
        setPlay(false);
        onPrevious();
    }

    return (
        <div className={clsx('Controls', { 'show': showControls })}>
            {!empty && (
                <div className='Basic'>
                    <div onClick={onPreviousClick}>{'<<'}</div>
                    <div onClick={togglePlay}>{play ? 'Pause' : 'Play'}</div>
                    <div onClick={onNextClick}>{'>>'}</div>
                </div>
            )}
            <div className='Extra'>
                <div className='SortContainer'>
                    <select placeholder="Sort by" onChange={e => setSort(e.target.value)} value={sort}>
                        <option value={Sort.Modified}>Modified</option>
                        <option value={Sort.Created}>Created</option>
                        <option value={Sort.Size}>Size</option>
                        <option value={Sort.Name}>Name</option>
                        <option value={Sort.Directory}>Directory</option>
                        <option value={Sort.Shuffle}>Shuffle</option>
                    </select>
                    <div className='SortDirection' onClick={toggleSortDirection}>{sortDirection === SortDirection.Asc ? 'Asc' : 'Desc'}</div>
                </div>
                <div className='Recursive'>
                    <input id='recursive-checkbox' type='checkbox' checked={recursive} onChange={() => setRecursive(!recursive)} />
                    <label htmlFor="recursive-checkbox">Recursive</label>
                </div>
                <input className="DurationInput" placeholder='Duration' type='number' min={1} step={1} value={_selectedDuration} onChange={e => onDurationChange(e.target.value)} />
                <div className='Buttons'>
                    {!empty && sort === 'shuffle' && <button onClick={shuffleContent}>Re-shuffle</button>}
                    <button onClick={selectDirectory}>Select directory</button>
                    <button onClick={selectFile}>Select file</button>
                </div>
            </div>
            {!empty && (
                <div className='Info'>
                    <div className='PathContainer' onClick={openDirectory}>
                        <span>{root}</span>
                        <span className='FileDirPath'>{content?.dirPath?.substring(root?.length)}</span>
                        <span className='FilePath'>{content?.path?.substring(content?.dirPath?.length)}</span>
                    </div>
                    <div>{currentIndex + 1}/{files.length}</div>
                </div>
            )}
        </div>
    )
}