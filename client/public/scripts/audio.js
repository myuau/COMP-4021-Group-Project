const FrontPageAudio = (function(){
    const playbg = function(){
        const audio = $("#front-bg-music")[0];
        audio.currentTime = 0;
        audio.muted = false;
        audio.loop = true;
        audio.play();
    }

    const stopbg = function(){
        const audio = $("#front-bg-music")[0];
        audio.pause();
        audio.currentTime = 0;
    }

    const playBtnAudio = function(){
        const audio = $("#front-btn-press")[0];
        audio.currentTime = 0;
        audio.play();
    }

    const playCountdownAudio = function(){
        const audio = $("#front-countdown")[0];
        audio.currentTime = 0;
        audio.play();
    } 

    const playCountdownNoticeAudio = function(){
        const audio = $("#front-countdown-timeup")[0];
        audio.currentTime = 0;
        audio.play();
    }

    const playPairupWaitAudio = function(){
        const audio = $("#front-pairup-waiting")[0];
        audio.currentTime = 0;
        audio.muted = false;
        audio.loop = true;
        audio.play();
    }

    const stopPairupWaitAudio = function(){
        const audioElement = document.getElementById("front-pairup-waiting");
        if (audioElement && typeof audioElement.pause === 'function') {
            audioElement.pause();
            audioElement.currentTime = 0;
        }
    }

    return { 
        playbg, 
        stopbg, 
        playBtnAudio, 
        playCountdownAudio, 
        playCountdownNoticeAudio, 
        playPairupWaitAudio, 
        stopPairupWaitAudio 
    };
})();