$(document).ready(function () {

    $(".galleryItem").click(function () {
        var source = $(this).attr('src');
        var itemLeft = $(this).parent().parent();
        var image = itemLeft.find('.galleryDisplay');

        $(image).attr("src", source);
    });
});