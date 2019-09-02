var targetPage = "<all_urls>";

function rewriteUserAgentHeader(e) {
    e.requestHeaders.forEach(function(header){
	console.log(header);
    });
    return {requestHeaders: e.requestHeaders};
}

browser.webRequest.onBeforeSendHeaders.addListener(
    rewriteUserAgentHeader,
    {urls: [targetPage]},
    ["blocking", "requestHeaders"]
);
