function saveOptions(e) {
    browser.storage.sync.set({
	targetUrl: document.getElementById('url-text').value
    });
    e.preventDefault();
}

function restoreOptions() {
    let storageItem = browser.storage.sync.get('targetUrl');
    storageItem.then((res) => {
	document.getElementById('url-text').value = res.targetUrl || '';
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('form-option').addEventListener('submit', saveOptions);
