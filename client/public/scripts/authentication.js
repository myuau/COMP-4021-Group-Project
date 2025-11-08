const authentication = (function(){
    // This stores the current signed-in user
    let user = null;

    // This function gets the signed-in user
    const getUser = function() {
        return user;
    }

    const signin = function(username, password, onSuccess, onError){

    }

    const validate = function(onSuccess, onError){}

    const signout = function(onSuccess, onError){}

    return {getUser, signin, validate, signout}
})();