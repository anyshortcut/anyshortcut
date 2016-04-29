import FireBase from 'firebase';

let firebase = new FireBase('https://shurl.firebaseio.com');

let auth = {
    signOut(){
        firebase.unauth();
    },

    signIn(authData){
        firebase.authWithPassword(authData,
            (error, authData) => {
                if (error) {
                    console.log("Login Failed!", error);
                } else {
                    console.log("Authenticated successfully with payload:", authData);
                }
            });
    }
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

