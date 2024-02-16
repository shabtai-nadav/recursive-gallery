import {useState} from "react";

export function useSideBar() {
    const [showSideBar, setShowSideBar] = useState(true);

    function toggleSideBar() {
        setShowSideBar(showSideBar => !showSideBar);
    }

    return {
        showSideBar,
        toggleSideBar
    }
}