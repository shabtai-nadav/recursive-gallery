import './SideBar.css';
import {useContext, useMemo} from "react";
import {slideshowContext} from "../SlideshowContext/SlideshowContext";
import {chain, join, map, slice, split} from "lodash";
import {SideBarFolder} from "./SideBarFolder/SideBarFolder";

export function SideBar() {
    const {content, files, toggleSideBar} = useContext(slideshowContext);

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

    return (
        <div className='SideBar'>
            <div onClick={toggleSideBar}>Close</div>
            {
                map(folderFiles, (files, folder) => (
                    <SideBarFolder key={folder} folder={folder} files={files} />
                ))
            }
        </div>
    )
}