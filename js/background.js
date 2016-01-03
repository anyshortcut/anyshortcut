console.log("background javascript file");

function setupBindUrlShortcut(){
    // alert("setup_bind_url_shortcut")
    var url = "http://www.geowind.cn"
    window.open(url,"_blank")
}

function onMenuClickHandler(info,tab){
    if (info.menuItemId == "menu") {
        console.log("onMenuClickHandler");
        setupBindUrlShortcut();
        // alert(JSON.stringify(info));
        sendResponse("Hello from background!")
    }
}

chrome.contextMenus.create({
    "title":"Set keyboard shortcut to launch this website quickly...",
    "type":"normal",
    "contexts":["page"],
    "id":"menu"
},function(){
    if (chrome.extension.lastError) {
        console.log("Got expected error: " + chrome.extension.lastError.message);
    }
});


chrome.contextMenus.onClicked.addListener(onMenuClickHandler);
