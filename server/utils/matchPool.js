const gameRoom = require("./gameRoom.js");

const matchPool = function(io) {
    let queue = []; // waiting queue (socket of each player)
    let groups = {}; // current groups
    let gameRooms = {}; // game rooms
    let groupCount = 0; // number of groups formed
    let playerGroups = {}; // each player's group

    // check if the user does not match
    const handleMatchRequest = function(socket) {
        if (!socket.request.session || !socket.request.session.user){
            console.error("Match error: do not login")
            socket.emit("match error", {
                isMatched: false,
                message: "Please login before matching!"
            });
            return;
        }

        if (queue.includes(socket) || playerGroups[socket.id]) {
            console.error("match error: already matched or in queue");
            socket.emit("match error", {
                isMatched: true,
                message: "already matched or in queue"
            });
            return;
        }

        console.log(`Player ${socket.id} (${socket.request.session.user.username}) added to queue, current queue length: ${queue.length + 1}`);
        queue.push(socket);
        
        console.log(`Current queue: ${queue.map(s => s.id)}`);
        
        matchPlayers();
    };

    // match the users
    const matchPlayers = function() {
        console.log(`Matching players, queue size: ${queue.length}`);
        
        if (queue.length < 2) {
            console.log(`Not enough players to match, queue size: ${queue.length}`);
            return;
        }
        
        let player1 = queue.shift();
        let player2 = queue.shift();

        // check connection
        if (!player1.connected || !player2.connected) {
            console.log("Player disconnected, skipping match");
            if (player1.connected) queue.unshift(player1);
            if (player2.connected) queue.unshift(player2);
            
            if (queue.length >= 2) {
                setImmediate(matchPlayers);
            }
            return;
        }

        // check if the player is in other group
        if (playerGroups[player1.id] || playerGroups[player2.id]) {
            console.log("One or both players already in another group");
            if (!playerGroups[player1.id]) queue.unshift(player1);
            if (!playerGroups[player2.id]) queue.unshift(player2);
            
            if (queue.length >= 2) {
                setImmediate(matchPlayers);
            }
            return;
        }

        // create match
        groupCount++;
        const targetGroupId = groupCount.toString();

        let room = gameRoom(targetGroupId, player1, player2, io);
        gameRooms[targetGroupId] = room;

        const group = {
            player1: {
                ...player1.request.session.user,
                id: player1.id
            },
            player2: {
                ...player2.request.session.user,
                id: player2.id
            },
            createdAt: Date.now(),
            room: room
        };

        groups[targetGroupId] = group;
        playerGroups[player1.id] = targetGroupId;
        playerGroups[player2.id] = targetGroupId;

        console.log(`Match Successfully! Group ${targetGroupId}: ${player1.request.session.user.username} vs ${player2.request.session.user.username}`);
        console.log(`Current active groups: ${Object.keys(groups).length}`);

        player1.emit("match success", {
            groupId: targetGroupId,
            players: [player1.request.session.user, player2.request.session.user],
            yourRole: 1
        });

        player2.emit("match success", {
            groupId: targetGroupId,
            players: [player1.request.session.user, player2.request.session.user],
            yourRole: 2
        });
        
        console.log(`After matching, queue size: ${queue.length}`);
        
        if (queue.length >= 2) {
            console.log("Continuing to match remaining players...");
            setImmediate(matchPlayers);
        }
    };

    // if the user cancel matching, then remove it from the queue
    const handleCancelMatch = function(socket){
        const queuePosition = queue.indexOf(socket);
        if (queuePosition !== -1) {
            queue.splice(queuePosition, 1);
            console.log(`Player ${socket.id} (${socket.request.session.user.username}) cancel match, current queue length: ${queue.length}`);
        } else {
            console.log(`Player ${socket.id} not found`);
        }
    }

    // clean the pair when the game ends
    const handleEndGame = function(groupId){
        console.log(`Ending game for group ${groupId}`);
        const group = groups[groupId];
        if(group){
            // players leave the group
            const player1 = io.sockets.sockets.get(group.player1.id);
            const player2 = io.sockets.sockets.get(group.player2.id);

            if (player1) player1.leave(groupId);
            if (player2) player2.leave(groupId);

            // delete group info
            delete playerGroups[group.player1.id];
            delete playerGroups[group.player2.id];
            delete groups[groupId];
            
            // cleanup game room
            if (gameRooms[groupId]) {
                gameRooms[groupId].cleanup();
                delete gameRooms[groupId];
            }
            
            console.log(`Deleted group: ${groupId}`);
            console.log(`Remaining active groups: ${Object.keys(groups).length}`);
        } else {
            console.log(`Group ${groupId} not found when ending game`);
        }
    }

    // update the player socket when directed to the play-page.html
    const updatePlayerSocket = function(groupId, newSocket) {
        console.log(`Updating socket for group ${groupId}: ${newSocket.id}`);
        const gameRoom = gameRooms[groupId];
        if (gameRoom) {
            gameRoom.updatePlayerSocket(newSocket);
            
            // Find and remove old socket mapping
            const oldSocketId = Object.keys(playerGroups).find(id => 
                playerGroups[id] === groupId && id !== newSocket.id
            );
            if (oldSocketId) {
                delete playerGroups[oldSocketId];
                console.log(`Removed old socket mapping: ${oldSocketId}`);
            }
            
            playerGroups[newSocket.id] = groupId;
            console.log(`Updated socket id: ${oldSocketId || 'unknown'} -> ${newSocket.id}`);
        } else {
            console.log(`Game room ${groupId} not found`);
        }
    }

    // remove the user info in the pool when the user disconnect
    const handleDisconnect = function(socket) {
        const socketId = socket.id;
        console.log(`Player ${socketId} disconnected`);
        
        // remove the player from the queue if necessary
        const queuePosition = queue.indexOf(socket);
        if (queuePosition !== -1) {
            queue.splice(queuePosition, 1);
            console.log(`Player ${socketId} disconnect, current queue length: ${queue.length}`);
        }

        // delete the group info if the player already paired
        const targetGroupId = playerGroups[socketId];
        if (targetGroupId) {
            console.log(`Cleaning up group ${targetGroupId} for disconnected player`);
            
            const group = groups[targetGroupId];
            if (group) {
                let opponent = null;
                if (group.player1.id === socketId) {
                    opponent = io.sockets.sockets.get(group.player2.id);
                } else if (group.player2.id === socketId) {
                    opponent = io.sockets.sockets.get(group.player1.id);
                }
                
                if (opponent && opponent.connected) {
                    opponent.emit("opponent disconnect", {
                        message: "Opponent disconnected"
                    });
                    console.log(`Notified opponent ${opponent.id}`);
                }

                if (gameRooms[targetGroupId]) {
                    gameRooms[targetGroupId].cleanup();
                    delete gameRooms[targetGroupId];
                    console.log(`Cleaned up game room ${targetGroupId}`);
                }

                delete groups[targetGroupId];
                delete playerGroups[group.player1.id];
                delete playerGroups[group.player2.id];
                
                console.log(`Cleaned up group ${targetGroupId}`);
            } else {
                console.log(`Group ${targetGroupId} not found`);
            }
        }
        
        console.log(`After disconnect: Queue: ${queue.length}, Active groups: ${Object.keys(groups).length}`);
    };

    const getStatus = function() {
        return {
            queueSize: queue.length,
            activeGroups: Object.keys(groups).length,
            playerGroups: playerGroups
        };
    };

    // return the game room based on the group id
    const getGameRoom = function(groupId){
        return gameRooms[groupId];
    }

    // return the game room of the player
    const getPlayerRoom = function(playerId){
        let groupId = playerGroups[playerId];
        return groupId ? gameRooms[groupId] : null;
    }

    return { 
        handleMatchRequest, 
        matchPlayers,
        handleCancelMatch,
        handleEndGame, 
        handleDisconnect,
        getStatus,
        getGameRoom,
        getPlayerRoom,
        updatePlayerSocket
    };
};

module.exports = matchPool;