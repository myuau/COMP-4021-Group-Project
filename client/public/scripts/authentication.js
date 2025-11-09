const Authentication = (function() {
    let user = null;

    const getUser = function() {
        return user;
    }

    const signin = function(username, password, onSuccess, onError) {
        let data = {
            username: username,
            password: password
        };

        fetch("/signin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(res=>res.json())
        .then(json=>{
            if(json.status === "success"){
                user = json.user;
                onSuccess();
            }
            else if(onError) onError(json.error);
        })
        .catch(err=>{
            onError(err);
        })
    };

    const validate = function(onSuccess, onError) {
        fetch("/validate", {
            method: "GET"
        }).then(res=>res.json())
        .then(json=>{
            if(json.status === "success"){
                user = json.user;
                onSuccess();
            }
            else if(onError){
                onError(json.error);
            }
        })
        .catch(err=>{
            onError(err);
        })
    };
    const signout = function(onSuccess, onError) {
        fetch("/signout", {
            method: "GET"
        }).then(res=>res.json())
        .then(json=>{
            if(json.status === "success"){
                onSuccess();
            }
            else if(onError){
                onError(json.error);
            }
        })
        .catch(err=>{
            onError(err);
        })
    };

    return { getUser, signin, validate, signout };
})();