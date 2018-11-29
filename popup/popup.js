window.addEventListener("load", (event) => {
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("openSQDC")) {
            browser.tabs.create({ url: "https://www.sqdc.ca" });
        } else if (e.target.classList.contains("openInStock")) {
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

    browser.runtime.sendMessage(
        { action: "getUrls" }
    ).then((response) => {
        const urls = response.data;
        if (urls[0] && urls[0].indexOf("fr-CA") > -1) {
            document.body.querySelector(".openSQDC").textContent = "Ouvrir le site web sqdc.ca";
            document.body.querySelector(".openInStock").textContent = "Ouvrir vos produits en stock";
            document.body.querySelector(".openAll").textContent = "Ouvrir ves produits en alertes";
            document.body.querySelector(".clearAll").textContent = "Effacer vos liste de produits en alertes";
        } else {
            document.body.querySelector(".openSQDC").textContent = "Open sqdc.ca website";
            document.body.querySelector(".openInStock").textContent = "Open your watched products in stock";
            document.body.querySelector(".openAll").textContent = "Open your watched products webpages";
            document.body.querySelector(".clearAll").textContent = "Clear your watched list";
        }
    });
});
