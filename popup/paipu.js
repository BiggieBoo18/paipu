var myPort = browser.runtime.connect();
console.log("content script start greeting");
myPort.postMessage({greeting: "Hello from content script"})

myPort.onMessage.addListener((m) => {
    if (m.greeting) {
	console.log("From background:"+m.greeting);
	console.log("content script end greeting");
    } else if(m.headers) {
	console.log("From background:");
	console.dir(m.headers);
    }
});
