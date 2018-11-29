document.addEventListener("click", (e) => {
    if (e.target.classList.contains("openInStock")) {
        browser.runtime.sendMessage(
            { action: "openInStock" }
        ).then((response) => {});
    } else if (e.target.classList.contains("openAll")) {
        browser.runtime.sendMessage(
            { action: "openAll" }
        ).then((response) => {});
    } else if (e.target.classList.contains("clearAll")) {
        browser.runtime.sendMessage(
            { action: "clearAll" }
        ).then((response) => {});
    }
});
