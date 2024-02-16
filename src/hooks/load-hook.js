import {useEffect, useState} from "react";
import {fileApi} from "../api/file-api";

export function useLoad(recursive) {
    const [root, setRoot] = useState(null);
    const [files, setFiles] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [entryPoint, setEntryPoint] = useState(null);

    useEffect(() => {
        if (!loaded) {
            return;
        }

        fileApi.list(recursive)
            .then((files) => {
                setFiles(files);
            });
    }, [recursive]);


    useEffect(() => {
        fileApi.getEntrypoint()
            .then((entryPoint) => {
                if (!entryPoint?.path) {
                    return;
                }

                return load(entryPoint);
            })
            .finally(() => {
                setLoaded(true);
            });
    }, []);

    function load(entryPoint, _recursive = recursive) {
        return Promise.all([
            fileApi.list(_recursive),
            fileApi.getRoot()
        ])
            .then(([files, root]) => {
                setFiles(files);
                setEntryPoint(entryPoint);
                setRoot(root);
            })
    }

    function selectFile() {
        setLoaded(false);

        fileApi.selectEntrypointFile()
            .then((entryPoint) => {
                if (!entryPoint?.path) {
                    return;
                }

                setEntryPoint(entryPoint);

                return load(entryPoint);
            })
            .finally(() => setLoaded(true));
    }


    function selectDirectory() {
        setLoaded(false);

        fileApi.selectEntrypointDirectory()
            .then((entryPoint) => {
                if (!entryPoint?.path) {
                    return;
                }

                setEntryPoint(entryPoint);

                return load()
            })
            .finally(() => setLoaded(true));
    }
    return {root, files, loaded, entryPoint, selectFile, selectDirectory};
}