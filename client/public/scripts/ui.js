const FrontPage = (function(){
    const initialize = function(){
        $("#start-btn").show();

        $("#start-btn").click(()=>{
            FrontPageAudio.playBtnAudio();
            $("#front-bg").addClass("front-bg-filter");
            FrontPageAudio.playbg();
            hideTitle();
            LoginForm.show();
        });
    }

    const show = function(){
        $("#front-bg").removeClass("front-bg-filter");
        $("#start-btn").show();
        $("#front-bg.title").fadeIn(500);
    }
    
    const hideTitle = function(){
        $("#front-bg.title").fadeOut(500);
        $("#start-btn").fadeOut(500);
    }

    const hide = function(){
        $("#start-btn").hide();
        $(".bg-container").hide();
    }

    const showbg = function(){
        $(".bg-container").show();
        $("#front-bg").addClass("front-bg-filter");
        hideTitle();
    }

    return {initialize, show, hideTitle, hide, showbg};
})();

const LoginForm = (function(){
    const initialize = function(){
        $(".front.login").hide();

        $("#signin-form").on("submit", (e)=>{
            e.preventDefault();
            FrontPageAudio.playBtnAudio();

            const username = $("#signin-username").val().trim();
            const password = $("#signin-password").val().trim();

            if(!username || !password){
                Toast.show("Please fill in the username and password.", "warning", 2000);
                return;
            }

            Authentication.signin(username, password,
                () => {
                    Toast.show("Login Successfully!", "success", 2000);
                    hide();
                    InstructionPage.show();
                },
                (error) => { Toast.show(error, "error", 2000); }
            );
        })

        $("#to-register").click((e)=>{
            e.preventDefault();
            FrontPageAudio.playBtnAudio();

            hide();
            RegisterForm.show();
        })
    }

    const show = function(){
        $(".front.login").fadeIn(500);
    }

    const hide = function(){
        $("#signin-form").get(0).reset();
        $(".front.login").fadeOut(500);
    }

    return {initialize, show, hide};
})();

const RegisterForm = (function(){
    const initialize = function(){
        $(".front.register").hide();

        $("#register-form").on("submit", (e)=>{
            e.preventDefault();
            FrontPageAudio.playBtnAudio();

            const username = $("#register-username").val().trim();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm-password").val().trim();
    
            if(password !== confirmPassword){
                Toast.show("The password and the confirmed password does not match. Please try again.", "warning", 2000);
                return;
            }    

            Registration.register(username, password,
                () => {
                    $("#register-form").get(0).reset();
                    Toast.show("Register Successfully! You can return to the login page.", "success", 2000);
                },
                (error) => { 
                    Toast.show(error, "error", 2000); }
            );
        })

        $("#to-login").click((e)=>{
            e.preventDefault();
            FrontPageAudio.playBtnAudio();

            hide();
            LoginForm.show();
        })
    };

    const show = function(){
        $(".front.register").fadeIn(500);
    }

    const hide = function(){
        $("#register-form").get(0).reset();
        $(".front.register").fadeOut(500);
    }

    return {initialize, show, hide};
})();

const InstructionPage = (function(){
    const initialize = function(){
        $(".front.instruction").hide();

        $(".signout-btn.instruction").click((e) => {
            e.preventDefault();

            Authentication.signout();
            UI.initialize();
            FrontPage.show();
            FrontPageAudio.stopbg();
        });

        $(".submit-btn.next").click((e) => {
            e.preventDefault();
            e.stopPropagation();

            FrontPageAudio.playBtnAudio();
            FrontPageAudio.stopbg();

            hide();
            PairupPage.show();
        });

        $(".signout-container.instruction").hide();
    }

    const show = function(){
        $(".front.instruction").fadeIn(500);
        $(".signout-container.instruction").fadeIn(500);
    }
    
    const hide = function(){
        $(".front.instruction").fadeOut(500);
        $(".signout-container.instruction").fadeOut(500);
    }

    return {initialize, show, hide};
})();

const Toast = (function(){
    const initialize = function(){
        $("#toast").hide();
    }

    const show = function(message, type = "info", duration = 3000){
        $("#toast").removeClass("success error warning info");
        $("#toast").text(message);
        $("#toast").addClass(type);
        $("#toast").show().css('top', '-100px').animate({top: '20px'}, 300);

        setTimeout(()=>{
            hide();
        }, duration);
    }

    const hide = function(){
        $("#toast").animate({top: '-100px'}, 300, function() {
            $(this).hide();
        });
    }

    return {initialize, show, hide};
})();

const PairupPage = (function(){
    let findingTimer;
    let findingCount = 0;
    let speechTimer;
    let timeCount = 4;
    let isFinding = false;
    let speechCount = 0;
    let speech = [
        "The key to victory is speed! If you can gather all the ingredients as quickly as possible, you'll be able to complete more orders and truly excel!",
        "Picking up the right ingredients will truly save you precious time in completing each order! But keep in mind, you can only select up to 4 items—so choose wisely and give it your best shot!",
        "Be mindful of the obstacles that may stand in your way to obtaining the ingredient; they could really slow you down. Thinking ahead and planning carefully will genuinely help you save time and ensure you can complete your orders smoothly."
    ]

    const initialize = function(){
        $("#cancel-match").click((e) => {
            e.preventDefault();
            FrontPageAudio.playBtnAudio();

            if (isFinding) {
                cancelFinding();
            }
        });

        $("#pairup-bg-filter").hide();
        $(".front.pairup").hide();
        $("#waiting-container").hide();
    };

    const show = function(){
        $("#pairup-bg-filter").fadeIn(500);
        $(".front.pairup").show();
        showFinding();
    };

    const hide = function(){
        if (isFinding) {
            cancelFinding();
        }
        $("#pairup-bg-filter").hide();
        $(".front.pairup").hide();
        $("#waiting-container").hide();
    };

    const showFinding = function(){
        isFinding = true;
        $("#pairup-header.finding").fadeIn(500);
        $("#waiting-container").fadeIn(500);
        $("#cancel-match").show();

        FrontPageAudio.stopPairupWaitAudio();
        FrontPageAudio.playPairupWaitAudio();

        Socket.connect();
        window.globalSocket = Socket.getSocket();

        if(findingTimer){
            clearTimeout(findingTimer);
            findingTimer = null;
        }

        if(speechTimer){
            clearTimeout(speechTimer);
            speechTimer = null;
        }

        function animateDots() {
            if (!isFinding) return;
            
            findingCount = findingCount % 3 + 1;
            const dots = ".".repeat(findingCount);
            $("#pairup-header.finding span").text(dots);
            
            findingTimer = setTimeout(animateDots, 1000);
        }

        function switchSpeech() {
            if (!isFinding) return;
            
            speechCount = (speechCount + 1) % speech.length;
            $(".chat-bubble").text(speech[speechCount]);

            speechTimer = setTimeout(switchSpeech, 10000);
        }

        animateDots();
        switchSpeech();
    }

    const cancelFinding = function() {
        isFinding = false;
        Socket.cancelMatch();
        Socket.disconnect();
        
        if(findingTimer){
            clearTimeout(findingTimer);
            findingTimer = null;
        }

        if(speechTimer){
            clearTimeout(speechTimer);
            speechTimer = null;
        }

        FrontPageAudio.stopPairupWaitAudio();
        hide();
        InstructionPage.show();
        FrontPageAudio.playbg();
    }

    const hideFinding = function(){
        isFinding = false;
        $("#pairup-header.finding").hide();
        $("#waiting-container").hide();
        $("#cancel-match").hide();

        FrontPageAudio.stopPairupWaitAudio();

        if(findingTimer){
            clearTimeout(findingTimer);
            findingTimer = null;
        }

        if(speechTimer){
            clearTimeout(speechTimer);
            speechTimer = null;
        }
    }

    const showMatched = function(){
        isFinding = false;
        hideFinding();
        
        let header = $("#pairup-header");
        if(header.hasClass("finding")){
            header.removeClass("finding");
        }
        header.addClass("match");
        header.html("Match found!<br>Get ready to cook!");
        $("#pairup-header").show();

        setTimeout(hideMatched, 1500);
    }

    const hideMatched = function(){
        $("#pairup-header.match").fadeOut(500, () => {
            showCountdown();
        });
    }

        const showCountdown = function(){
            hideFinding();
            $("#countdown").fadeIn(500);
            timeCount = 4;
        
            function countdown(){
                timeCount--;
                if(timeCount > 0){
                    $("#countdown").text(timeCount);
                    FrontPageAudio.playCountdownAudio();
                    setTimeout(countdown, 1000);
                }
                else{
                    $("#countdown").text("Start!");
                    FrontPageAudio.playCountdownNoticeAudio();
                    setTimeout(() => {
                        UI.hideFront();
                        Socket.sendGameField({
                            top: 60,
                            bottom: 400,
                            left: 40,
                            right: 700
                        });
                        GamePage.show();
                    }, 1000);
                }
            }
            setTimeout(countdown, 500);
    }

    return { initialize, show, hide, showFinding, hideFinding, showMatched, showCountdown };
})();

const RankingPage = (function(){
    const initialize = function(){
        $("#pairup-bg-filter").hide();
        $(".signout-btn.ranking").click((e) => {
            e.preventDefault();
            FrontPageAudio.playBtnAudio();

            Socket.endGame();
            Socket.disconnect();
            Authentication.signout();
            location.reload();
        });

        $("#new-game").click((e) => {
            e.preventDefault();
            FrontPageAudio.playBtnAudio();

            Socket.endGame();
            hide();
            location.reload();
        })

        $(".signout-container.ranking").hide();
        $(".front.ranking").hide();
    };

    const setRanking = function(ranking, isTie){
        if(isTie){
            $("#ranking-table").append(`<tr>
                <td class="ranking">${ranking[0].rank}</td>
                <td class="ranking-username">${ranking[0].username}</td>
                <td class="score">${ranking[0].score}</td>
            </tr>
            <tr>
                <td class="ranking">-</td>
                <td class="ranking-username">${ranking[1].username}</td>
                <td class="score">${ranking[1].score}</td>
            </tr>`)
        } else{
            for (let i = 0; i < ranking.length; i++){
                $("#ranking-table").append(`<tr>
                    <td class="ranking">${ranking[i].rank}</td>
                    <td class="ranking-username">${ranking[i].username}</td>
                    <td class="score">${ranking[i].score}</td>
                </tr>`)
            }
        }
    }

    const show = function(){
        $("#pairup-bg-filter").css({"z-index": 999});
        $("#pairup-bg-filter").fadeIn(500);
        $(".signout-container.ranking").fadeIn(500);
        $(".front.ranking").fadeIn(500);
    }

    const hide = function(){
        $("#pairup-bg-filter").css({"z-index": 0});
        $(".signout-container").hide();
        $(".front.ranking").hide();
    };

    return { initialize, setRanking, show, hide };
})();

const GamePage = (function(){
    let ready = false;
    let totalGameTime = 150;
    let cv, context, gameArea, STATIC_BOUNDARIES_AS_BOXES, banana, cvc, contextc, characterArea;
    let playerAttributes = [];
    let playerAttribute = null;
    let opponentAttribute = null;
    let player, opponent;
    let balance = 0;
    let isModifyingOrders = false;
    let gameIntervalId;
    let gameStartTime = 0;
    let sounds;
    let bgm;

    const initialize = function(){
        $("#game-container").hide();
        hide();
    };

    const show = function(){
        initializeGame();
        $("#game-container").fadeIn(500);
    };

    const hide = function(){
        $("#game-container").hide();
    };

    const initializeGame = function(){
        cv = $('canvas').get(0);
        context = cv.getContext('2d');
        gameArea = BoundingBox(context, 60, 40, 400, 760);
        STATIC_BOUNDARIES_AS_BOXES = STATIC_CABINET_BOUNDARIES.map(boundary => {
            return {
                id: boundary.id,
                box: BoundingBox(
                    context,
                    boundary.top,
                    boundary.left,
                    boundary.bottom,
                    boundary.right
                )
            }
        });

        const dir_map = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        sounds = {
            background: new Audio("/assets/audio/front-bg-music.mp3"),
            complete: new Audio("/assets/audio/order-complete.mp3"),
        };
        Socket.setSounds(sounds);

        cvc = $('canvas').get(1);
        contextc = cvc.getContext('2d');
        characterArea = BoundingBox(contextc, 60, 40, 400, 760);

        banana = obstacle(contextc, 427, 350);
        banana.setSrc('assets/img/banana.png');

        player = Player(contextc, 350, 240, characterArea);
        opponent = Player(contextc, 500, 240, characterArea);
        Socket.setPlayer(player);
        Socket.setOpponent(opponent);
        player.setBoxes(STATIC_BOUNDARIES_AS_BOXES);
        opponent.setBoxes(STATIC_BOUNDARIES_AS_BOXES);

        const MyId = Socket.getRole();

        if (MyId === 1) {
            player.setSpriteSheet("assets/img/sprite-sheet-blue.png");
            player.setXY(400, 240);
            opponent.setSpriteSheet("assets/img/sprite-sheet-green.png");
            opponent.setXY(500, 240);

            playerAttributes = [
                {
                    name: "player",
                    orderlistElement: "order1-list",
                    list: OrderList1,
                    bag: player1Bag,
                    bagId: "held-food-group1",
                    balanceId: "balance1"
                },
                {
                    name: "opponent",
                    orderlistElement: "order2-list",
                    list: OrderList2,
                    bag: player2Bag,
                    bagId: "held-food-group2",
                    balanceId: "balance2"
                }
            ]
        } else {
            player.setSpriteSheet("assets/img/sprite-sheet-green.png");
            player.setXY(500, 240);
            opponent.setSpriteSheet("assets/img/sprite-sheet-blue.png");
            opponent.setXY(400, 240);

            playerAttributes = [
                {
                    name: "opponent",
                    orderlistElement: "order1-list",
                    list: OrderList1,
                    bag: player1Bag,
                    bagId: "held-food-group1",
                    balanceId: "balance1"
                },
                {
                    name: "player",
                    orderlistElement: "order2-list",
                    list: OrderList2,
                    bag: player2Bag,
                    bagId: "held-food-group2",
                    balanceId: "balance2"
                }
            ]
        }
        
        updateBags(playerAttributes);
        updateOrderLists(playerAttributes);
        playerAttribute = playerAttributes.find(attr => attr.name === 'player');
        opponentAttribute = playerAttributes.find(attr => attr.name === 'opponent');
        Socket.setPlayerAttribute(playerAttribute);
        Socket.setOpponentAttribute(opponentAttribute);
        Socket.setBanana(banana);

        FrontPageAudio.playbg();

        setInterval(checkBanana, 500);
        requestAnimationFrame(doFrame);

        $(document).on("keydown", function (event) {
            dir = dir_map[event.keyCode];
            let eventKeyCode = event.keyCode;
            if (eventKeyCode === 37) {
                player.move(1);
                Socket.playerMove(true, 1);
            } else if (eventKeyCode === 38) {
                player.move(2);
                Socket.playerMove(true, 2);
            } else if (eventKeyCode === 39) {
                player.move(3);
                Socket.playerMove(true, 3);
            } else if (eventKeyCode === 40) {
                player.move(4);
                Socket.playerMove(true, 4);
            } else if (eventKeyCode === 32) {
                player.speedUp();
                Socket.playerSpeedup(true);
            }
        });
        
        $(document).on("keyup", function (event) {
            let eventKeyCode = event.keyCode;
            if (eventKeyCode === 37) {
                player.stop(1);
                Socket.playerMove(false, 1);
            } else if (eventKeyCode === 38) {
                player.stop(2);
                Socket.playerMove(false, 2);
            } else if (eventKeyCode === 39) {
                player.stop(3);
                Socket.playerMove(false, 3);
            } else if (eventKeyCode === 40) {
                player.stop(4);
                Socket.playerMove(false, 4);
            } else if (eventKeyCode === 32) {
                player.slowDown();
                Socket.playerSpeedup(false);
            }
        });

        const cabinetBoundingBoxes = getAllCabinetBoundingBoxes();
        $(document).on("keydown", function (event) {
            let eventKeyCode = event.keyCode;
            if (eventKeyCode === 69) {
                let playerBoudingBox = player.getBoundingBox();
                const left = playerBoudingBox.getLeft() + 12;
                const top = playerBoudingBox.getTop();
                if (STATIC_BOUNDARIES_AS_BOXES[4].box.isPointInBox(left, top)) {
                    discardIngredient();
                }

                const right = playerBoudingBox.getRight() - 12;
                const bottom = playerBoudingBox.getBottom();

                STATIC_BOUNDARIES_AS_BOXES.forEach((cabinetBox) => {
                    if (cabinetBox.id != 'trash-bin' && cabinetBox.id != 'cashier-counter') {
                        if (cabinetBox.box.isPointInBox(left, top) || cabinetBox.box.isPointInBox(right, bottom))
                            collectIngredient(CABINET_INGREDIENT_MAP[cabinetBox.id]);
                    } else if (cabinetBox.id == 'cashier-counter') {
                        if (cabinetBox.box.isPointInBox(right, bottom)) {
                            const completeOrder = checkComplete(playerAttribute.bag, playerAttribute.list);
                            if (completeOrder) {
                                sounds.complete.pause();
                                sounds.complete.currentTime = 0;
                                sounds.complete.play();
                                console.log("Order completed:", completeOrder);
                                removeOrderFromList(completeOrder,  playerAttribute.list);
                                Socket.updateOrders(playerAttribute.list);
                                while (playerAttribute.bag.length > 0) {
                                    playerAttribute.bag.shift();
                                }
                                Socket.updatePlayerBag(playerAttribute.bag);
                                balance += completeOrder.price;
                                const playerCash = document.getElementById(playerAttribute.balanceId);
                                playerCash.textContent = balance;
                                Socket.updateScore(balance);
                                Socket.playerCompleteOrder();
                            }
                        }
                    }
                });
            }
        });

        checkEmptyList();
        gameIntervalId = requestAnimationFrame(gameTick);

        if(!ready){
            Socket.playerReady();
            ready = true;
        }
    };

    function doFrame(now) {
        if (gameStartTime == 0) {
            gameStartTime = now;
        }

        let gameTimeSoFar = now - gameStartTime;
        let timeRemaining = Math.ceil((totalGameTime * 1000 - gameTimeSoFar) / 1000);

        if (timeRemaining <= 0) {
            return;
        }

        player.update(now);
        opponent.update(now);
        contextc.clearRect(0, 0, cvc.width, cvc.height);
        banana.draw();
        player.draw();
        opponent.draw();

        requestAnimationFrame(doFrame);
    }

    function checkBanana() {
        let playerBbox = {
            top: player.getBoundingBox().getTop(),
            left: player.getBoundingBox().getLeft(),
            bottom: player.getBoundingBox().getBottom(),
            right: player.getBoundingBox().getRight()
        };
        let bananaBbox = banana.getBoundingBox();

        if (overlap(playerBbox, bananaBbox)) {
            Socket.PlayerTrap();
            if (playerAttribute.bag.length > 0) {
                playerAttribute.bag.shift();
                Socket.updatePlayerBag(playerAttribute.bag);
            } else {
                balance -= 5;
                const playerCash = document.getElementById(playerAttribute.balanceId);
                playerCash.textContent = balance;
                Socket.updateScore(balance);
            }
        }
    }

    const gameOver = function() {
        if (gameIntervalId) {
            cancelAnimationFrame(gameIntervalId);
        }
        
        if (sounds) {
            sounds.complete.pause();
        }
        
        $(document).off("keydown.game");
        $(document).off("keyup.game");
        
        player.stop(1);
        player.stop(2);
        player.stop(3);
        player.stop(4);
        player.slowDown();
        
        opponent.stop(1);
        opponent.stop(2);
        opponent.stop(3);
        opponent.stop(4);
        opponent.slowDown();
        
        console.log("Game Over - All actions stopped");
    };

    return { initialize, show, hide, initializeGame, gameOver };
})();

const UI = (function(){
    const frontComponents = [LoginForm, RegisterForm, FrontPage, Toast, InstructionPage, PairupPage, GamePage, RankingPage];

    const initialize = function() {
        for (const component of frontComponents) {
            component.initialize();
        }
    };

    const hideFront = function(){
        for(const component of frontComponents){
            if(component !== GamePage && component !== RankingPage){
                component.hide();
            }
        }
    }

    return { initialize, hideFront };
})();