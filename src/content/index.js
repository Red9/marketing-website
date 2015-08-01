(function () {
    // Make sure that button return to "default" state after being pressed.
    // http://stackoverflow.com/a/23444942/2557842
    $(".btn").mouseup(function () {
        $(this).blur();
    });

    $('#subscribe-form').submit(function (e) {
        // Switch out the signup form with social media icons.
        // Note that we have to allow the POST to go through since CORS prevents
        // us from submitting via JS AJAX.
        $(this).addClass('hidden');
        $('#subscribe-form-complete').removeClass('hidden');
    });

    // Taken from http://stackoverflow.com/a/17369386/2557842
    $('input').one('blur keydown', function () {
        $(this).addClass('touched');
    });

    function sliderheight() {
        var divHeight = $('.f1 img').height();

        // We run this little trick to get a "dynamic" height, but we have to wait until the images load.
        if (divHeight === 0) {
            console.log('.imagecycle height unknown. Checking again in a bit.');
            setTimeout(sliderheight, 50);
        } else {
            console.log('Setting .imagecycle height to: ' + divHeight);
            $('.imagecycle').css({'height': divHeight});
        }
    }

    sliderheight();
    $(window).resize(sliderheight);

    $('.swipebox-video').swipebox({autoplayVideos: true});

})();
