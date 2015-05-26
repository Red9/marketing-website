(function () {
    console.log('Are you as stoked for surfing tech as we are? Apply now!');

    $('button.goto-signup').on('click', function () {
        // Scroll to the actual signup button.
        $('html,body').animate({
            scrollTop: $(".section.signup").offset().top
        }, 'slow');
    });

    // Make sure that button return to "default" state after being pressed.
    // http://stackoverflow.com/a/23444942/2557842
    $(".btn").mouseup(function(){
        $(this).blur();
    });


    // Set backstretch images this way so that versioning the images can work
    // correctly (or is that easily? It means that the important bits (the
    // layout) is in HTML, not JS. Better.
    $('img.backstretch-placeholder').each(function () {
        var self = $(this);
        console.log('Setting backstretch for ' + self.attr('src'));
        self.parent().backstretch(self.attr('src'));
    });

    $('#subscribe-form').submit(function (e) {
        // Switch out the signup form with social media icons.
        // Note that we have to allow the POST to go through since CORS prevents
        // us from submitting via JS AJAX.
        $(this).addClass('hidden');
        $('#subscribe-form-complete').removeClass('hidden');
    });

    new WOW().init();

})();
