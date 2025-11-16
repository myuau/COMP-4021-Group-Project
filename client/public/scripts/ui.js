const FrontPage = (function(){
    const initialize = function(){
        $("#start-btn").show();

        $("#start-btn").click(()=>{
            FrontPageAudio.playBtnAudio();
            $("#front-bg").addClass("front-bg-filter");
            FrontPageAudio.playbg();
            hide();
            LoginForm.show();
        });
    }

    const show = function(){
        $("#start-btn").show();
    }
    
    const hide = function(){
        $("#start-btn").fadeOut(500);
        $("#front-bg.title").fadeOut(500);
    }

    return {initialize, show, hide};
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

        $(".submit-btn.next").click((e) => {
            e.preventDefault();
            FrontPageAudio.playBtnAudio();

            hide();
            PairupPage.show();
        });
    }

    const show = function(){
        $(".front.instruction").fadeIn(500);
    }
    
    const hide = function(){
        $(".front.instruction").fadeOut(500);
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
    let timeCount = 4;

    const initialize = function(){
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
        $("#pairup-bg-filter").hide();
        $(".front.pairup").hide();
    };

    const showFinding = function(){
        $("#pairup-header.finding").fadeIn(500);
        $("#waiting-container").fadeIn(500);

        if(findingTimer){
            clearTimeout(findingTimer);
            findingTimer = null;
        }

        function animateDots() {
            findingCount = findingCount % 3 + 1;
            const dots = ".".repeat(findingCount);
            $("#pairup-header.finding span").text(dots);
            
            findingTimer = setTimeout(animateDots, 1000);
        }

        animateDots();
    }

    const hideFinding = function(){
        $("#pairup-header.finding").hide();
        $("#waiting-container").hide();

        if(findingTimer){
            clearTimeout(findingTimer);
            findingTimer = null;
        }
    }

    const showMatched = function(){
        hideFinding();
        let header = $("#pairup-header");
        if(header.hasClass("finding")){
            header.removeClass("finding");
        }
        header.addClass("match");
        header.text("Match found!<br>Get ready to cook!");
        $("#pairup-header").show();

        setTimeout(hideMatched, 1500)
    }

    const hideMatched = function(){
        $("#front-header.match").fadeOut(500);
    }

    const showCountdown = function(){
        $("#countdown").fadeIn(500);
        function countdown(){
            timeCount--;
            if(timeCount > 0){
                $("#countdown").text(timeCount);
                setTimeout(countdown, 1000);
            }
            else{
                $("#countdown").text("Start!");
                setTimeout(UI.hideFront, 1000);
            }
        }
        countdown();
    }

    return { initialize, show, hide, showFinding, hideFinding, showMatched, showCountdown };
})();

const UI = (function(){
    const frontComponents = [LoginForm, RegisterForm, FrontPage, Toast, InstructionPage, PairupPage];

    const initialize = function() {
        for (const component of frontComponents) {
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