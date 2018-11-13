(function() {
    "use strict";

    const uri = window.location.href;
    const sku = uri.substr(uri.lastIndexOf("/") + 1);
    const isFrenchSite = uri.indexOf("fr-CA") > -1;

    function addNotifyButton() {
        browser.runtime.sendMessage(
            { action: "getSkus" }
        ).then(skus => {
            const isSkuCurrentlyWatched = skus.data.indexOf(sku) > -1;
            const notifyBtnHTML = document.createElement("button");
            notifyBtnHTML.className = "btn btn-block btn-primary btn-md text-uppercase";
            notifyBtnHTML.id = "sqdc-webext-notifier-btn";
            notifyBtnHTML.setAttribute("data-status", isSkuCurrentlyWatched ? "watched" : "unwatched");
            notifyBtnHTML.innerText = isSkuCurrentlyWatched ? (isFrenchSite ? "Vous serez alerté." : "You'll get notified.") : isFrenchSite ? "Prévenez-moi lorsqu'il sera en stock" : "Notify me when back in stock";
            notifyBtnHTML.addEventListener("click", e => {
                let status = notifyBtnHTML.getAttribute("data-status") === "unwatched";
                browser.runtime.sendMessage(
                    { action: status ? "watch" : "unwatch", sku: sku, url: uri }
                ).then(response => {
                    notifyBtnHTML.innerText = status ? (isFrenchSite ? "Vous serez alerté." : "You'll get notified.") : isFrenchSite ? "Prévenez-moi lorsqu'il sera en stock" : "Notify me when back in stock";
                    notifyBtnHTML.setAttribute("data-status", status ? "watched" : "unwatched");
                });
            });
            document.body.querySelector("span[data-templateid='AddToCartProductDetail']").parentNode.appendChild(notifyBtnHTML);
        });
    }

    const checkInventory = async () => {
        const request = await fetch("https://www.sqdc.ca/api/inventory/findInventoryItems", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-requested-with": "XMLHttpRequest"
            },
            body: "{\"skus\":[\"" + sku + "\"]}"
        });
        const response = await request.text();
        if (response === "[]") {
            addNotifyButton();
        }
    };

    checkInventory();
})();
