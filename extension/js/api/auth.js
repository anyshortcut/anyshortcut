let auth = {
    authenticated: true,
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NzcyNDA5OTYsImlkIjoxfQ.VakwR7efpnjI35hjOMg-efDn-QiYNFeI1VNTzo4BELc',
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

