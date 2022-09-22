$(document).ready(function () {
    // Check if on mobile
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        $("#navbar").removeClass('navbar-fixed-top');
        return;
    }
});
