console.log("Hello word!");
// chrome.runtime.sendMessage("Hello",function(response){
//     document.write(response);
// });
chrome.runtime.onMessage.addListener(function(message, sender, callback){
    // document.write(response);
    console.log("chrome.runtime.onMessage.",message);
});
