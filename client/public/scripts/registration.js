const Registration = (function() {
    const register = function(username, password, onSuccess, onError) {
        let data = {
            username: username,
            password: password
        }

        fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(data)
        }).then((res) => res.json() )
        .then(json=>{
            if (json.status === "success") {
                onSuccess();
            }

            if (onError) onError(json.error);
        })
        .catch(err=>{
            onError(err);
        });
    };

    return { register };
})();