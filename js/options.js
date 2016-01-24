const storage = chrome.storage.local;

$(function () {
    storage.get(null, function (items) {
        console.log('options:' + JSON.stringify(items));
        const ul = $('#shortcut-list>ol');
        const keys = Object.keys(items);
        var key, url;
        for (var i = 0; i < keys.length; i++) {
            key = keys[i];
            var tab = items[key];
            url = tab.url;
            console.log("key:" + key + " url:" + url);
            var $favicon = $("<img src=" + tab.favicon + ">");
            var $key = $("<span>" + key.toString() + "</span>").css("color", "#dd4814").css("font-size", "30px");
            var $url = $("<a href=\"" + url.toString() + "\">" + url.toString() + "</a>").css("color", "blue");
            var li = $("<li></li>").append($favicon).append($key).append("<span>  </span>").append($url);
            li.css("background-color", i % 2 ? "#c4c6c2" : "white").css("margin-top", "10px");
            ul.append(li);
        }
    });
});
