const FrontPageAudio = (function(){
    const playbg = function(){
        const audio = $("#front-bg-music")[0];
        audio.muted = false;
        audio.loop = true;
        audio.play();
    }

    const stopbg = function(){
        const audio = $("#front-bg-music")[0];
        audio.muted = true;
        audio.loop = false;
        audio.pause();
    }

    const playBtnAudio = function(){
        const audio = $("#front-btn-press")[0];
        audio.loop = false;
        audio.play();
    }

    return { playbg, stopbg, playBtnAudio };
})();