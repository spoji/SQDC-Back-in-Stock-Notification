var skusInStock = [];
var sqdcWatched = [];

const checkInventory = async (sqdc, showPopup) => {
    /*
    if (!sqdc) {
        sqdc = {};
        sqdc.skus = ["697238111150", "688083001031", "697238111112"];
        sqdc.urls = ["https://www.sqdc.ca/fr-CA/p-nebuleuse/697238111150-P/697238111150", "https://www.sqdc.ca/fr-CA/p-argyle/688083001055-P/688083001031", "https://www.sqdc.ca/fr-CA/p-bayou/697238111112-P/697238111112"];
        browser.storage.sync.set({ sqdc: sqdc });
    }
    */

    if (!sqdc || sqdc === undefined) {
        return;
    }

    sqdcWatched = sqdc;

    const request = await fetch("https://www.sqdc.ca/api/inventory/findInventoryItems", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "x-requested-with": "XMLHttpRequest"
        },
        body: "{\"skus\":" + JSON.stringify(sqdc.skus) + "}"
    });

    const response = await request.text();
    try {
        skusInStock = JSON.parse(response);
    } catch (e) {
        browser.browserAction.setBadgeText({ text: "?" });
    }
};

function updateNotification(showPopup) {
    let title, message;
    const plurial = skusInStock.length > 1 ? "s" : "";

    if (skusInStock.length > 0) {
        browser.browserAction.setBadgeText({ text: skusInStock.length.toString() });
        browser.browserAction.setBadgeBackgroundColor({ color: "red" });

        if (!showPopup) {
            return;
        }

        if (sqdcWatched.urls[0].indexOf("fr-CA") > -1) {
            title = skusInStock.length + " item" + plurial + " en stock!";
            message = "Cliquer le button de l'extension pour ouvrir le" + plurial + " page" + plurial + " correspondante" + plurial + ".";
        } else {
            title = skusInStock.length + " item" + plurial + " in stock!";
            message = "Click the extension's button to open the product" + plurial + " page" + plurial + ".";
        }

        browser.notifications.clear("sqdc-notify");
        browser.notifications.create("sqdc-notify", {
            type: "basic",
            iconUrl: browser.extension.getURL("icons/icon128.png"),
            title: title,
            message: message
        });
    } else {
        browser.notifications.clear("sqdc-notify");
        browser.browserAction.setBadgeText({ text: "" });
    }
}

function handleMessage(message, sender, response) {
    return new Promise(resolve => {
        browser.storage.sync.get("sqdc").then(({ sqdc }) => {
            if (sqdc === undefined) {
                sqdc = {};
                sqdc.skus = [];
                sqdc.urls = [];
            }

            if (message.action === "getSkus") {
                resolve({ data: sqdc.skus });
                return true;
            }

            if (message.action === "watch") {
                if (sqdc.skus.indexOf(message.sku) === -1) {
                    sqdc.skus.push(message.sku);
                    sqdc.urls.push(message.url);
                }
            } else if (message.action === "unwatch") {
                const index = sqdc.skus.indexOf(message.sku);
                if (index > -1) {
                    sqdc.skus.splice(index, 1);
                    sqdc.urls.splice(index, 1);

                    checkInventory(sqdc).then(() => updateNotification(skusInStock, false));
                }
            }

            browser.storage.sync.set({ sqdc: sqdc }).then(() => {
                resolve({ data: sqdc.skus });
            });

            return true;
        });
    });
}

browser.browserAction.onClicked.addListener(() => {
    if (skusInStock.length === 0) {
        browser.tabs.create({ url: "https://www.sqdc.ca" });
    } else {
        skusInStock.forEach(sku => {
            browser.tabs.create({ url: sqdcWatched.urls[sqdcWatched.skus.indexOf(sku)] });
        });
    }
});

browser.alarms.create("sqdc-checkup", { periodInMinutes: 60 });
browser.alarms.onAlarm.addListener((alarm) => {
    browser.storage.sync.get("sqdc").then(({ sqdc }) => checkInventory(sqdc).then(() => updateNotification(true)));
});

browser.runtime.onMessage.addListener(handleMessage);
browser.storage.sync.get("sqdc").then(({ sqdc }) => checkInventory(sqdc).then(() => updateNotification(true)));
