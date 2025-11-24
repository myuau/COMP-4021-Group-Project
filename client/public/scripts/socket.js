const Socket = (function() {
    let socket = null;
    let groupId = null;

    let remaining;
    let elapsed;

    const getSocket = function() {
        return socket;
    };

    let player = null;
    let opponent = null;
    let playerAttribute = null;
    let opponentAttribute = null;
    let banana = null;
    let sounds = null;

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
    const getBanana = function(bananaObj) {
        banana = bananaObj;
    }
    const getSounds = function(soundsObj) {
        sounds = soundsObj;
    }

    const getGroupId = function() {
        return groupId;
    }

    const getRemainingTime = function() {
        return remaining;
    }

    const getElapsedTime = function() {
        return elapsed;
    }

    const connect = function() {
        socket = io(BASE_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        }, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });
        socket.on("connect", () => {
            socket.emit("request match");
        });

        // initialize the UI when receive the start game signal
        // params: 
        // startTime -- time when the game starts
        // duration -- duration of the game
        // player1/ player2 -- info of the current user/ opponent respectively, format:
        //          {username, userId}
        socket.on("game start", ({startTime, duration, player1, player2}) => {
            // setup the timer in UI
            // initialize the player and other objects
        });

        // get the opponent info
        // username, userId
        socket.on("opponent info", ({username, userId}) => {
            // write code inside if you need this endpoint
        })

        // get the opponent info
        // username, userId
        socket.on("opponent info", ({username, userId}) => {
            // write code inside if you need this endpoint
        })

        // synchronize the remaining time of the game with both players
        // so as to avoid the effect of transmission delay
        // params: 
        // remainingTime -- time remain for the game
        // elapsedTime -- amount of time that was used up
        socket.on("sync time", ({remainingTime, elapsedTime}) => {
            // update the timer in UI
            const timer = document.getElementById("time-remaining");
            timeRemaining = Math.ceil(remainingTime / 1000);
            gameTimeSoFar = Math.floor(elapsedTime / 1000);
            timer.textContent = timeRemaining;
            console.log("time remaining: ", timeRemaining);
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
            banana.setXY(position.x, position.y);
        });

        // receive if the opponent is trapped by the obstacle
        socket.on("opponent trap", () => {
            // update the opponent animation
            // add trap audio effect
        })

        socket.on("opponent complete", () => {
            // add sound effect when the opponent complete an order
            sounds.complete.pause();
            sounds.complete.currentTime = 0;
            sounds.complete.play();
        })

        // get the final score
        // ranking: array<Object>
        // {id, username, userId, score, rank}
        // isTie: boolean
        socket.on("final score", ({ranking, isTie}) => {
            // hide game area, show ranking page
            endGameTick(gameIntervalId);
            sounds.background.pause();
            sounds.complete.pause();
            const gameArea = document.getElementById("game-container");
            gameArea.style.display = "none";

            const signoutContainer = document.getElementsByClassName("signout-container ranking"); 
            const front = document.getElementsByClassName("front ranking");
            signoutContainer[0].style.visibility = "visible";
            front[0].style.visibility = "visible";

            console.log("Game over!");
            RankingPage.show();
            RankingPage.setRanking(ranking, isTie);
            RankingPage.show();
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
        console.log("player ready");
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

    // send signal to the server when the player complete an order
    const playerCompleteOrder = function(){
        socket.emit("complete");
    }

    // get opponent info from the server
    const requestOpponent = function(){
        socket.emit("opponent info");
    }

    // send signal to the server when the player complete an order
    const playerCompleteOrder = function(){
        socket.emit("complete");
    }

    // get opponent info from the server
    const requestOpponent = function(){
        socket.emit("opponent info");
    }

    // send signal to the server when the player complete an order
    const playerCompleteOrder = function(){
        socket.emit("complete");
    }

    // get opponent info from the server
    const requestOpponent = function(){
        socket.emit("opponent info");
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
        playerSpeedup,
        playerCompleteOrder,
        requestOpponent,
        playerSpeedup,
        playerCompleteOrder,
        requestOpponent,
        playerSpeedup,
        playerCompleteOrder,
        requestOpponent,
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
