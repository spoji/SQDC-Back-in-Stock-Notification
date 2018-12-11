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
            document.body.querySelector(".openInStock").textContent = "Voir tous vos produits présentement disponible";
            document.body.querySelector(".openAll").textContent = "Voir tous vos produits en liste d'attente";
            document.body.querySelector(".clearAll").textContent = "Enlever tous vos produits de la liste d'attente";
        } else {
            document.body.querySelector(".openSQDC").textContent = "Open sqdc.ca website";
            document.body.querySelector(".openInStock").textContent = "Open your watched products currently in stock";
            document.body.querySelector(".openAll").textContent = "Open all watched products webpages";
            document.body.querySelector(".clearAll").textContent = "Clear your watched list";
        }
    });
});
