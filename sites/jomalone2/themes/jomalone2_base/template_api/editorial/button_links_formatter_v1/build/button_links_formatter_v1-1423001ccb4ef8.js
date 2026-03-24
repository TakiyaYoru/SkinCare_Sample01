var site = site || {};

site.translations = site.translations || {};

(function ($) {
  var buttonLinksFormatter = {
    setup: function (context) {
      var self = this;

      self.bps = Unison.fetch.all();
      var bp = Unison.fetch.now();

      if (self.attached) {
        return;
      }
      self.attached = true;
      self.isMobile = parseInt(bp.width, 10) < parseInt(self.bps.landscape, 10);
      self.init(context);
    },
    init: function (context) {
      var $formatter = $('.js-button-links-formatter-v1', context);

      if ($formatter.length < 1) {
        return;
      }
      var self = this;
      var $carouselItems = $();
      var $carousel = $();
      var $carouselControls = $();
      var $thisFormatter = $();

      $formatter.each(function () {
        $thisFormatter = $(this);
        $carousel = $(
          '.js-button-links-formatter__carousel, .js-button-links-formatter__search-carousel',
          $thisFormatter
        );
        $carouselItems = $thisFormatter.find('.js-button-links-formatter__carousel-item');
        $carouselControls = $thisFormatter.find('.js-button-links-formatter__carousel-controls');
        self.mobileCarousel($carousel, $carouselControls);
        Unison.on('change', function () {
          if (!self.bps) {
            return false;
          }
          var bp = Unison.fetch.now();

          self.isMobile = parseInt(bp.width, 10) < parseInt(self.bps.landscape, 10);
          self.mobileCarousel($carousel, $carouselControls);
        });
      });
    },
    mobileCarousel: function ($carousel, $carouselControls) {
      var self = this;
      var carouselControlsNextLabel = site.translations.elc_general.next || 'next';
      var carouselControlsPreviousLabel = site.translations.elc_general.previous || 'previous';
      var settings = {
        appendArrows: $carouselControls,
        appendDots: false,
        infinite: true,
        autoplay: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        prevArrow:
          '<svg role="button" aria-label="' +
          carouselControlsPreviousLabel +
          '" class="icon icon--chevron slick-prev slick--custom"><use xlink:href="#chevron--left"></use></svg>',
        nextArrow:
          '<svg role="button" aria-label="' +
          carouselControlsNextLabel +
          '" class="icon icon--chevron slick-next slick--custom"><use xlink:href="#chevron"></use></svg>'
      };

      if (self.isMobile) {
        $carousel.not('.slick-initialized').slick(settings);
      } else {
        if ($carousel.hasClass('slick-initialized')) {
          $carousel.slick('unslick');
        }
      }
    },
    mobileSearchCarouselInit: function ($context) {
      var self = this;
      var $searchCarousel = $('.js-button-links-formatter__search-carousel', $context);

      if ($searchCarousel.hasClass('slick-initialized')) {
        return false;
      }
      self.init($context);
    },
    mobileSearchCarouselRefresh: function ($carouselContainer) {
      var self = this;

      if (!self.isMobile || !$carouselContainer) {
        return false;
      }
      var $searchCarousel = $carouselContainer.find('.js-button-links-formatter__search-carousel');

      if ($searchCarousel.hasClass('slick-initialized')) {
        $searchCarousel.slick('refresh');
      }
    }
  };

  Drupal.behaviors.buttonLinksFormatterV1 = {
    bps: {},
    isMobile: false,
    attached: false,
    attach: function (context) {
      buttonLinksFormatter.setup(context);
    }
  };

  $(document).on('search_tags_active', function (e, $searchTagsBlock, searchActive) {
    var $context = $(this);

    buttonLinksFormatter.mobileSearchCarouselInit($context);
    if (!searchActive) {
      buttonLinksFormatter.mobileSearchCarouselRefresh($searchTagsBlock);
    }
  });
})(jQuery);
