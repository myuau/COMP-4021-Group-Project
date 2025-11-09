const FrontPage = (function(){
    const initialize = function(){
        $("#start-btn").show();

        $("#start-btn").click(()=>{
            $("#front-bg").addClass("front-bg-filter");
            hide();
            LoginForm.show();
        });
    }

    const show = function(){
        $("#start-btn").show();
    }
    
    const hide = function(){
        $("#start-btn").fadeOut(500);
    }

    return {initialize, show, hide};
})();

const LoginForm = (function(){
    const initialize = function(){
        $(".front.login").hide();

        $("#signin-form").on("submit", (e)=>{
            e.preventDefault();

            const username = $("#signin-username").val().trim();
            const password = $("#signin-password").val().trim();

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

            Registration.register(username, password,
                () => {
                    $("#register-form").get(0).reset();
                    Toast.show("Register Successfully! You can return to the login page.", "success", 2000);
                },
                (error) => { Toast.show(error, "error", 2000); }
            );
        })

        $("#to-login").click((e)=>{
            e.preventDefault();

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

const UI = (function(){
    const components = [LoginForm, RegisterForm, FrontPage, Toast, InstructionPage];

    const initialize = function() {
        for (const component of components) {
            component.initialize();
        }
    };

    return { initialize };
})();