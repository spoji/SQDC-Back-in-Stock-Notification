(function() {
    "use strict";
    let uri;

    function addNotifyButton(isInStock, sku, productPage) {
        browser.runtime.sendMessage(
            { action: "getSkus" }
        ).then((skus) => {
            const isSkuCurrentlyWatched = skus.data.indexOf(sku) > -1;
            const isFrenchSite = uri.indexOf("fr-CA") > -1;
            const notifyBtnHTML = document.createElement("button");

            if (isInStock && !isSkuCurrentlyWatched) {
                return;
            }

            notifyBtnHTML.className = "btn btn-block btn-primary btn-md text-uppercase sqdc-webext-notifier";
            notifyBtnHTML.id = "sqdc-webext-notifier-btn";
            notifyBtnHTML.setAttribute("data-status", isSkuCurrentlyWatched ? "watched" : "unwatched");
            notifyBtnHTML.innerText = isSkuCurrentlyWatched ? (isFrenchSite ? "Vous serez alerté." : "You'll get notified.") : isFrenchSite ? "Prévenez-moi lorsqu'il sera en stock" : "Notify me when back in stock";
            notifyBtnHTML.addEventListener("click", (e) => {
                let status = notifyBtnHTML.getAttribute("data-status") === "unwatched";
                browser.runtime.sendMessage(
                    { action: status ? "watch" : "unwatch", sku: sku, url: productPage }
                ).then((response) => {
                    notifyBtnHTML.innerText = status ? (isFrenchSite ? "Vous serez alerté." : "You'll get notified.") : isFrenchSite ? "Prévenez-moi lorsqu'il sera en stock" : "Notify me when back in stock";
                    notifyBtnHTML.setAttribute("data-status", status ? "watched" : "unwatched");
                });
            });
            removeNotifyButton();
            document.body.querySelector("span[data-templateid='AddToCartProductDetail']").parentNode.appendChild(notifyBtnHTML);
        });
    }

    function removeNotifyButton() {
        if (document.body.querySelector(".sqdc-webext-notifier")) {
            document.body.querySelector(".sqdc-webext-notifier").remove();
        }
    }

    const checkInventory = async () => {
        const sku = uri.substr(uri.lastIndexOf("/") + 1);
        const request = await fetch("https://www.sqdc.ca/api/inventory/findInventoryItems", {
            method: "POST",
            headers: {
                "content-type":     "application/json",
                "x-requested-with": "XMLHttpRequest"
            },
            body: "{\"skus\":[\"" + sku + "\"]}"
        });
        const response = await request.text();
        addNotifyButton(response !== "[]", sku, uri);
    };

    var priceObserver = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
            if (mutation.target.innerText !== "" && uri !== window.location.href) {
                uri = window.location.href;
                removeNotifyButton();
                checkInventory();
            }
        });
    });

    priceObserver.observe(document.body.querySelector("div[property='offers']"), { childList: true });
})();
