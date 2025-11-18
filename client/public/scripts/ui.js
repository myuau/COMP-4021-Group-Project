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
        $("#start-btn").fadeOut(500);
        $("#front-bg.title").fadeOut(500);
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
                    location.replace("/play-page.html");
                }, 1000);
            }
        }
        setTimeout(countdown, 500);
    }

    return { initialize, show, hide, showFinding, hideFinding, showMatched, showCountdown };
})();

const RankingPage = (function(){
    const initialize = function(){
        $(".signout-btn.ranking").click((e) => {
            e.preventDefault();

            Socket.endGame();
            Socket.disconnect();
            Authentication.signout();
            UI.initialize();
        });

        $("#new-game").click(() => {
            Socket.endGame();
            hide();
            InstructionPage.show();
        })

        $(".signout-container.ranking").hide();
        $(".front.ranking").hide();
    };

    const show = function(){
        $(".signout-container.ranking").fadeIn(500);
        $(".front.ranking").fadeIn(500);
    }

    const hide = function(){
        $(".signout-container").hide();
        $(".front.ranking").hide();
    };

    return { initialize, show, hide };
})();

const UI = (function(){
    const frontComponents = [LoginForm, RegisterForm, FrontPage, Toast, InstructionPage, PairupPage];
    const gameComponents = [RankingPage];

    const initialize = function() {
        for (const component of frontComponents) {
            component.initialize();
        }

        for(const component of gameComponents){
            component.initialize();
        }
    };

    const hideFront = function(){
        for(const component of frontComponents){
            component.hide();
        }
    }

    return { initialize, hideFront };
})();