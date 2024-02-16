const {ipcRenderer} = window.require("electron");

function list(recursive) {
    return ipcRenderer.invoke('file/list', recursive);
}

function getEntrypoint() {
    return ipcRenderer.invoke('file/entrypoint');
}

function getRoot() {
    return ipcRenderer.invoke('file/root');
}

function selectEntrypointFile() {
    return ipcRenderer.invoke('file/entrypoint/file');
}


function selectEntrypointDirectory() {
    return ipcRenderer.invoke('file/entrypoint/directory');
}

export const fileApi = {
    list,
    getEntrypoint,
    getRoot,
    selectEntrypointFile,
    selectEntrypointDirectory
};