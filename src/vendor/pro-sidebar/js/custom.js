jQuery(function ($) {



    $(".sidebar-dropdown > a").click(function () {
        // $(".sidebar-submenu").slideUp(200);
        if ($(this).parent().hasClass("active")) {
            // $(".sidebar-dropdown").removeClass("active");
            $(this).next(".sidebar-submenu").slideUp(200);
            $(this).parent().removeClass("active");
        } else {
            // $(".sidebar-dropdown").removeClass("active");
            $(this).next(".sidebar-submenu").slideDown(200);
            $(this).parent().addClass("active");
        }

    });

    // slide open onload any active links
    // console.log($(".sidebar-dropdown > a").parent(".active").children(".sidebar-submenu"));
    $(".sidebar-dropdown > a").parent(".active").children(".sidebar-submenu").slideDown(200);

    $("#toggle-sidebar").click(function () {
        $(".page-wrapper").toggleClass("toggled");
    });
    $("#toggle-sidebar2").click(() => {
        $(".page-wrapper").toggleClass("toggled");
    });
    var themes = "chiller-theme ice-theme cool-theme light-theme green-theme spicy-theme purple-theme";
    $('[data-theme]').click(function () {
        $('.page-wrapper').removeClass(themes);
        $('.page-wrapper').addClass($(this).attr('data-theme'));
    });

    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        $(".sidebar-content").mCustomScrollbar({
            axis: "y",
            autoHideScrollbar: true,
            scrollInertia: 300
        });
        $(".sidebar-content").addClass("desktop");

    }
});