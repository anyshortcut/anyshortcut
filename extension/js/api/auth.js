let auth = {
    authenticated: true,
    signOut(){
    },

    signIn(authData){
    },
};

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (true) {
        case message.loginSuccessful:
            auth.signIn(message.data);
            break;
        case message.logout:
            auth.signOut();
            break;
        default:
            break;
    }
});

export default auth;

