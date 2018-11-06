$(document).ready(function () {

    $(".galleryItem").click(function () {
        // remove old current
        var galleryWrapper = $(this).parent();
        $(galleryWrapper).children().removeClass("current");

        // set new current
        $(this).addClass("current");

        // set source of display
        var source = $(this).attr("src");
        var itemLeft = $(this).parent().parent();
        var image = itemLeft.find(".galleryDisplay");
        $(image).attr("src", source);
    });
});