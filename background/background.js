var targetPage      = "<all_urls>";
var connectedTabIds = {};

/**
 * Modify request headers
 */
function modifyHeaders(e) {
    if (connectedTabIds[e.tabId]===undefined) {
	console.log("Please push a toolbar button");
    } else {
	let p = connectedTabIds[e.tabId];
	p.postMessage({headers: e.requestHeaders});
    }
    // e.requestHeaders.forEach(function(header){
    // 	console.log(header);
    // });
    return {requestHeaders: e.requestHeaders};
}

browser.webRequest.onBeforeSendHeaders.addListener(
    modifyHeaders,
    {urls: [targetPage]},
    ["blocking", "requestHeaders"]
);

/**
 * Create main paipu window when pushed toolbar button,
 * then connect with new window.
 */
function onCreated(windowInfo) {
    console.log(`Created window: ${windowInfo.id}`);
}
function onError(error) {
    console.error(`Error: ${error}`);
}
browser.browserAction.onClicked.addListener((tab) => {
    if (connectedTabIds[tab.id]===undefined) {
	let paipuURL = browser.extension.getURL(`popup/paipu.html`);
	let creating = browser.windows.create({
	    url: paipuURL,
	    type: "popup",
	    height: 900,
	    width: 800
	});
	creating.then(onCreated, onError);
	browser.runtime.onConnect.addListener((p) => {
	    connectedTabIds[tab.id] = p;
	    console.log("background start greeting");
	    p.postMessage({greeting:"Hi there content script"});
	    p.onMessage.addListener((m) => {
		console.log("From content script:"+m.greeting);
	    });
	    console.log("background end greeting");
	    console.dir(connectedTabIds);
	});
    } else {
	console.log("Already created a paipu window");
    }
});
