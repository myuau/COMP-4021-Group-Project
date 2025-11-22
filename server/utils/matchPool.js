const gameRoom = require("./gameRoom.js");

const matchPool = function(io) {
    let queue = []; // waiting queue (socket of each player)
    let groups = {}; // current groups
    let gameRooms = {}; // game rooms
    let groupCount = 0; // number of groups formed
    let playerGroups = {}; // each player's group

    // check if the user does not match
    const handleMatchRequest = function(socket) {
        if (queue.includes(socket) || playerGroups[socket.id]) {
            socket.emit("match error", {
                isMatched: true,
                message: "already matched"
            });
            return;
        }

        console.log(`Player ${socket.id} queue, current queue length: ${queue.length}`);
        queue.push(socket);
        matchPlayers();
    };

    // match the users
    const matchPlayers = function() {
        while (queue.length >= 2) {
            // get players
            let player1 = queue.shift();
            let player2 = queue.shift();

            // assign group id
            groupCount++;
            const targetGroupId = groupCount.toString();

            // create game room
            let room = gameRoom(targetGroupId, player1, player2, io);
            gameRooms[targetGroupId] = room;

            // record group info
            const group = {
                player1: player1.request.session.user,
                player2: player2.request.session.user,
                createdAt: Date.now(),
                room: room
            };

            groups[targetGroupId] = group;
            
            playerGroups[player1.request.session.user] = targetGroupId;
            playerGroups[player2.request.session.user] = targetGroupId;

            console.log(`Match Successfully! Group ${targetGroupId}: ${player1.request.session.user} vs ${player2.request.session.user}`);

            // emit signal
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
        }
    };

    // if the user cancel matching, then remove it from the queue
    const handleCancelMatch = function(socket){
        const queuePosition = queue.indexOf(socket);
        if (queuePosition !== -1) {
            queue.splice(queuePosition, 1);
            console.log(`Player ${socket.id} cancel matching, current queue length: ${queue.length}`);
        }
    }

    // clean the pair when the game ends
    const handleEndGame = function(groupId){
        const group = groups[groupId];
        if(group){
            // players leave the group
            const player1 = io.sockets.sockets.get(group.player1);
            const player2 = io.sockets.sockets.get(group.player2);

            if (player1) player1.leave(groupId);
            if (player2) player2.leave(groupId);

            // delete group info
            delete playerGroups[group.player1];
            delete playerGroups[group.player2];
            delete groups[groupId];
            console.log("delete group: ", groupId);
        }
    }

    // remove the user info in the pool when the user disconnect
    const handleDisconnect = function(socket) {
        const socketId = socket.id;
        
        // remove the player from the queue if neccessary
        const queuePosition = queue.indexOf(socket);
        if (queuePosition !== -1) {
            queue.splice(queuePosition, 1);
            console.log(`Player ${socketId} disconnect, current queue length: ${queue.length}`);
        }

        // delete the group info if the player already paired
        const targetGroupId = playerGroups[socketId];
        if (targetGroupId && gameRooms[targetGroupId]) {
            gameRooms[targetGroupId].cleanup();
            delete gameRooms[targetGroupId];
        }
        
        if (targetGroupId) {
            const targetGroup = groups[targetGroupId];
            if (targetGroup) {
                const opponentId = socketId === targetGroup.player1 ? targetGroup.player2 : targetGroup.player1;
                
                if (opponentId) {
                    io.to(opponentId).emit("opponent disconnect", {
                        message: "opponent disconnects"
                    });
                    console.log(`notify player ${opponentId}: opponent disconnect`);
                }

                delete groups[targetGroupId];
                delete playerGroups[targetGroup.player1];
                delete playerGroups[targetGroup.player2];
                
                console.log(`clear group ${targetGroupId}`);
            }
        }
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
        getPlayerRoom
    };
};

module.exports = matchPool;