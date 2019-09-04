var targetPage      = '<all_urls>';
var connectedTabIds = {};

function awaitOnMessage(p) {
    return new Promise((resolve, reject) => {
	p.onMessage.addListener(resolve);
    });
}

async function asyncOnMessage(p) {
    const m = await awaitOnMessage(p);
    return m;
}

/**
 * Modify request headers
 */
async function modifyHeaders(e) {
    let edited_headers = undefined;
    if (connectedTabIds[e.tabId]!==undefined) {
	console.log(`start connection ${e.tabId}`);
	let p = connectedTabIds[e.tabId];
	p.postMessage({headers: e.requestHeaders});
	edited_headers = await awaitOnMessage(p);
	// let promise = asyncOnMessage(p);
	// promise.then((m) => {
	//     console.log("Recieve from edited headers");
	//     console.dir(m.edited_headers);
	//     console.log(`end connection ${e.tabId}`);
	//     edited_headers = m.edited_headers
	// });
    }
    if (edited_headers===undefined) {
	console.log("not wait");
	console.dir(edited_headers);
    }
    return {requestHeaders: e.requestHeaders};
}

browser.webRequest.onBeforeSendHeaders.addListener(
    modifyHeaders,
    {urls: [targetPage]},
    ['blocking', 'requestHeaders']
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
	    type: 'popup',
	    height: 900,
	    width: 800
	});
	creating.then(onCreated, onError);
	browser.runtime.onConnect.addListener((p) => {
	    connectedTabIds[tab.id] = p;
	    console.log('background start greeting');
	    p.postMessage({greeting:'Hi there content script'});
	    p.onMessage.addListener((m) => {
		console.log('From content script:'+m.greeting);
	    });
	    console.log('background end greeting');
	    console.dir(connectedTabIds);
	});
    } else {
	console.log('Already created a paipu window');
    }
});
