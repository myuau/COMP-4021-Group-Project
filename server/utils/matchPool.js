const matchPool = function(io) {
    let queue = []; // waiting queue
    let groups = {}; // current groups
    let groupCount = 0; // number of groups formed
    let playerGroups = {}; // each player's group

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

    const matchPlayers = function() {
        while (queue.length >= 2) {
            let player1 = queue.shift();
            let player2 = queue.shift();

            groupCount++;
            const targetGroupId = groupCount.toString();
            
            player1.join(targetGroupId);
            player2.join(targetGroupId);

            const group = {
                player1: player1.id,
                player2: player2.id,
                createdAt: Date.now()
            };

            groups[targetGroupId] = group;
            
            playerGroups[player1.id] = targetGroupId;
            playerGroups[player2.id] = targetGroupId;

            console.log(`Match Successfully! Group ${targetGroupId}: ${player1.id} vs ${player2.id}`);

            player1.emit("match success", {
                groupId: targetGroupId,
                players: [player1.id, player2.id],
                yourRole: 1
            });

            player2.emit("match success", {
                groupId: targetGroupId,
                players: [player1.id, player2.id],
                yourRole: 2
            });
        }
    };

    const handleCancelMatch = function(socket){
        const queuePosition = queue.indexOf(socket);
        if (queuePosition !== -1) {
            queue.splice(queuePosition, 1);
            console.log(`Player ${socket.id} cancel matching, current queue length: ${queue.length}`);
        }
    }

    const handleEndGame = function(groupId){
        const group = groups[groupId];
        if(group){
            const player1 = io.sockets.sockets.get(group.player1);
            const player2 = io.sockets.sockets.get(group.player2);

            if (player1) player1.leave(groupId);
            if (player2) player2.leave(groupId);

            delete playerGroups[group.player1];
            delete playerGroups[group.player2];
            delete groups[groupId];
            console.log("delete group: ", groupId);
        }
    }

    const handleDisconnect = function(socket) {
        const socketId = socket.id;
        
        const queuePosition = queue.indexOf(socket);
        if (queuePosition !== -1) {
            queue.splice(queuePosition, 1);
            console.log(`Player ${socketId} disconnect, current queue length: ${queue.length}`);
        }

        const targetGroupId = playerGroups[socketId];
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

    return { 
        handleMatchRequest, 
        matchPlayers,
        handleCancelMatch,
        handleEndGame, 
        handleDisconnect,
        getStatus
    };
};

module.exports = matchPool;