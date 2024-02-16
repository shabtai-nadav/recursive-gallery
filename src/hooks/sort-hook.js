import {useEffect, useMemo, useState} from "react";
import {basicSort, Sort, sortDate} from "../sort.utils";
import {isEmpty, map, shuffle} from "lodash";
import {useSortOptions} from "./options-hook";

export function useSort(files, entryPoint) {
    const [sortedFiles, setSortedFiles] = useState(files);
    const [shuffleCount, setShuffleCount] = useState(0);

    const {sort, sortDirection, shuffleOrder, setSortDirection, setSort} = useSortOptions(entryPoint, files, sortedFiles);

    useEffect(() => {
        setSortedFiles(sortFiles(files));
    }, [files, sort, sortDirection, shuffleCount]);

    function shuffleContent() {
        setShuffleCount(shuffleCount + 1);
    }

    function sortFiles(files) {
        let sortedFiles = [...files];

        switch (sort) {
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
                sortedFiles = sortedFiles.sort((a, b) => a.name.localeCompare(b.name, navigator.languages[0] || navigator.language, {
                    numeric: true,
                    ignorePunctuation: true
                }));

                break;
            case Sort.Shuffle:
            default:
                if (!shuffleCount && !isEmpty(shuffleOrder) && !isEmpty(files)) {
                    sortedFiles = map(shuffleOrder, file => files[file]);
                } else {
                    sortedFiles = shuffle(sortedFiles);
                }

                break;
        }

        return sortedFiles;
    }

    return {
        sort,
        sortDirection,
        shuffleContent,
        sortedFiles,
        setSort,
        setSortDirection
    };
}