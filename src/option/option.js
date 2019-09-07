function saveOptions(e) {
    browser.storage.sync.set({
	targetScheme: document.getElementById('url-scheme').value,
	targetHost: document.getElementById('url-host').value,
	targetPath: document.getElementById('url-path').value
    });
    document.getElementById('saved-message').style.visibility = "visible";
    e.preventDefault();
}

function restoreOptions() {
    let targetInfo = browser.storage.sync.get();
    targetInfo.then((res) => {
	document.getElementById('url-scheme').value = res.targetScheme || '';
	document.getElementById('url-host').value = res.targetHost || '';
	document.getElementById('url-path').value = res.targetPath || '';
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('form-option').addEventListener('submit', saveOptions);
