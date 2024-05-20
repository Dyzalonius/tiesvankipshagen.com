$(document).ready(function () {
    // Add smooth scrolling to all links in navbar + footer link
    $(".navbar-button").on('click', function (event) {
        // Make sure this.hash has a value before overriding default behavior
        if (this.hash !== "") {
            // Prevent default anchor click behavior
            event.preventDefault();

            // Store hash
            var hash = this.hash;

            // Using jQuery's animate() method to add smooth page scroll
            // The optional number (900) specifies the number of milliseconds it takes to scroll to the specified area
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 900);
        }
    });

    $(window).scroll(function () {
        $(".slideanim").each(function () {
            var pos = $(this).offset().top;

            var winTop = $(window).scrollTop();
            if (pos < winTop + 600) {
                $(this).addClass("slide");
            }
        });

        /*var height = $('#game').height(); + $('.common-bar').height();
        var width = $('#game').width();
        if ($(this).scrollTop() > height && width > 1400) {
            $('#navbar').addClass('navbar-fix');
        } else {
            $('#navbar').removeClass('navbar-fix');
        }*/
    });
});
