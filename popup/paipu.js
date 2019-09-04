var myPort = browser.runtime.connect();
console.log('content script start greeting');
myPort.postMessage({greeting: 'Hello from content script'})

function createInputText(value) {
    inputText       = document.createElement('input');
    inputText.type  = 'text';
    inputText.name  = 'name';
    inputText.value = value;
    return inputText;
}

function createHeaderTable(headers) {
    let rows  = [];
    let table = document.createElement('table');
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
    document.getElementById('header-table').appendChild(table);
}

myPort.onMessage.addListener((m) => {
    if (m.greeting) {
	console.log('From background:'+m.greeting);
	console.log('content script end greeting');
    } else if(m.headers) {
	console.log('From background:');
	console.dir(m.headers);
	createHeaderTable(m.headers);
	// DEBUG
	setTimeout(() => {
	    myPort.postMessage({edited_headers:m.headers});
	}, 2000);
    }
});
