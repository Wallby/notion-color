//import * from "all.mjs"


let style = document.createElement("style");
style.id = "notion-color-extension";
document.head.appendChild(style);

function updateStyle(color)
{
    //console.log(`Color: ${color}`);

    if (!color) {
        style.textContent = "";
        return;
    }
    
    //--nc-contrast: ${contrast};
    style.textContent = `
    :root {
        --nc-color: ${color};
    }
    .notion-dark-theme {
      --c-bacPri: color-mix(in hsl, var(--nc-color) 90%, #000000 20%);
      --c-bacSec: var(--nc-color);
      --c-timBac: color-mix(in hsl, var(--nc-color) 90%, #000000 10%);
      --c-popBac: color-mix(in hsl, var(--nc-color) 80%, #000000 20%);
      --c-bacEle: color-mix(in hsl, var(--nc-color) 80%, #000000 20%);
    }`;
}

chrome.storage.sync.get("savedColor", (data) => {
    const savedColor = data.savedColor;
    updateStyle(savedColor);
});

chrome.runtime.onMessage.addListener( msg => {
    if (msg.type === MessageType.OnActiveColorChanged) {
        updateStyle(msg.activeColor);
    }
});
chrome.runtime.onMessage.addListener( msg => {
    if (msg.type === MessageType.OnPopupClosed) {    
        chrome.storage.sync.get("savedColor", (data) => {
            const savedColor = data.savedColor;
            updateStyle(savedColor);
        });
    }
});

new MutationObserver(() => {
    if (!document.head.contains(style)) {
        document.head.appendChild(style);
    }
}).observe(document.documentElement, {
    childList: true,
    subtree: true
});