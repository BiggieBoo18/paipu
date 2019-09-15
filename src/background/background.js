/**
 * Set target page
 */
function getTargetInfo() {
    let targetInfo = browser.storage.sync.get();
    return targetInfo;
}
var targetPage = '<all_urls>';
getTargetInfo().then((res) => {
    scheme = '*';
    if (res.targetScheme) {
	scheme = res.targetScheme;
    }
    host   = '*';
    if (res.targetHost) {
	host = res.targetHost;
    }
    path   = '*';
    if (res.targetPath) {
	path = res.targetPath;
    }
    targetPage = `${scheme}`+`://${host}/`+`${path}` || '<all_urls>';
    console.log(targetPage);
});

var tableIds = [];
var windowId = -1;

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
function parseCookie(value) {
    let cookies = [];
    cookies = value.split(';');
    return cookies;
}
function addRow(table, headers, rows, idx, ex=false) {
    let rowIdx  = rows.length
    rows.push(table.insertRow(-1));
    if (!ex) {
	rows[rowIdx].id = `row-${idx}`;
    } else {
	rows[rowIdx].id = `ex-row-${idx}`;
    }
    let name  = rows[rowIdx].insertCell(-1);
    if (!ex) {
	name.appendChild(createInputText(headers[idx-1]['name'], `name${idx-1}`));
    } else {
	name.appendChild(createInputText('', `name${idx-1}`));
    }
    let val  = rows[rowIdx].insertCell(-1);
    if (!ex) {
	if (headers[idx-1]['value']) {
	    val.appendChild(createInputText(headers[idx-1]['value'], `value${idx-1}`));
	} else {
	    val.appendChild(createInputText(headers[idx-1]['binaryValue'], `value${idx-1}`));
	}
    } else {
	val.appendChild(createInputText('', `value${idx-1}`));
    }
    let checkbox  = rows[rowIdx].insertCell(-1);
    checkbox.appendChild(createCheckbox(`checkbox${idx-1}`));
}
function addRowsForCookie(table, headers, rows, idx) {
    let rowIdx  = rows.length
    let cookies = parseCookie(headers[idx-1]['value']);
    for (let i=0;i<cookies.length;i++) {
	rows.push(table.insertRow(-1));
	rows[rowIdx+i].id = `row-${idx}-${i}`
	let name  = rows[rowIdx+i].insertCell(-1);
	if (i==0) {
	    name.appendChild(createInputText('Cookie', `name${idx-1}`));
	} else {
	    name.appendChild(createInputText('', `name${idx-1}`));
	}
	let val  = rows[rowIdx+i].insertCell(-1);
	if (headers[idx-1]['value']) {
	    val.appendChild(createInputText(cookies[i], `value${idx-1}`));
	} else {
	    val.appendChild(createInputText(headers[idx-1]['binaryValue'], `value${idx-1}`));
	}
	let checkbox  = rows[rowIdx+i].insertCell(-1);
	checkbox.appendChild(createCheckbox(`checkbox${idx-1}`));
    }
    return cookies.length
}
function delRow(table, ex=false) {
    if (ex) {
	tail = table.rows[table.rows.length-1];
	if (tail.id.startsWith('ex')) {
	    table.deleteRow(-1);
	}
    } else {
	table.deleteRow(-1);
    }
}

function createHeaderTable(headers, url, headerTable, idx) {
    let rows  = [];
    let table = document.createElement('table');
    table.id = `table-${idx}`;
    // create table caption
    let tableCaption = document.createElement('caption');
    tableCaption.textContent = url;
    table.appendChild(tableCaption);
    // create table header
    let tableHeaders = ['Name', 'Value', 'Not Send'];
    rows.push(table.insertRow(-1))
    for (let i=0;i<tableHeaders.length;i++) {
	let headerCell = document.createElement('th');
	headerCell.textContent = tableHeaders[i];
	rows[0].appendChild(headerCell);
    }
    // create table cells
    let cntCookies = 0;
    for (let i=1;i<headers.length+1;i++) {
	// addRow(table, headers, rows, i); // old
	if (headers[i-1]['name']==="Cookie") {
	    cntCookies += addRowsForCookie(table, headers, rows, i);
	} else {
	    addRow(table, headers, rows, i);
	}
    }
    headerTable.appendChild(table);
    // create send button
    let button = document.createElement('button');
    button.textContent = 'send';
    button.id          = `send-button-${idx}`;
    button.className   = `send-button-${idx}`;
    headerTable.appendChild(button);
    // create add row button
    button = document.createElement('button');
    button.textContent = '+';
    button.id          = `add-button-${idx}`;
    button.className   = `add-button-${idx}`;
    headerTable.appendChild(button);
    button.addEventListener('click', () => {
	addRow(table, headers, rows, rows.length, ex=true);
    });
    // create sub row button
    button = document.createElement('button');
    button.textContent = '-';
    button.id          = `sub-button-${idx}`;
    button.className   = `sub-button-${idx}`;
    headerTable.appendChild(button);
    button.addEventListener('click', () => {
	delRow(table, rows.length, ex=true);
    });
}
function mergeCookies(rows, idx) {
    let cookiesValue = "";
    let row = undefined;
    for (let i=idx;i<rows.length;i++) {
	row = rows[i];
	if (row.id.startsWith(`row-${idx}`)&&!row.cells[2].children[0].checked&&row.cells[1].children[0].value) {
	    cookiesValue += `${row.cells[1].children[0].value};`;
	}
    }
    cookiesValue = cookiesValue.slice(0, -1);
    return cookiesValue;
}
function getTable(idx) {
    let returnTable = [];
    let table       = document.getElementById(`table-${idx}`);
    for (let i=1;i<table.rows.length;i++) {
	let tmp = {};
	tmp['name']  = table.rows[i].cells[0].children[0].value;
	if (tmp['name']==='Cookie') {
	    tmp['value'] = mergeCookies(table.rows, i);
	} else {
	    tmp['value'] = table.rows[i].cells[1].children[0].value;
	}
	if (tmp['name']==='Cookie') {
	    if (tmp['name']) {
		returnTable.push(tmp);
	    }
	} else {
	    if (tmp['name']&&!table.rows[i].cells[2].children[0].checked) {
		returnTable.push(tmp);
	    }
	}
	
    }
    return returnTable;
}
function deleteTable(idx) {
    let table   = document.getElementById(`table-${idx}`);
    while (table.firstChild) table.removeChild(table.firstChild);
    table.parentNode.removeChild(table);
    let button  = document.getElementById(`send-button-${idx}`);
    while (button.firstChild) button.removeChild(button.firstChild);
    button.parentNode.removeChild(button);
    button  = document.getElementById(`add-button-${idx}`);
    while (button.firstChild) button.removeChild(button.firstChild);
    button.parentNode.removeChild(button);
    button  = document.getElementById(`sub-button-${idx}`);
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
    if (windowId!==-1) {
	browser.windows.update(windowId, {focused: true});
    }
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
	// create header table
	createHeaderTable(e.requestHeaders, e.url, headerTable, currentIdx);
	let button = document.getElementById(`send-button-${currentIdx}`);
	let asyncModifyHeader = new Promise((resolve, reject) => {
	    button.onclick = () => {
		currentIdx = button.id.slice('send-button-'.length);
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
	listenText = document.getElementById('listen-text');
	if (listenButton.checked) {
	    browser.webRequest.onBeforeSendHeaders.addListener(
		modifyHeaders,
		{urls: [targetPage]},
		['blocking', 'requestHeaders']
	    );
	    listenText.textContent = 'Paipu ON';
	} else {
	    browser.webRequest.onBeforeSendHeaders.removeListener(modifyHeaders);
	    listenText.textContent = 'Paipu OFF';
	}
    });
}

/**
 * Create main paipu window when pushed toolbar button,
 * then connect with new window.
 */
function onCreated(windowInfo) {
    console.log(`Created window: ${windowInfo.id}`);
    windowId = windowInfo.id;
    browser.windows.update(windowId, {height:900, width:801}); // for redraw
    browser.windows.onRemoved.addListener((wid) => {
	console.log('Closed window: ' + wid);
	if (wid===windowInfo.id) {
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
	if (windowId!==-1) {
	    browser.windows.update(windowId, {focused: true});
	}
    }
});

/**
 * Open option page
 */
function onOpened() {
    console.log('Options page opened');
}

function onError(error) {
    console.log(`Error: ${error}`);
}
optionButton = document.getElementById('option-button');
if (optionButton) {
    optionButton.addEventListener('click', () => {
	browser.runtime.openOptionsPage().then(onOpened, onError);
    });
}

/**
 * All send
 */
function allSend() {
    let cnt = 0;
    let len = tableIds.length;
    for (let i=0;i<len;i++) {
	sendButton = document.getElementById(`send-button-${tableIds[i-cnt]}`);
	if (sendButton) {
	    sendButton.click();
	    cnt++;
	}
    }
}
allSendButton = document.getElementById('send-all');
if (allSendButton) {
    allSendButton.addEventListener('click', allSend);
}
