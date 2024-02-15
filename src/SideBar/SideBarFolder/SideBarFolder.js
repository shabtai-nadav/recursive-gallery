import './SideBarFolder.css';
import {find, map} from "lodash";
import {useContext, useState} from "react";
import {slideshowContext} from "../../SlideshowContext/SlideshowContext";
import clsx from "clsx";

export function SideBarFolder({files, folder}) {
    const {content, setCurrent} = useContext(slideshowContext);
    const [open, setOpen] = useState(find(files, {path: content.path}));

    function toggle() {
        setOpen(open => !open);
    }

    function _setCurrent(file, e) {
        e.stopPropagation();
        setCurrent(file);
    }

    return (
        <div className='SideBarFolder'>
            <div className='SideBarFolderHeader' title={folder} onClick={toggle}>{folder}</div>
            {open && (
                <div className='SideBarFolderContent'>
                    {map(files, file => (
                        <div key={file.path}
                             onClick={_setCurrent.bind(null, file)}
                             className={
                                 clsx(
                                     'SideBarFolderContentFile',
                                     {Current: file.path === content.path}
                                 )
                             }
                        >
                            {file.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}