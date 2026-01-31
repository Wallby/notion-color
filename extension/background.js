importScripts("all.js");


chrome.runtime.onConnect.addListener( port => {
    if (port.name === "popup") {
        port.onDisconnect.addListener(() => {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                const message = {
                    type: MessageType.OnPopupClosed
                };
                chrome.tabs.sendMessage(tabs[0].id, message);
            });
        });
    }
});