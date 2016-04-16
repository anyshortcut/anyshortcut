import FireBase from 'firebase';
import Vue from 'vue';

var firebase = new FireBase('https://shurl.firebaseio.com');
window.onload = function() {
    var vm = new Vue({
            el: 'body',
            data: {
                username: '',
                password: ''
            },
            methods: {
                register: function() {
                    if (this.username === '' || this.password === '') {
                        alert("empty field");
                    }

                    firebase.createUser({email: this.username, password: this.password},
                        (error, userData) => {
                            if (error) {
                                console.log("Error creating user:", error);
                            } else {
                                console.log("Successfully created user account with uid:", userData.uid);
                            }

                            this.username = this.password = '';
                        });
                }
            }
        }
    );
};

