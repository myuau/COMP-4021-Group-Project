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

        socket.on("match success", (group) => {
            groupId = group.groupId;
            PairupPage.showMatched();
        });
    };

    const disconnect = function() {
        socket.disconnect();
        socket = null;
    };

    return { getSocket, connect, disconnect };
})();
