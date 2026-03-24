(function ($) {
  Drupal.behaviors.backToTopV1 = {
    attached: false,
    attach: function (context) {
      if (this.attached) {
        return;
      }
      this.attached = true;
      var $template = $('.js-footer-backtotop-v1', context);
      var bps = Unison.fetch.all();
      var bp = Unison.fetch.now();
      var isMobile = parseInt(bp.width, 10) < parseInt(bps.landscape, 10);
      var documentHeight = $(document).height();
      var pcScroll = 1500;
      var mobileScroll = 750;
      var overPagePcSize = 2000;
      var overPageMobileSize = 1000;
      var _displayBackToTop = function () {
        var position = $(window).scrollTop();

        if (isMobile) {
          if (documentHeight > overPageMobileSize && position > mobileScroll) {
            $template.toggleClass('hidden', false);
          } else {
            $template.toggleClass('hidden', true);
          }
        } else {
          if (documentHeight > overPagePcSize && position > pcScroll) {
            $template.toggleClass('hidden', false);
          } else {
            $template.toggleClass('hidden', true);
          }
        }
      };

      _displayBackToTop();

      Unison.on('change', function (bp) {
        isMobile = parseInt(bp.width, 10) < parseInt(bps.landscape, 10);
      });

      $(window).on(
        'scroll resize',
        _.throttle(function () {
          _displayBackToTop();
        }, 100)
      );

      $('.js-footer-backtotop-v1', context)
        .off('click.backToTop')
        .on('click.backToTop', function (event) {
          event.preventDefault();
          $(document).trigger('scrollTransition');
          $('body, html').animate({ scrollTop: 0 }, 400);
        });
    }
  };
})(jQuery);
