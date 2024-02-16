import {useState} from "react";

export function useSideBar(defaultState) {
    const [showSideBar, setShowSideBar] = useState(defaultState);

    function toggleSideBar() {
        setShowSideBar(showSideBar => !showSideBar);
    }

    return {
        showSideBar,
        toggleSideBar
    }
}