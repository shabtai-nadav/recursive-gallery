const {ipcRenderer} = window.require("electron");

function open() {
    return ipcRenderer.invoke('devtools');
}

export const devtoolsApi = {open}