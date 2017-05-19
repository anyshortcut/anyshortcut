let auth = {
    isAuthenticated(){
        return !!localStorage.getItem('token');
    },
    logout(){
        localStorage.removeItem('token');
    },
    signin(token){
        localStorage.setItem('token', token);
    }
};

export default auth;

