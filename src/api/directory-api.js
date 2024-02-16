const {ipcRenderer} = window.require("electron");

function openInExplorer(path) {
    return ipcRenderer.invoke('directory/open', path);
}

export const directoryApi = {openInExplorer}