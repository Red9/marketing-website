var Red9 = {
    scrollAmount: $('body').scrollTop()
    ,
    IS_MOBILE: /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test((navigator.userAgent || navigator.vendor || window.opera)) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test((navigator.userAgent || navigator.vendor || window.opera).substr(0, 4))

    ,
    init: function () {
        $('.link.privacypolicy, .link.about').on('click', Red9.showMenuItem);
        $('.tagline.mobile').on('touchend', function () {
            $(this).hide();
            $('.blurb p, .tagline.desktop').fadeIn();
        });

        $('input').on('change', function () {
            $(this).css('border', '0');
        });

        $('form').on('submit', Red9.sendData);

        $(document).on('click', '.sign-up-link', function () {
            $('body,html').animate({scrollTop: 0}, 420).promise().done(function () {
                $('header :input:first').focus();
            })

        });
        Red9.showMenuItem('about');
        Red9.initVideo();
        Red9.setAboutImageSize();
    }

    ,
    initVideo: function () {
        var iframe = $('.vimeo-player')[0];
        var player = $f(iframe);

        player.addEvent('ready', function () {
            player.addEvent('finish', function onFinish() {
                $('.scroll-indicator').removeClass('runonce').addClass('animate');
                // $('body, html').animate({scrollTop: $('header').offset().top});
            });
        });


        $('.scroll-indicator').on('click', function () {
            $('body, html').animate({scrollTop: $('header').offset().top});
        })

        Red9.setAboutImageSize();
        if (!Red9.IS_MOBILE) {
            Red9.parallax();
            $(document).on('scroll', Red9.parallax);
        } else {
            $('.scroll-indicator').remove();
            $('.embed-container').insertAfter('header .blurb-wrapper');
        }

        $(window).on('resize', Red9.setAboutImageSize);
    }

    ,
    setAboutImageSize: function () {
        if (window.matchMedia && window.matchMedia("(min-width: 737px)").matches) {
            $('.pagelet.about').css('height', $(document).outerWidth() / 2);
        }
    }

    ,
    parallax: function (e) {
        var scrollTop = $(document).scrollTop() / 3;
        var scaleRate = 3333;
        // console.log('translate3d(0px, -' + scrollTop + ', 0px) scale(' + (1 - scrollTop/scaleRate) + ')');
        //$('.embed-container').css('transform', 'translate3d(0px, -' + (scrollTop*.25) + 'px, 0px)');
        // $('.main-wrapper').css('transform', 'translate3d(0px, -' + scrollTop + 'px, 0px)');
        //$('footer, .pagelet').css({'position': 'relative', 'top': '-' + (scrollTop*.13333) + 'px'});
        $('.pagelet.about').css({'background-position': '50% -' + scrollTop + 'px'});
    }

    ,
    showMenuItem: function (selected) { // TODO use React for this...
        var linkName = typeof selected === "string" ? selected : this.className.replace('link ', '');
        $.ajax({
            url: linkName + '.html',
            cache: false
        }).done(function (data) {
            var $content = $('.' + linkName + '.pagelet');
            $content.html(data);

            (selected.type === 'click') && setTimeout(function () {
                $('html, body').animate({scrollTop: $('footer').offset().top - 10}, 300);
            }, 500);
            $('body').removeClass('about privacypolicy showing-menu-item').addClass('showing-menu-item ' + linkName);
        });

        return false;
    }

    ,
    sendData: function () {
        $.ajax({
            type: 'POST',
            url: '/register',
            data: $('form').serialize()
        }).done(function () {
            $('button').prop('disabled', true).text('Thank you!').css('font-size', '1.4em');
            $('label, input').slideUp();
            setTimeout(function () {
                $('button').fadeOut();
            }, 1000);

        }).fail(function (data) {
            $('input').css('border', 'solid 1px tomato');
            $('button').text('Try Again Please')
            setTimeout(function () {
                $('button').text('Send!');
            }, 3000);
        });

        return false;
    }
};

Red9.init();