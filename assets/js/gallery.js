$(document).ready(function ()
{
    $(".gallery-item").click(function ()
    {
        // exit if already current
        if ($(this).hasClass("current"))
            return;

        // remove old current and set new current
        $(this).parent().children().removeClass("current");
        $(this).addClass("current");

        // set display
        var isVideo = $(this).hasClass("gallery-item-video");
        if (isVideo)
        {
            // video
            var source = $(this).attr("videoSource");
            var gallery = $(this).parent().parent();
            var galleryMain = gallery.find(".featured-gallery-main");
            $(galleryMain).html("<iframe class='gallery-video' allowfullscreen></iframe>");
            var galleryVideo = galleryMain.find(".gallery-video");
            galleryVideo.attr("src", source);
        }
        else
        {
            var isGif = $(this).hasClass("galleryItemGif");
            if (isGif)
            {
                // gif
                var source = $(this).attr("gifSource");
                var gallery = $(this).parent().parent();
                var galleryMain = gallery.find(".featured-gallery-main");
                $(galleryMain).html("<img class='gallery-display' alt='Gif'>");
                var galleryImage = galleryMain.find(".gallery-display");
                $(galleryImage).attr("src", source);
            }
            else
            {
                // image
                var source = $(this).attr("src");
                var gallery = $(this).parent().parent();
                var galleryMain = gallery.find(".featured-gallery-main");
                $(galleryMain).html("<img class='gallery-display' alt='Screenshot'>");
                var galleryImage = galleryMain.find(".gallery-display");
                $(galleryImage).attr("src", source);
            }
        }
    });
});
