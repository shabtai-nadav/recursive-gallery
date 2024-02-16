import {useMemo, useState} from "react";
import {basicSort, Sort, sortDate} from "../sort.utils";
import {shuffle} from "lodash";

export function useSort(files, sort, sortDirection) {
    const [shuffleCount, setShuffleCount] = useState(0);

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
                sortedFiles = shuffle(sortedFiles);

                break;
        }

        return sortedFiles;
    }

    return {
        shuffleContent,
        sortedFiles: useMemo(() => sortFiles(files), [files, sort, sortDirection, shuffleCount])
    };
}