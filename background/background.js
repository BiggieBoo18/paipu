var targetPage   = '<all_urls>';
var tableIds     = []; 

/**
 * Create table
 */
function createInputText(value) {
    inputText       = document.createElement('input');
    inputText.type  = 'text';
    inputText.name  = 'name';
    inputText.value = value;
    return inputText;
}
function createHeaderTable(headers, headerTable, idx) {
    let rows  = [];
    let table = document.createElement('table');
    table.id = `table-${idx}`;
    // create table header
    rows.push(table.insertRow(-1))
    let cell = rows[0].insertCell(-1);
    cell.appendChild(document.createTextNode("Name"));
    cell = rows[0].insertCell(-1);
    cell.appendChild(document.createTextNode("Value"));
    // create table cells
    for (let i=1;i<headers.length+1;i++) {
    	rows.push(table.insertRow(-1));
    	let name  = rows[i].insertCell(-1);
    	name.appendChild(createInputText(headers[i-1]['name']));
	let val  = rows[i].insertCell(-1);
	if (headers[i-1]['value']) {
	    val.appendChild(createInputText(headers[i-1]['value']));
	} else {
	    val.appendChild(createInputText(headers[i-1]['binaryValue']));
	}
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
	if (tmp['name']) {
	    returnTable.push(tmp);
	}
    }
    return returnTable;
}
function deleteTable(idx) {
    console.dir(document);
    let table  = document.getElementById(`table-${idx}`);
    while (table.firstChild) table.removeChild(table.firstChild);
    table.parentNode.removeChild(table);
    let button = document.getElementById(`button-${idx}`);
    while (button.firstChild) button.removeChild(button.firstChild);
    button.parentNode.removeChild(button);
}

/**
 * Modify request headers
 */
function modifyHeaders(e) {
    let edited_headers = e.requestHeaders;
    let headerTable    = document.getElementById('header-table');
    if (headerTable) {
	if (tableIds.length) {
	    tableIds.push(tableIds[tableIds.length-1]+1);
	} else {
	    tableIds.push(0);
	}
	currentIdx = tableIds[tableIds.length-1];
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
    if (!window.hasRun&&location.pathname.indexOf('paipu.html')===-1) {
	let paipuURL = browser.extension.getURL('paipu.html');
	let creating = browser.windows.create({
	    url: paipuURL,
	    type: 'detached_panel',
	    height: 900,
	    width: 800
	});
	creating.then(onCreated, onError);
	window.hasRun = true;
    } else {
	console.log('Already created a paipu window');
    }
});
