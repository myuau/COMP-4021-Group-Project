const gameRoom = function(groupId, player1, player2, io){
    if(!player1.request.session.user || !player2.request.session.user){
        console.error("Session is not defined!");
        return;
    }
    console.log(player1.request.session.user);

    if(!player1.request.session.user || !player2.request.session.user){
        console.error("Session is not defined!");
        return;
    }
    console.log(player1.request.session.user);

    const players = {
        [player1.id]: {
            id: player1.id, // socket id
            username: player1.request.session.user.username, // username
            userId: player1.request.session.user.userId, // userId
            socket: player1, // player's socket
            score: 0,
            ready: false
        },
        [player2.id]: {
            id: player2.id,
            username: player2.request.session.user.username,
            userId: player2.request.session.user.userId,
            username: player2.request.session.user.username,
            userId: player2.request.session.user.userId,
            socket: player2,
            score: 0,
            ready: false
        }
    };
    
    let gameArea = {
        top: null,
        bottom: null,
        left: null,
        right: null
    };
    
    let gameStatus = {
        status: "waiting",
        duration: 180000,
        startTime: null,
        endTime: null,
        timer: null,
        syncTimer: null
    };

    let obstacleTimer = null;

    player1.join(groupId);
    player2.join(groupId);

    console.log(`Game Room ${groupId} created: ${player1.id} vs ${player2.id}`);

    // helper function
    const randomPoint = function() {
        if (!gameArea.left) return { x: 0, y: 0 };
        const x = gameArea.left + (Math.random() * (gameArea.right - gameArea.left));
        const y = gameArea.top + (Math.random() * (gameArea.bottom - gameArea.top));
        return {x, y};
    };

    // get game field 
    const getGameField = function(boundingBox){
        gameArea = {...boundingBox};
        console.log(`Room ${groupId} set game area:`, gameArea);
    };

    // update the status of the player
    // start the game when both players are ready
    const setReady = function(playerId, ready){
        if (players[playerId]) {
            players[playerId].ready = ready;
            console.log(`Player ${playerId} ready`);
            
            checkBothReady();
        }
    };

    const checkBothReady = function() {
        const bothReady = Object.values(players).every(player => player.ready);
        if (bothReady) {
            console.log(`Room ${groupId} ready`);
            startGame();
        }
    };

    const startGame = function(){
        if (Object.values(players).every(player => player.ready)) {
            gameStatus.startTime = Date.now();
            gameStatus.status = "playing";
            
            console.log(`Room ${groupId} game start`);
            io.to(groupId).emit("game start", {
                startTime: gameStatus.startTime,
                duration: gameStatus.duration,
                player1: {
                    username: player1.username,
                    userId: player1.userId
                },
                player2: {
                    username: player2.username,
                    userId: player2.userId
                }
                duration: gameStatus.duration,
                player1: {
                    username: player1.username,
                    userId: player1.userId
                },
                player2: {
                    username: player2.username,
                    userId: player2.userId
                }
            });
            
            startGameTimer();
        }
    };

    const startGameTimer = function(){
        gameStatus.timer = setTimeout(() => {
            handleEndGame();
        }, gameStatus.duration);

        gameStatus.syncTimer = setInterval(() => {
            syncRemainingTime();
        }, 1000);

        obstacleTimer = setInterval(() => {
            handleObstacle();
        }, 5000);
    };

    const syncRemainingTime = function(){
        if (gameStatus.status !== 'playing') return;

        const elapsed = Date.now() - gameStatus.startTime;
        const remaining = Math.max(0, gameStatus.duration - elapsed);
        
        io.to(groupId).emit('sync time', {
            remainingTime: remaining,
            elapsedTime: elapsed
        });
    };

    const handlePlayerMove = function(playerId, isMoved, dir){
        broadcastToOther(playerId, "opponent move", { playerId, isMoved: isMoved, dir: dir });
    };

    const handlePlayerSpeedup = function(playerId, speedup){
        broadcastToOther(playerId, "opponent speedup", { playerId, speedup: speedup });
    };

    const handlePlayerTrap = function(playerId){
        broadcastToOther(playerId, "opponent trap", null);
    }

    const handleOrders = function(playerId, orders){
        broadcastToOther(playerId, "opponent orders", { playerId, orders });
    };

    const handleItems = function(playerId, items){
        broadcastToOther(playerId, "opponent items", { playerId, items });
    };

    const handleObstacle = function(){
        const position = randomPoint();
        io.to(groupId).emit("update obstacle", {
            position: position
        });
    };

    const handleScore = function(playerId, score){
        console.log("player score", playerId, score);
        console.log("player score", playerId, score);
        if (players[playerId]) {
            players[playerId].score = score;
            broadcastToOther(playerId, "opponent score", {
                playerId: playerId,
                score: score
            });
        }
    };

    const handleOrderComplete = function(playerId){
        broadcastToOther(playerId, "opponent complete", null);
    }

    const handleEndGame = function(){
        if (gameStatus.status === "end") return;
        
        gameStatus.status = "end";
        gameStatus.endTime = Date.now();
        
        if (obstacleTimer) {
            clearInterval(obstacleTimer);
            obstacleTimer = null;
        }
        if (gameStatus.timer) {
            clearTimeout(gameStatus.timer);
            gameStatus.timer = null;
        }
        if (gameStatus.syncTimer) {
            clearInterval(gameStatus.syncTimer);
            gameStatus.syncTimer = null;
        }
    
    
        const playerArray = Object.values(players);
        
        let ranking;
        if (playerArray[0].score > playerArray[1].score) {
            ranking = [
                {
                    id: playerArray[0].id,
                    username: playerArray[0].username,
                    userId: playerArray[0].userId,
                    score: playerArray[0].score,
                    rank: 1
                },
                {
                    id: playerArray[1].id,
                    username: playerArray[1].username,
                    userId: playerArray[1].userId,
                    score: playerArray[1].score,
                    rank: 2
                }
            ];
        } else if (playerArray[1].score > playerArray[0].score) {
            ranking = [
                {
                    id: playerArray[1].id,
                    username: playerArray[1].username,
                    userId: playerArray[1].userId,
                    score: playerArray[1].score,
                    rank: 1
                },
                {
                    id: playerArray[0].id,
                    username: playerArray[0].username,
                    userId: playerArray[0].userId,
                    score: playerArray[0].score,
                    rank: 2
                }
            ];
        } else {
            ranking = [
                {
                    id: playerArray[0].id,
                    username: playerArray[0].username,
                    userId: playerArray[0].userId,
                    score: playerArray[0].score,
                    rank: 1
                },
                {
                    id: playerArray[1].id,
                    username: playerArray[1].username,
                    userId: playerArray[1].userId,
                    score: playerArray[1].score,
                    rank: 1
                }
            ];
        }
    
        
        let ranking;
        if (playerArray[0].score > playerArray[1].score) {
            ranking = [
                {
                    id: playerArray[0].id,
                    username: playerArray[0].username,
                    userId: playerArray[0].userId,
                    score: playerArray[0].score,
                    rank: 1
                },
                {
                    id: playerArray[1].id,
                    username: playerArray[1].username,
                    userId: playerArray[1].userId,
                    score: playerArray[1].score,
                    rank: 2
                }
            ];
        } else if (playerArray[1].score > playerArray[0].score) {
            ranking = [
                {
                    id: playerArray[1].id,
                    username: playerArray[1].username,
                    userId: playerArray[1].userId,
                    score: playerArray[1].score,
                    rank: 1
                },
                {
                    id: playerArray[0].id,
                    username: playerArray[0].username,
                    userId: playerArray[0].userId,
                    score: playerArray[0].score,
                    rank: 2
                }
            ];
        } else {
            ranking = [
                {
                    id: playerArray[0].id,
                    username: playerArray[0].username,
                    userId: playerArray[0].userId,
                    score: playerArray[0].score,
                    rank: 1
                },
                {
                    id: playerArray[1].id,
                    username: playerArray[1].username,
                    userId: playerArray[1].userId,
                    score: playerArray[1].score,
                    rank: 1
                }
            ];
        }
    
        console.log(`Room ${groupId} Game over`);
    
    
        io.to(groupId).emit("final score", {
            groupId: groupId,
            ranking: ranking,
            endTime: gameStatus.endTime,
            isTie: playerArray[0].score === playerArray[1].score
            endTime: gameStatus.endTime,
            isTie: playerArray[0].score === playerArray[1].score
        });
    
        cleanup();
    };

    const cleanup = function(){
        Object.values(players).forEach(player => {
            if (player.socket) {
                player.socket.leave(groupId);
            }
        });
        console.log(`room ${groupId} cleaned`);
    };

    const broadcastToOther = function(senderId, event, data){
        Object.values(players).forEach(player => {
            if (player.id !== senderId && player.socket) {
                player.socket.emit(event, data);
            }
        });
    };

    const getOpponent = function(playerId){
        const opponent = Object.keys(players).filter(ele => ele !== playerId);
        const info = {
            username: players[opponent[0]].username,
            userId: players[opponent[0]].userId
        }
        broadcastToOther(playerId, "opponent info", info);
    }

    const getOpponent = function(playerId){
        const opponent = Object.keys(players).filter(ele => ele !== playerId);
        const info = {
            username: players[opponent[0]].username,
            userId: players[opponent[0]].userId
        }
        broadcastToOther(playerId, "opponent info", info);
    }

    const getStatus = function() {
        return {
            groupId: groupId,
            players: Object.keys(players),
            gameStatus: gameStatus,
            scores: Object.fromEntries(
                Object.entries(players).map(([id, player]) => [id, player.score])
            )
        };
    };

    return {
        getGameField,
        setReady,
        startGame,
        handlePlayerMove,
        handlePlayerSpeedup,
        handleItems,
        handleObstacle,
        handleOrders,
        handleScore,
        handleEndGame,
        handlePlayerTrap,
        getOpponent,
        cleanup,
        getStatus
    };
};

module.exports = gameRoom;