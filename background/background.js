var targetPage = '<all_urls>';
var tableIds      = []; 

/**
 * Create table
 */
function createInputText(value, rowIdx) {
    inputText       = document.createElement('input');
    inputText.id    = rowIdx;
    inputText.type  = 'text';
    inputText.name  = 'name';
    inputText.value = value;
    return inputText;
}
function createCheckbox(rowIdx) {
    checkbox      = document.createElement('input');
    checkbox.id   = rowIdx;
    checkbox.type = 'checkbox';
    return checkbox;
}
function createUrlText(url, idx) {
    text             = document.createElement('p');
    text.id          = `url-${idx}`;
    text.textContent = url;
    return text;
}
function createHeaderTable(headers, headerTable, idx) {
    let rows  = [];
    let table = document.createElement('table');
    table.id = `table-${idx}`;
    // create table header
    rows.push(table.insertRow(-1))
    cell = rows[0].insertCell(-1);
    cell.appendChild(document.createTextNode("Name"));
    cell = rows[0].insertCell(-1);
    cell.appendChild(document.createTextNode("Value"));
    cell = rows[0].insertCell(-1);
    cell.appendChild(document.createTextNode("Not Send"));
    // create table cells
    for (let i=1;i<headers.length+1;i++) {
    	rows.push(table.insertRow(-1));
    	let name  = rows[i].insertCell(-1);
    	name.appendChild(createInputText(headers[i-1]['name'], `name${i-1}`));
	let val  = rows[i].insertCell(-1);
	if (headers[i-1]['value']) {
	    val.appendChild(createInputText(headers[i-1]['value'], `value${i-1}`));
	} else {
	    val.appendChild(createInputText(headers[i-1]['binaryValue'], `value${i-1}`));
	}
	let checkbox  = rows[i].insertCell(-1);
	checkbox.appendChild(createCheckbox(`checkbox${i-1}`));
    }
    headerTable.appendChild(table);
    // create send button
    let button = document.createElement('button');
    button.textContent = 'send';
    button.id          = `button-${idx}`;
    headerTable.appendChild(button);
}
function getTable(idx) {
    let returnTable = [];
    let table       = document.getElementById(`table-${idx}`);
    for (let i=1;i<table.rows.length;i++) {
	let tmp = {};
	tmp['name']  = table.rows[i].cells[0].children[0].value;
	tmp['value'] = table.rows[i].cells[1].children[0].value;
	if (tmp['name']&&!table.rows[i].cells[2].children[0].checked) {
	    returnTable.push(tmp);
	}
	
    }
    return returnTable;
}
function deleteTable(idx) {
    let urlText = document.getElementById(`url-${idx}`);
    urlText.parentNode.removeChild(urlText);
    let table   = document.getElementById(`table-${idx}`);
    while (table.firstChild) table.removeChild(table.firstChild);
    table.parentNode.removeChild(table);
    let button  = document.getElementById(`button-${idx}`);
    while (button.firstChild) button.removeChild(button.firstChild);
    button.parentNode.removeChild(button);
    tableIds = tableIds.filter((item) => {
	return item!=idx;
    });
}

/**
 * Modify request headers
 */
function modifyHeaders(e) {
    console.log('original requestHeaders:');
    console.dir(e.requestHeaders);
    let edited_headers = e.requestHeaders;
    let headerTable    = document.getElementById('header-table');
    if (headerTable) {
	if (tableIds.length) {
	    tableIds.push(tableIds[tableIds.length-1]+1);
	} else {
	    tableIds.push(0);
	}
	currentIdx = tableIds[tableIds.length-1];
	// create url text
	urlText = createUrlText(e.url, currentIdx);
	headerTable.appendChild(urlText);
	// create header table
	createHeaderTable(e.requestHeaders, headerTable, currentIdx);
	let button = document.getElementById(`button-${currentIdx}`);
	let asyncModifyHeader = new Promise((resolve, reject) => {
	    button.onclick = () => {
		currentIdx = button.id.slice('button-'.length);
		edited_headers = getTable(currentIdx);
		console.log('edited headers:');
		console.dir(edited_headers);
		deleteTable(currentIdx);
		resolve({requestHeaders: edited_headers});
	    };
	});
	return asyncModifyHeader;
    }
    return {requestHeaders: e.requestHeaders};
}
let listenButton = document.getElementById('listen-button');
if (listenButton) {
    listenButton.addEventListener('change', () => {
	if (listenButton.checked) {
	    browser.webRequest.onBeforeSendHeaders.addListener(
		modifyHeaders,
		{urls: [targetPage]},
		['blocking', 'requestHeaders']
	    );
	} else {
	    browser.webRequest.onBeforeSendHeaders.removeListener(modifyHeaders);
	}
    });
}

/**
 * Create main paipu window when pushed toolbar button,
 * then connect with new window.
 */
function onCreated(windowInfo) {
    console.log(`Created window: ${windowInfo.id}`);
    browser.windows.update(windowInfo.id, {height:900, width:801}); // for redraw
    browser.windows.onRemoved.addListener((windowId) => {
	console.log('Closed window: ' + windowId);
	if (windowId===windowInfo.id) {
	    window.hasRun = false;
	}
    });
}
function onError(error) {
    console.error(`Error: ${error}`);
}
browser.browserAction.onClicked.addListener(() => {
    if (!window.hasRun&&location.pathname.indexOf('paipu.html')===-1) {
	let paipuURL = browser.extension.getURL('paipu.html');
	let creating = browser.windows.create({
	    url: paipuURL,
	    type: 'detached_panel',
	    height:900,
	    width:800
	});
	creating.then(onCreated, onError);
	window.hasRun = true;
    } else {
	console.log('Already created a paipu window');
    }
});

// /**
//  * Open option page
//  */
// function onOpened() {
//   console.log(`Options page opened`);
// }

// function onError(error) {
//   console.log(`Error: ${error}`);
// }
// optionButton = document.getElementById('option-button');
// if (optionButton) {
//     optionButton.addEventListener('click', () => {
// 	browser.runtime.openOptionsPage().then(onOpened, onError);
//     });
// }

// /**
//  * Set target page
//  */
// function getTargetUrl() {
//     let storageItem = browser.storage.sync.get('targetUrl');
//     return storageItem;
// }
// storageItem.then((res) => {
//     targetPage = res.targetUrl || '<all_urls>';
// });

/**
 * All send
 */
function allSend() {
    let cnt = 0;
    let len = tableIds.length;
    for (let i=0;i<len;i++) {
	sendButton = document.getElementById(`button-${tableIds[i-cnt]}`);
	if (sendButton) {
	    sendButton.click();
	    cnt++;
	}
    }
}
allSendButton = document.getElementById('all-send');
if (allSendButton) {
    allSendButton.addEventListener('click', allSend);
}
