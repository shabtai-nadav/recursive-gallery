import './SideBar.css';
import {useContext, useMemo} from "react";
import {slideshowContext} from "../SlideshowContext/SlideshowContext";
import {chain, join, map, slice, split} from "lodash";
import {SideBarFolder} from "./SideBarFolder/SideBarFolder";
import clsx from "clsx";

export function SideBar() {
    const {showSideBar, showControls, content, files, toggleSideBar, entryPoint, selectEntryPoint, previousEntryPoints} = useContext(slideshowContext);

    const fractions = useMemo(
        () => split(content?.dirPath, '/'),
        [content]
    );

    const folder = useMemo(
        () => join(slice(fractions, 0, fractions.length - 2), '/'),
        [fractions]
    );

    const folderFiles = useMemo(
        () => chain(files)
            .filter(file => file.dirPath.startsWith(folder))
            .groupBy(file => chain(file.dirPath)
                .split('/')
                .slice(fractions.length - 1)
                .join('/')
                .value()
            )
            .value(),
        [files, folder, fractions]
    );

    if (!showSideBar) {
        return <div onClick={toggleSideBar} className={clsx('SideBarOpenButton', { 'show': showControls })}>{'<'}</div>;
    }

    return (
        <div className='SideBar'>
            <div className='SideBarCloseButton' onClick={toggleSideBar}>{'>'}</div>
            { entryPoint?.path && (
                map(folderFiles, (files, folder) => (
                    <SideBarFolder key={folder} folder={folder} files={files} />
                ))
            )}
            { !entryPoint?.path && (
                map(previousEntryPoints, (entryPoint) => (
                    <div key={entryPoint} onClick={selectEntryPoint.bind(null, entryPoint)}>{entryPoint}</div>
                ))
            )}
        </div>
    )
}