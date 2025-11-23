const Socket = (function() {
    let socket = null;
    let groupId = null;

    const getSocket = function() {
        return socket;
    };

    let player = null;
    let opponent = null;
    let playerAttribute = null;
    let opponentAttribute = null;

    const getPlayer = function(player) {
        player = player;
    }
    const getOpponent = function(opp) {
        opponent = opp;
    }
    const getPlayerAttribute = function(attr) {
        playerAttribute = attr;
    }
    const getOpponentAttribute = function(attr) {
        opponentAttribute = attr;
    }

    const getGroupId = function() {
        return groupId;
    }

    const connect = function() {
        socket = io(BASE_URL);
        socket.on("connect", () => {
            socket.emit("request match");
        });

        // initialize the UI when receive the start game signal
        // params: 
        // startTime -- time when the game starts
        // duration -- duration of the game
        socket.on("game start", ({startTime, duration}) => {
            // setup the timer in UI
            // initialize the player and other objects
        });

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
            if (isMoved) {
                opponent.move(dir);
            } else {
                opponent.stop(dir);
            }
        });

        // receive the order list of the opponent
        socket.on("opponent orders", ({orders}) => {
            // update the order list of the opponent in UI
            lists.find(item => item.name === "opponent").list = orders;
        })

        // receive the items that the opponent holds
        socket.on("opponent items", ({items}) => {
            // update the opponent's bag in UI
            Bags.find(bag => bag.bagId === opponentAttribute.bagId).bag = items;
        })

        // receive the scores of the opponent
        socket.on("opponent score", ({score}) => {
            // update the score of the opponent in UI
            const opponentCash = document.getElementById(opponentAttribute.balanceId);
            opponentCash.textContent = score;
        })

        // receive if the opponent speedup
        socket.on("opponent speedup", ({speedup})=>{
            // update when the opponent speedup
            if (speedup) {
                opponent.speedUp();
            } else {
                opponent.slowDown();
            }
        })

        // get the position of the obstacle
        // position: {x, y}
        socket.on("update obstacle", ({position}) => {
            // update the position of the obstacle
            console.log("obstacle position:", position);
            banana.setXY(position.x, position.y);
        });

        // receive if the opponent is trapped by the obstacle
        socket.on("opponent trap", () => {
            // update the opponent animation
            // add trap audio effect
        })

        // get the final score
        // ranking: array<Object>
        // {id, score, rank}
        socket.on("final score", ({ranking}) => {
            // hide game area, show ranking page
        })

        // get group information after pairup
        // groupId, players()
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

    const endGame = function() {
        socket.emit("end game", {groupId: groupId});
    }

    const disconnect = function() {
        socket.disconnect();
        socket = null;
    };

    const PlayerTrap = function(){
        socket.emit("trap"); 
    }

    return { 
        sendGameField,
        playerReady,
        playerMove,
        updatePlayerBag,
        updateOrders,
        updateScore,
        getSocket, 
        connect, 
        disconnect, 
        cancelMatch, 
        endGame,
        playerSpeedup,
        PlayerTrap,
        getPlayer,
        getOpponent,
        getGroupId,
        getPlayerAttribute,
        getOpponentAttribute
    };
})();
