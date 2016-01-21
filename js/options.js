var storage = chrome.storage.local;

$(function() {
    storage.get(null, function(items) {
        var ul = $("#shortcut-list>ol");
        keys = Object.keys(items);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var url = items[key];
            var $key = $("<span>" + key.toString() + "</span>").css("color", "#dd4814").css("font-size", "30px");
            var $url = $("<a href=\"" + url.toString() + "\">" + url.toString() + "</a>").css("color", "blue");
            var li = $("<li></li>").append($key).append("<span>  </span>").append($url);
            li.css("background-color", i % 2 ? "#c4c6c2" : "white").css("margin-top", "10px");
            ul.append(li);
        }
    });
});
