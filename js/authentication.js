import FireBase from 'firebase';

var firebase = new FireBase('https://shurl.firebaseio.com');

export default{
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
}

