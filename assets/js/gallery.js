$(document).ready(function ()
{
    $(".galleryItem").click(function ()
    {
        // exit if already current
        if ($(this).hasClass("current"))
            return;

        // remove old current and set new current
        $(this).parent().children().removeClass("current");
        $(this).addClass("current");

        // set display
        var isVideo = $(this).hasClass("galleryItemVideo");
        if (isVideo)
        {
            // video
            var source = $(this).attr("videoSource");
            var gallery = $(this).parent().parent();
            var galleryMain = gallery.find(".projectGalleryMain");
            $(galleryMain).html("<iframe class='galleryVideo' allowfullscreen></iframe>");
            var galleryVideo = galleryMain.find(".galleryVideo");
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
                var galleryMain = gallery.find(".projectGalleryMain");
                $(galleryMain).html("<img class='galleryDisplay' alt='Gif'>");
                var galleryImage = galleryMain.find(".galleryDisplay");
                $(galleryImage).attr("src", source);
            }
            else
            {
                // image
                var source = $(this).attr("src");
                var gallery = $(this).parent().parent();
                var galleryMain = gallery.find(".projectGalleryMain");
                $(galleryMain).html("<img class='galleryDisplay' alt='Screenshot'>");
                var galleryImage = galleryMain.find(".galleryDisplay");
                $(galleryImage).attr("src", source);
            }
        }
    });
});
