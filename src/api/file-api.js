const {ipcRenderer} = window.require("electron");

function list(recursive) {
    return ipcRenderer.invoke('file/list', recursive);
}

function get(path) {
    return ipcRenderer.invoke('file/get', path);
}

function getEntrypoint() {
    return ipcRenderer.invoke('file/entrypoint');
}

function getRoot() {
    return ipcRenderer.invoke('file/root');
}

function selectEntrypoint(path) {
    return ipcRenderer.invoke('file/entrypoint/custom', path);
}

function selectEntrypointFile() {
    return ipcRenderer.invoke('file/entrypoint/file');
}


function selectEntrypointDirectory() {
    return ipcRenderer.invoke('file/entrypoint/directory');
}

export const fileApi = {
    get,
    list,
    getEntrypoint,
    getRoot,
    selectEntrypointFile,
    selectEntrypointDirectory,
    selectEntrypoint
};