(function ($) {
  Drupal.behaviors.headerOffersBannerFormatterV1 = {
    attached: false,
    attach: function (context) {
      if (this.attached) {
        return;
      }
      this.attached = true;
      var $formatter = $('.js-header-offers-banner-formatter-v1', context);
      var $carousel = $('.js-header-offers-banner-formatter-carousel', $formatter);
      var $slides = $carousel.find('.header-offers-banner-formatter__carousel-item');
      var $close = $('.js-header-offers-banner-formatter__close', $formatter);
      var $arrow = $('.js-header-offers-banner-formatter-carousel-arrow', $carousel);
      var slideIndex = 1;
      var timer = null;
      var autoplay = $carousel.data('slides-autoplay');
      var speed = parseInt($carousel.data('speed'));
      var $gnavOfferBanner = $formatter.parents('.gnav-header-block__offers');

      $formatter.each(function () {
        var $this = $(this);

        if ($this.hasClass('js-header-offers-banner-single-page')) {
          var $OfferBelowGNav = $this.children('.js-header-offers-banner-below-gnav');
          var $offerCarousel = $this.find('.header-offers-banner-formatter__carousel-item');

          $this.detach();
          $gnavOfferBanner.find('.js-header-offers-banner-formatter-v1').remove();
          if ($OfferBelowGNav.length > 0) {
            $gnavOfferBanner.parents('.js-gnav-header-block-v1').find('.gnav-header-block__inner').append($this);
            $this.addClass('gnav-header-block__offers-below');
            $('body').addClass('gnav-offers-below');
          } else {
            $gnavOfferBanner.append($this);
          }
          $offerCarousel.first().addClass('item-active');
          $slides = $offerCarousel;
        }
        $this.find('.js-elc-button').once().on('click', function () {
          $('body').addClass('offers-slide-panel-open');
        });
      });

      showSlides(slideIndex);

      if ($.cookie('hide_header_offer_banner')) {
        $('body').addClass('gnav-offers-hidden');

        return;
      }
      if ($formatter.parents('.js-offer-block-below-gnav').length > 0) {
        $('body').addClass('gnav-offers-below');
      }

      $carousel.removeClass('not-initialized');
      // Next/previous controls
      $arrow.once().on('click', function () {
        var newIndex = $(this).data('index');

        clearTimeout(timer);
        showSlides((slideIndex += newIndex));
      });

      $close.on('click', function () {
        $.cookie('hide_header_offer_banner', '1', { path: '/' });
        $(document).trigger('hide_header_offer_banner');
        $('body').addClass('gnav-offers-hidden');
      });

      function showSlides(n) {
        if (n === undefined) {
          n = ++slideIndex;
        }
        if (n > $slides.length) {
          slideIndex = 1;
        }
        if (n < 1) {
          slideIndex = $slides.length;
        }
        $slides.removeClass('item-active');
        $slides.eq(slideIndex - 1).addClass('item-active');
        if (autoplay) {
          timer = setTimeout(showSlides, speed);
        }
      }
    }
  };
})(jQuery);
