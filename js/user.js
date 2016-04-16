import FireBase from 'firebase';
import Vue from 'vue';

var firebase = new FireBase('https://shurl.firebaseio.com');
window.onload = function() {
    var vm = new Vue({
            el: 'body',
            data: {
                registered: true,
                username: '',
                password: ''
            },
            computed: {
                authData: function() {
                    //Maybe MD5 encrypt the user password?
                    return {email: this.username, password: this.password};
                }
            },
            methods: {
                signUp: function() {
                    if (this.username === '' || this.password === '') {
                        alert("empty field");
                    }

                    firebase.createUser(this.authData,
                        (error, userData) => {
                            if (error) {
                                console.log("Error creating user:", error);
                                this.registered = false;
                            } else {
                                console.log("Successfully created user account with uid:", userData.uid);
                                this.registered = true;
                                this.username = this.password = '';
                            }
                        });
                },
                signIn: function() {
                    firebase.authWithPassword(this.authData,
                        (error, authData) => {
                            if (error) {
                                console.log("Login Failed!", error);
                            } else {
                                console.log("Authenticated successfully with payload:", authData);
                            }
                        });
                },
                switchToSingUpState: function() {
                    this.registered = false;
                }
            }
        }
    );
};

