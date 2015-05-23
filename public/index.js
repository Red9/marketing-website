(function () {
    console.log('Are you as stoked for surfing tech as we are? Apply now!');

    $('button.goto-signup').on('click', function () {
        // Scroll to the actual signup button.
        $('html,body').animate({
            scrollTop: $(".section.signup").offset().top
        }, 'slow');
    });

    // Set backstretch images this way so that versioning the images can work
    // correctly (or is that easily? It means that the important bits (the
    // layout) is in HTML, not JS. Better.
    $('img.backstretch-placeholder').each(function () {
        var self = $(this);
        console.log('Setting backstretch for ' + self.attr('src'));
        self.parent().backstretch(self.attr('src'));
    });

})();
