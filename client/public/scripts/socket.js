const Socket = (function() {
    let socket = null;
    let groupId = null;

    const getSocket = function() {
        return socket;
    };

    const connect = function() {
        socket = io(BASE_URL);

        socket.on("connect", () => {
            socket.emit("request match");
        });

        // initialize the UI when receive the start game signal
        // params: 
        // startTime -- time when the game starts
        // duration -- duration of the game
        // player -- info of the current user, format:
        //          {username, userId, }
        socket.on("game start", ({startTime, duration, player, opponent}) => {
            // setup the timer in UI
            // initialize the player and other objects
        });

        // get the opponent info
        // username, userId
        socket.on("opponent info", ({username, userId}) => {
            // write code inside if you need this endpoint
            console.log(username, userId);
        })

        // synchronize the remaining time of the game with both players
        // so as to avoid the effect of transmission delay
        // params: 
        // remainingTime -- time remain for the game
        // elapsedTime -- amount of time that was used up
        socket.on("sync time", ({remainingTime, elapsedTime}) => {
            // update the timer in UI
        });

        // receive the movement of the opponent
        socket.on("opponent move", ({isMoved, dir}) => {
            // update the opponent player in UI
        });

        // receive the order list of the opponent
        socket.on("opponent orders", ({orders}) => {
            // update the order list of the opponent in UI
        })

        // receive the items that the opponent holds
        socket.on("opponent items", ({items}) => {
            // update the opponent's bag in UI
        })

        // receive the scores of the opponent
        socket.on("opponent score", ({score}) => {
            // update the score of the opponent in UI
        })

        // receive if the opponent speedup
        socket.on("opponent speedup", ({speedup})=>{
            // update when the opponent speedup
        })

        // get the position of the obstacle
        // position: {x, y}
        socket.on("update obstacle", ({position}) => {
            // update the position of the obstacle

        });

        // receive if the opponent is trapped by the obstacle
        socket.on("opponent trap", () => {
            // update the opponent animation
        })

        // get the final score
        // ranking: array<Object>
        // {id, score, rank}
        socket.on("final score", ({ranking}) => {
            // hide game area, show ranking page
        })

        // get group information after pairup
        // groupId -- id of the group
        // players -- info of the players in the pair, format:
        // {username, userId}
        // yourRole -- '1' - current player, '2' - opponent
        socket.on("match success", ({groupId, players, yourRole}) => {
            groupId = groupId;
            PairupPage.showMatched();
        });
    };

    const cancelMatch = function() {
        socket.emit("cancel match");
    }

    // send the game field information to the socket for generating random position of obstacle
    // format of gameField:
    // {
    //     top: null,
    //     bottom: null,
    //     left: null,
    //     right: null
    // };
    const sendGameField = function(gameField){
        socket.emit("game field", gameField);
    }

    // send signal to the server, let server know the player is ready
    // for calculating and synchronizing the time of the game for both players
    const playerReady = function(){
        socket.emit("ready");
    }

    // send player movement to the server
    // value of dir:
    // - `0` - not moving
    // - `1` - moving to the left
    // - `2` - moving up
    // - `3` - moving to the right
    // - `4` - moving down
    const playerMove = function(isMoved, dir){
        socket.emit("move", {
            isMoved: isMoved,
            dir: dir
        });
    }

    // update the items in the player bag to the server
    // items: array<string>
    const updatePlayerBag = function(items){
        socket.emit("update items", {
            items: items
        })
    }

    // update the order list of the player to the server
    // orders: array<Order>
    const updateOrders = function(orders){
        socket.emit("update orders", {
            orders: orders
        });
    }

    // update the score of the player to the server
    const updateScore = function(score){
        socket.emit("update score", {
            score: score
        })
    }

    // update if the player speedup to the server
    // speedup: true/ false
    const playerSpeedup = function(speedup){
        socket.emit("speedup", {
            speedup: speedup
        })
    }

    const getOpponent = function(){
        socket.emit("opponent info");
    }

    const endGame = function() {
        socket.emit("end game", {groupId: groupId});
    }

    const disconnect = function() {
        socket.disconnect();
        socket = null;
    };

    return { 
        sendGameField,
        playerReady,
        playerMove,
        playerSpeedup,
        getOpponent,
        updatePlayerBag,
        updateOrders,
        updateScore,
        getSocket, 
        connect, 
        disconnect, 
        cancelMatch, 
        endGame 
    };
})();
