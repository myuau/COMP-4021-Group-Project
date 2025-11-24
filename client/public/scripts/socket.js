const Socket = (function() {
    let socket = null;
    let currGroupId = null;
    let gameStart = false;
    let player = null;
    let opponent = null;

    const getSocket = function() {
        return socket;
    };

    let playerObj = null;
    let opponentObj = null;
    let playerAttribute = null;
    let opponentAttribute = null;
    let banana = null;
    let sounds = null;

    // setters functions
    const setPlayer = function(p) {
        playerObj = p;
    }
    const setOpponent = function(opp) {
        opponentObj = opp;
    }
    const setPlayerAttribute = function(attr) {
        playerAttribute = attr;
    }
    const setOpponentAttribute = function(attr) {
        opponentAttribute = attr;
    }
    const setBanana = function(bananaObj) {
        banana = bananaObj;
    }
    const setSounds = function(soundsObj) {
        sounds = soundsObj;
    }

    // getter functions
    const getCurrGroupId = function() {
        return currGroupId;
    }

    const connect = function() {
        if (socket && socket.connected) {
            console.log("Socket was connected already, skip connection");
            return;
        }

        socket = io(BASE_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        const savedState = localStorage.getItem('socketState');
        if (savedState) {
            const state = JSON.parse(savedState);
            currGroupId = state.groupId;
            console.log("Restore Group ID:", groupId);
            
            // reconnect
            socket.emit("reconnect", { groupId: currGroupId });
        } else {
            // new connection, request pairup
            socket.emit("request match");
        }

        // initialize the UI when receive the start game signal
        // params: 
        // startTime -- time when the game starts
        // duration -- duration of the game
        // player1/ player2 -- info of the current user/ opponent respectively, format:
        //          {username, userId}
        socket.on("game start", ({startTime, duration, player1, player2}) => {
            // setup the timer in UI
            console.log("player1", player1, "player2", player2);
            $("#time-remaining").text(duration);
            gameStart = true;

            // initialize the player and other objects
            player = player1;
            opponent = player2;

            $("#bag1").text(`${capitalizeString(player.username)}'s Bag`);
            $("#bag2").text(`${capitalizeString(opponent.username)}'s Bag`);
            $("#player-1-orders h2").text(`${capitalizeString(player.username)}'s Order`);
            $("#player-2-orders h2").text(`${capitalizeString(opponent.username)}'s Orders`);
        });

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
            console.log(remainingTime, elapsedTime);
            $("#time-remaining").text(remainingTime);
        });

        // receive the movement of the opponent
        socket.on("opponent move", ({isMoved, dir}) => {
            // update the opponent player in UI
            console.log("move", isMoved, dir);
            if (isMoved) {
                opponentObj.move(dir);
            } else {
                opponentObj.stop(dir);
            }
        });

        // receive the order list of the opponent
        socket.on("opponent orders", ({orders}) => {
            // update the order list of the opponent in UI
            console.log("orders", orders);
            lists.find(item => item.name === "opponent").list = orders;
        })

        // receive the items that the opponent holds
        socket.on("opponent items", ({items}) => {
            // update the opponent's bag in UI
            console.log("items", items);
            Bags.find(bag => bag.bagId === opponentAttribute.bagId).bag = items;
        })

        // receive the scores of the opponent
        socket.on("opponent score", ({score}) => {
            // update the score of the opponent in UI
            console.log("score", score)
            const opponentCash = document.getElementById(opponentAttribute.balanceId);
            opponentCash.textContent = score;
        })

        // receive if the opponent speedup
        socket.on("opponent speedup", ({speedup})=>{
            // update when the opponent speedup
            if (speedup) {
                opponentObj.speedUp();
            } else {
                opponentObj.slowDown();
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
            GamePage.gameOver();
            endGameTick(gameIntervalId);
            sounds.background.pause();
            sounds.complete.pause();

            console.log("Game over!");
            RankingPageAudio.playGameOverbgm();
            RankingPage.setRanking(ranking, isTie);
            RankingPage.show();
        })

        // get group information after pairup
        // currGroupId -- id of the group
        // players -- info of the players in the pair, format:
        // {username, userId}
        // yourRole -- '1' - current player, '2' - opponent
        socket.on("match success", ({groupId, players, yourRole}) => {
            currGroupId = groupId;
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

    const endGame = function() {
        socket.emit("end game", {groupId: currGroupId});
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
        setPlayer,
        setOpponent,
        getCurrGroupId,
        setPlayerAttribute,
        setOpponentAttribute,
        setSounds,
        setBanana,
    };
})();


function capitalizeString(string) {
    return string[0].toUpperCase() + string.slice(1); 
} 