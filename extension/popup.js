//import * from "all.mjs"

const port = chrome.runtime.connect({ name: "popup" });

function loadSavedColor() {
    chrome.storage.session.remove("activeColor");
    chrome.storage.sync.get("savedColor", (data) => {
        const savedColor = data.savedColor;
        if(savedColor) {
            //console.log(`Loaded saved color: ${savedColor}`);
            chrome.storage.session.set({ activeColor: savedColor });
        }
    });
}

const pickr = Pickr.create({
    el: '#colorPicker',
    theme: 'nano',
    appClass: 'colorPicker',
    //default: #000000,
    //defaultRepresentation: 'HEX',
    showAlways: true,
    components: {
        preview: true,
        hue: true,

        interaction: {
            input: true,
            cancel: true,
            clear: true,
            save: true
        }
    }
});

let preview = document.querySelector("#preview");
chrome.storage.sync.get("savedPreview", (data) => {
    let savedPreview = data.savedPreview;
    if(!savedPreview) {
        savedPreview = false;
        chrome.storage.sync.set({ savedPreview: savedPreview });
    }
    preview.checked = savedPreview;
});
preview.addEventListener("change", () => {
    chrome.storage.sync.set({ savedPreview: preview.checked });
    if(!preview.checked) {
        //console.log("Unchecked color!");
        loadSavedColor();
    }
    else {
        const color = pickr.getColor();
        //console.log("Checked color!");
        if(color) {
            const hex = color.toHEXA().toString();
            //console.log(`Checked color: ${hex}`);
            chrome.storage.session.set({ activeColor: hex });
        }
    }
});

function saveColor(color)
{
    //console.log(`Save color: ${color}`);
    chrome.storage.sync.set({ savedColor: color });
    chrome.storage.session.set({ activeColor: color });
}
function removeColor()
{
    //console.log("Remove color");
    chrome.storage.sync.remove("savedColor");
    chrome.storage.session.remove("activeColor");
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "session" && changes.activeColor) {
        const activeColor = changes.activeColor.newValue;
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            const message = {
                type: MessageType.OnActiveColorChanged,
                activeColor: activeColor
            };
            chrome.tabs.sendMessage(tabs[0].id, message);
        });
    }
});

if(preview.checked)
{
    loadSavedColor();
}

pickr.on('init', instance => {
    const pickrLabel = document.querySelector('#colorPickerLabel');
    document.querySelector('.pickr').append(pickrLabel);

    chrome.storage.sync.get("savedColor", (data) => {
        const savedColor = data.savedColor;
        if (savedColor) {
            pickr.setColor(data.savedColor);
        }
        else {
            pickr.setColor(null);
        }
    });
});

pickr.on('change', (color, source, instance) => {
    if(preview.checked) {
        const hex = color.toHEXA().toString();
        chrome.storage.session.set({ activeColor: hex });
    }
});
pickr.on('hide', instance => {
    if(preview.checked) {
        loadSavedColor();
    }
});

/*
"User clicked the save / clear button. Also fired on clear with null as color."
https://github.com/simonwep/pickr
*/
pickr.on('save', (color, instance) => {
    /*
    If called from setColor(null) in init, this won't run
    If called from clear, this won't run
    Thus will only run on save
    */
    if(color) {
        const hex = color.toHEXA().toString();
        saveColor(hex);
    }
});

pickr.on('clear', instance => {
    removeColor();
});