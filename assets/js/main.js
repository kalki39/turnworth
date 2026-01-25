(function ($) {
  "use strict";

    // Load components
    // Load components
    var componentsToLoad = 0;
    var loadedComponents = 0;

    function checkInit() {
        loadedComponents++;
        if (loadedComponents === componentsToLoad) {
            initializeSite();
        }
    }

    var headerPlaceholder = $('#header-placeholder');
    var mobileMenuPlaceholder = $('#mobile-menu-placeholder');
    var footerPlaceholder = $('#footer-placeholder');

    if (headerPlaceholder.length) {
        componentsToLoad++;
        var layout = headerPlaceholder.data('layout') || 1;
        headerPlaceholder.load('components/header-v' + layout + '.html', checkInit);
    }

    if (mobileMenuPlaceholder.length) {
        componentsToLoad++;
        mobileMenuPlaceholder.load('components/mobile-menu.html', checkInit);
    }

    if (footerPlaceholder.length) {
        // Footer doesn't need to block init strictly, but for consistency we can include it or just load it
        // If we want it to verify existence:
        footerPlaceholder.load('components/footer.html');
        // Note: I'm not adding footer to componentsToLoad to avoid blocking site init if footer is slow/optional,
        // or we can add it. Previous code didn't wait for footer. Let's keep it non-blocking.
    }

    if (componentsToLoad === 0) {
        initializeSite();
    }

    // Desktop Menu Click Support (using event delegation for dynamically loaded content)
    // This must be outside initializeSite() to ensure it's only attached once
    $(document).on('click', '.main-menu a, .main-menu3 a', function(e) {
        var $link = $(this);
        var $parent = $link.parent();
        var href = $link.attr('href');
        
        // ONLY handle parent menu items with placeholder hrefs (#, #!, empty)
        if ($parent.hasClass('menu-item-has-children') && (href === '#' || href === '#!' || href === '' || !href)) {
            e.preventDefault();
            
            var $submenu = $link.siblings('ul.sub-menu');
            if ($submenu.length) {
                $submenu.toggleClass('js-open');
                $submenu.stop(true, true).slideToggle(300);
            }
            return false;
        }
        
        // For real links - explicitly navigate
        if (href && href !== '#' && href !== '#!' && href !== '') {
            window.location.href = href;
            return false;
        }
    });

  // Function to initialize all the site scripts
  function initializeSite() {
    setActiveMenu();

    /*---------- Set Active Menu  ----------*/
    function setActiveMenu() {
        var path = window.location.pathname;
        var page = path.split("/").pop();
        if (page === "" || page === "index.html" || page === "index") {
            page = "index.html";
        }

        // Remove existing active classes from menu links
        $('.main-menu li a, .global-mobile-menu li a, .main-menu3 li a').removeClass('active');

        // Allow multiple matches
        var selector = '.main-menu li a[href="' + page + '"], .global-mobile-menu li a[href="' + page + '"], .main-menu3 li a[href="' + page + '"]';
        var $link = $(selector);

        $link.addClass('active');

        // Add active class to parent dropdowns
        $link.closest('.menu-item-has-children').children('a').addClass('active');
        $link.closest('.menu-item-has-children').parents('.menu-item-has-children').children('a').addClass('active');
    }

    /*---------- Mobile Menu  ----------*/
    $.fn.globalmobilemenu = function (options) {
      var opt = $.extend(
        {
          menuToggleBtn: ".global-menu-toggle",
          bodyToggleClass: "global-body-visible",
          subMenuClass: "global-submenu",
          subMenuParent: "menu-item-has-children",
          globalSubMenuParent: "menu-item-has-children",
          subMenuParentToggle: "global-active",
          meanExpandClass: "global-mean-expand",
          appendElement: '<span class="global-mean-expand"></span>',
          subMenuToggleClass: "global-open",
          toggleSpeed: 400,
        },
        options
      );

      return this.each(function () {
        var menu = $(this); // Select menu

        // Menu Show & Hide
        function menuToggle() {
          menu.toggleClass(opt.bodyToggleClass);

          // collapse submenu on menu hide or show
          var subMenu = "." + opt.subMenuClass;
          $(subMenu).each(function () {
            if ($(this).hasClass(opt.subMenuToggleClass)) {
              $(this).removeClass(opt.subMenuToggleClass);
              $(this).css("display", "none");
              $(this).parent().removeClass(opt.subMenuParentToggle);
            }
          });
        }

        // Class Set Up for every submenu
        menu.find("." + opt.subMenuParent).each(function () {
          var submenu = $(this).find("ul");
          submenu.addClass(opt.subMenuClass);
          submenu.css("display", "none");
          $(this).addClass(opt.subMenuParent);
          $(this).addClass(opt.globalSubMenuParent); // Add menu-item-has-children class
          $(this).children("a").append(opt.appendElement);
        });

        // Toggle Submenu
        function toggleDropDown($element) {
          var submenu = $element.children("ul");
          if (submenu.length > 0) {
            $element.toggleClass(opt.subMenuParentToggle);
            submenu.slideToggle(opt.toggleSpeed);
            submenu.toggleClass(opt.subMenuToggleClass);
          }
        }

        // Submenu toggle Button
        var itemHasChildren = "." + opt.globalSubMenuParent;
        $(itemHasChildren).off("click").on("click", function (e) {
            if ($(e.target).closest("." + opt.subMenuClass).length > 0) {
                return;
            }
            e.preventDefault();
            toggleDropDown($(this));
        });

        // Menu Show & Hide On Toggle Btn click
        $(opt.menuToggleBtn).off("click").on("click", function () {
          menuToggle();
        });

        // Hide Menu On outside click
        menu.on("click", function (e) {
          e.stopPropagation();
          menuToggle();
        });


        // Stop Hide full menu on menu click
        menu.on("click", function (e) {
          e.stopPropagation();
        });

        // Prevent submenu from hiding when clicking inside the menu
        menu.find("div").on("click", function (e) {
          e.stopPropagation();
        });
      });
    };

    $(".global-menu-wrapper").globalmobilemenu();



    /*---------- Sticky fix ----------*/
    $(window).scroll(function () {
      var topPos = $(this).scrollTop();
      if (topPos > 10) {
        $('.sticky-wrapper').addClass('sticky');
        $('.category-menu').addClass('close-category');
      } else {
        $('.sticky-wrapper').removeClass('sticky')
        $('.category-menu').removeClass('close-category');
      }
    })

    $(window).scroll(function () {
      var topPos = $(this).scrollTop();
      if (topPos > 10) {
        $('.sticky-wrapper2').addClass('sticky');
        $('.category-menu').addClass('close-category');
      } else {
        $('.sticky-wrapper2').removeClass('sticky')
        $('.category-menu').removeClass('close-category');
      }
    })

    // After
    $('.menu-expand').on('click', function (e) {
      e.preventDefault();
      $('.category-menu').toggleClass('open-category');
    });



    /*---------- Popup Sidemenu ----------*/
    function popupSideMenu($sideMenu, $sideMunuOpen, $sideMenuCls, $toggleCls) {

      $($sideMunuOpen).on('click', function (e) {
        e.preventDefault();
        $($sideMenu).addClass($toggleCls);
      });
      $($sideMenu).on('click', function (e) {
        e.stopPropagation();
        $($sideMenu).removeClass($toggleCls)
      });
      var sideMenuChild = $sideMenu + ' > div';
      $(sideMenuChild).on('click', function (e) {
        e.stopPropagation();
        $($sideMenu).addClass($toggleCls)
      });

      $($sideMenuCls).on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $($sideMenu).removeClass($toggleCls);
      });
    };


    popupSideMenu('.sidemenu-cart', '.sideMenuToggler', '.sideMenuCls', 'show');
    popupSideMenu('.sidemenu-info', '.sideMenuInfo', '.sideMenuCls', 'show');


    /*-----------------------------------
           Wow Animation 
        -----------------------------------*/
    if (typeof WOW !== 'undefined') {
      new WOW().init();
    }


    /*-----------------------------------
           Set Background Image & Mask   
        -----------------------------------*/
    if ($("[data-bg-src]").length > 0) {
      $("[data-bg-src]").each(function () {
        var src = $(this).attr("data-bg-src");
        $(this).css("background-image", "url(" + src + ")");
        $(this).removeAttr("data-bg-src").addClass("background-image");
      });
    }

    if ($("[data-mask-src]").length > 0) {
      $("[data-mask-src]").each(function () {
        var mask = $(this).attr("data-mask-src");
        $(this).css({
          "mask-image": "url(" + mask + ")",
          "-webkit-mask-image": "url(" + mask + ")",
        });
        $(this).addClass("bg-mask");
        $(this).removeAttr("data-mask-src");
      });
    }


    /*-----------------------------------
           Back to top    
        -----------------------------------*/
    $(window).on("scroll", function () {
      if ($(this).scrollTop() > 20) {
        $("#back-top").addClass("show");
      } else {
        $("#back-top").removeClass("show");
      }
    });

    $(document).on("click", "#back-top", function () {
      $("html, body").animate({ scrollTop: 0 }, 800);
      return false;
    });



    /*-----------------------------------
            MagnificPopup  view    
    -----------------------------------*/
    if ($(".popup-video").length) {
      $(".popup-video").magnificPopup({
        type: "iframe",
        removalDelay: 260,
        mainClass: "mfp-zoom-in",
      });
    }

    if ($(".popup-img").length) {
      $(".popup-img").magnificPopup({
        type: "image",
        gallery: {
          enabled: true,
        },
      });
    }



    /*-----------------------------------
             NiceSelect     
    -----------------------------------*/
    if ($(".nice-select").length) {
      $(".nice-select").niceSelect();
    }


    /*---------- Popup Sidemenu ----------*/
    // (Redundant call removed or kept if necessary logic differs, keeping consistent with original logic structure)
    popupSideMenu('.sidemenu-cart', '.sideMenuToggler', '.sideMenuCls', 'show');
    popupSideMenu('.sidemenu-info', '.sideMenuInfo', '.sideMenuCls', 'show');


    /*-----------------------------------
           Mouse Cursor    
    -----------------------------------*/
    function mousecursor() {
      if ($("body")) {
        const e = document.querySelector(".cursor-inner"),
          t = document.querySelector(".cursor-outer");
        let n,
          i = 0,
          o = !1;
        
        if(e && t) {
            (window.onmousemove = function (s) {
            o ||
                (t.style.transform =
                "translate(" + s.clientX + "px, " + s.clientY + "px)"),
                (e.style.transform =
                "translate(" + s.clientX + "px, " + s.clientY + "px)"),
                (n = s.clientY),
                (i = s.clientX);
            }),
            $("body").on("mouseenter", "a, .cursor-pointer", function () {
                e.classList.add("cursor-hover");
                t.classList.add("cursor-hover");
            }),
            $("body").on("mouseleave", "a, .cursor-pointer", function () {
                ($(this).is("a") && $(this).closest(".cursor-pointer").length) ||
                (e.classList.remove("cursor-hover"),
                    t.classList.remove("cursor-hover"));
            }),
            (e.style.visibility = "visible"),
            (t.style.visibility = "visible");
        }
      }
    }
    $(function () {
      mousecursor();
    });


    /*-----------------------------------
        Progress Bar   
    -----------------------------------*/
    $('.progress-bar').each(function () {
      var $this = $(this);
      var progressWidth = $this.attr('style').match(/width:\s*(\d+)%/)[1] + '%';

      $this.waypoint(function () {
        $this.css({
          '--progress-width': progressWidth,
          'animation': 'animate-positive 1.8s forwards',
          'opacity': '1'
        });
      }, { offset: '75%' });
    });



    /*-----------------------------------
          Text Splitting
    -----------------------------------*/
    if (typeof Splitting !== 'undefined') {
        Splitting();
    }



    // Service Slider
    if ($('.service1-slider').length) {
        var swiper = new Swiper('.service1-slider', {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 60,
        autoplay: true,
        loop: false,
        });
    }



    // Brand Slider
    if ($('.brand1-slider').length) {
        var swiper = new Swiper('.brand1-slider', {
        loop: true,
        spaceBetween: 30,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        on: {
            init: function () {
            updateSlideClasses();
            },
            slideChangeTransitionStart: function () {
            updateSlideClasses();
            }
        },
        breakpoints: {
            // Small devices (up to 576px)
            0: {
            slidesPerView: 1,
            },
            // Medium devices (576px and up)
            576: {
            slidesPerView: 2,
            },
            // Large devices (768px and up)
            768: {
            slidesPerView: 3,
            },
            // Extra large devices (992px and up)
            992: {
            slidesPerView: 4,
            },
            // XXL devices (1200px and up)
            1200: {
            slidesPerView: 5,
            },
            // Ultra large screens (1400px and up)
            1400: {
            slidesPerView: 6,
            }
        }
        });
    }

    // Function to add 'odd' and 'even' classes based on slide index
    function updateSlideClasses() {
      document.querySelectorAll('.swiper-slide').forEach((slide, index) => {
        slide.classList.remove('odd', 'even');
        if (index % 2 === 0) {
          slide.classList.add('even');
        } else {
          slide.classList.add('odd');
        }
      });
    }

    // Brand Slider
    if ($('.brand2-slider').length) {
        var swiper = new Swiper('.brand2-slider', {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 30,
        autoplay: true,

        breakpoints: {
            640: {
            slidesPerView: 1,
            spaceBetween: 20,
            },
            768: {
            slidesPerView: 3,
            spaceBetween: 30,
            },
            1024: {
            slidesPerView: 4,
            spaceBetween: 30,
            },
            1200: {
            slidesPerView: 6,
            spaceBetween: 30,
            },
        },
        });
    }

    // Testimonial Slider
    if ($('.testimonial1-slider').length) {
        var swiper = new Swiper('.testimonial1-slider', {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 20,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: '.testimonial1-card-controls__arrowRight',
            prevEl: '.testimonial1-card-controls__arrowLeft',
        },
        pagination: {
            el: '.swiper-pagination',
            type: 'fraction',
        },
        });
    }



    // wprocess-slider
    if ($('.wprocess-slider').length) {
        var swiper = new Swiper('.wprocess-slider', {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 20,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        breakpoints: {
            640: {
            slidesPerView: 1,
            spaceBetween: 20,
            },
            768: {
            slidesPerView: 1,
            spaceBetween: 30,
            },
            1024: {
            slidesPerView: 1,
            spaceBetween: 30,
            },
            1200: {
            slidesPerView: 2,
            spaceBetween: 30,
            },
        },

        navigation: {
            nextEl: '.element-controls__arrowRight',
            prevEl: '.element-controls__arrowLeft',
        },
        pagination: {
            el: '.swiper-pagination',
            type: 'fraction',
        },

        });
    }


    // Brand-slider2
    if ($('.partner2-slider').length) {
        var swiper = new Swiper('.partner2-slider', {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 10,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        breakpoints: {
            320: {
            slidesPerView: 2,
            spaceBetween: 20,
            },
            640: {
            slidesPerView: 3,
            spaceBetween: 20,
            },
            768: {
            slidesPerView: 3,
            spaceBetween: 30,
            },
            1024: {
            slidesPerView: 4,
            spaceBetween: 30,
            },
            1200: {
            slidesPerView: 5,
            spaceBetween: 30,
            },
        },

        });
    }

    // Course-slider1
    if ($('.course1-slider').length) {
        var swiper = new Swiper('.course1-slider', {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 10,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        breakpoints: {
            640: {
            slidesPerView: 1,
            spaceBetween: 20,
            },
            768: {
            slidesPerView: 2,
            spaceBetween: 30,
            },
            1024: {
            slidesPerView: 2,
            spaceBetween: 30,
            },
            1200: {
            slidesPerView: 3,
            spaceBetween: 30,
            },
            1400: {
            slidesPerView: 4,
            spaceBetween: 30,
            },
        },

        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },

        });
    }

    
    // Course-slider2
    if ($('.course2-slider').length) {
        var swiper = new Swiper('.course2-slider', {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 10,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        breakpoints: {
            640: {
            slidesPerView: 1,
            spaceBetween: 20,
            },
            768: {
            slidesPerView: 2,
            spaceBetween: 30,
            },
            1024: {
            slidesPerView: 3,
            spaceBetween: 30,
            },
            1200: {
            slidesPerView: 3,
            spaceBetween: 30,
            },
            1400: {
            slidesPerView: 4,
            spaceBetween: 30,
            },
        },

        navigation: {
            nextEl: ".course2-slider .swiper-next",
            prevEl: ".course2-slider .swiper-prev",
        }

        });
    }


    // Live Course2 Card Slider 
    if ($('.live-course2-card-slider').length) {
        var LiveCourseSlider = new Swiper(".live-course2-card-slider", {
        effect: "cards",
        grabCursor: true,

        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        });
    }


    if ($('.event-slider').length) {
        var swiper = new Swiper('.event-slider', {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 10,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        breakpoints: {
            320: {
            slidesPerView: 1,
            spaceBetween: 20,
            },
            640: {
            slidesPerView: 2,
            spaceBetween: 20,
            },
            768: {
            slidesPerView: 2,
            spaceBetween: 30,
            },
            1024: {
            slidesPerView: 3,
            spaceBetween: 30,
            },
            1200: {
            slidesPerView: 2,
            spaceBetween: 30,
            },
            1400: {
            slidesPerView: 3,
            spaceBetween: 30,
            },
        },

        navigation: {
            nextEl: ".event-details-slider .swiper-next",
            prevEl: ".event-details-slider .swiper-prev",
        }

        });
    }

    if ($('.team1-slider').length) {
        var swiper = new Swiper('.team1-slider', {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 10,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        breakpoints: {
            320: {
            slidesPerView: 1,
            spaceBetween: 20,
            },
            640: {
            slidesPerView: 2,
            spaceBetween: 20,
            },
            768: {
            slidesPerView: 2,
            spaceBetween: 30,
            },
            1024: {
            slidesPerView: 3,
            spaceBetween: 30,
            },
            1200: {
            slidesPerView: 3,
            spaceBetween: 30,
            },
            1400: {
            slidesPerView: 4,
            spaceBetween: 30,
            },
        },

        navigation: {
            nextEl: ".team1-slider .swiper-next",
            prevEl: ".team1-slider .swiper-prev",
        }

        });
    }

    if ($('.team2-slider').length) {
        var swiper = new Swiper('.team2-slider', {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 10,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        breakpoints: {
            640: {
            slidesPerView: 1,
            spaceBetween: 20,
            },
            768: {
            slidesPerView: 1,
            spaceBetween: 30,
            },
            1024: {
            slidesPerView: 1,
            spaceBetween: 30,
            },
            1200: {
            slidesPerView: 1.5,
            spaceBetween: 30,
            },
            1400: {
            slidesPerView: 2,
            spaceBetween: 30,
            },
        },

        navigation: {
            nextEl: ".team2-slider .swiper-next",
            prevEl: ".team2-slider .swiper-prev",
        }

        });
    }

    if ($('.testimonial2-slider').length) {
        var swiper = new Swiper('.testimonial2-slider', {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 10,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        breakpoints: {
            640: {
            slidesPerView: 1,
            spaceBetween: 20,
            },
            768: {
            slidesPerView: 1,
            spaceBetween: 30,
            },
            1024: {
            slidesPerView: 2,
            spaceBetween: 30,
            },
            1200: {
            slidesPerView: 2,
            spaceBetween: 30,
            },
        },

        navigation: {
            nextEl: ".testimonial2 .swiper-next",
            prevEl: ".testimonial2 .swiper-prev",
        }

        });
    }

    if ($('.blog1-slider').length) {
        var swiper2 = new Swiper('.blog1-slider', {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 10,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        breakpoints: {
            640: {
            slidesPerView: 1,
            spaceBetween: 20,
            },
            768: {
            slidesPerView: 2,
            spaceBetween: 30,
            },
            1024: {
            slidesPerView: 2,
            spaceBetween: 30,
            },
            1200: {
            slidesPerView: 3,
            spaceBetween: 30,
            },
            1400: {
            slidesPerView: 4,
            spaceBetween: 30,
            },
        },

        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },

        });
    }

    if ($('.blog2-slider').length) {
        var swiper = new Swiper('.blog2-slider', {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 10,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        breakpoints: {
            640: {
            slidesPerView: 1,
            spaceBetween: 20,
            },
            768: {
            slidesPerView: 2,
            spaceBetween: 30,
            },
            1024: {
            slidesPerView: 2,
            spaceBetween: 30,
            },
            1200: {
            slidesPerView: 3,
            spaceBetween: 30,
            },
            1400: {
            slidesPerView: 4,
            spaceBetween: 30,
            },
        },

        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },

        });
    }

  }
})(jQuery);
