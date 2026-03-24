(function ($) {
  var contentBlockOverlay = {
    attached: false,
    setup: function (context) {
      var self = this;

      if (self.attached) {
        return;
      };
      self.attached = true;
      self.$body = $('body');
      self.init(context);
    },

    init: function (context) {
      var self = this;
      var $modules = $('.js-content-block-overlay', context);

      if ($modules.length === 0) {
        return;
      };

      $modules.each(function (i, item) {
        var $overlayItem = $(item);
        var $overlayItemCta = $overlayItem.parent().find('.js-content-block-overlay-cta');
        var $overlayParent = $overlayItem.parent('.js-content-block-overlay-cta');
        var $ctaLink = $overlayItemCta.length > 0 ? $overlayItemCta : $overlayParent;

        $overlayItem.addClass('overlay' + i).appendTo('body');
        $ctaLink.attr('overlay-class', 'overlay' + i);
      });

      $('.js-content-block-overlay-cta', context).once().on('click', function (e) {
        e.preventDefault();
        self.openOverlay($(this), context);
      });

      $('.js-content-block-overlay-close-btn', context).once().on('click', function () {
        self.closeOverlay();
      });
    },
    openOverlay: function ($cta, context) {
      var self = this;
      var overlayClass = $cta.attr('overlay-class');
      var $overlayContainer = $('.' + overlayClass, context);
      var $galleryFormatter;
      var $galleryItem;
      var $galleryItemCount;

      if ($overlayContainer.length > 0) {
        $galleryFormatter = $overlayContainer.find('.js-gallery-formatter');
        $galleryItem = $galleryFormatter.find('.js-gallery-item');
        $galleryItemCount = $galleryFormatter.find('.js-gallery-item-content-count');

        if (Drupal.behaviors.galleryFormatterV1 !== undefined &&
            Drupal.behaviors.galleryFormatterV1.firstItem !== undefined) {
          Drupal.behaviors.galleryFormatterV1.firstItem($galleryItem, $galleryItemCount);
        }

        setTimeout(function () {
          self.$body.addClass('content-block-overaly-open');
          $overlayContainer.addClass('active');
          if ($galleryFormatter.hasClass('js-overlay-full-display')) {
            $overlayContainer.addClass('full-display');
          }
          if ($galleryFormatter.find('.js-text-above-media').length > 0) {
            $overlayContainer.addClass('full-display__text-media');
          }
        }, 50);
      }
    },
    closeOverlay: function () {
      this.$body.removeClass('content-block-overaly-open');
      $('.js-content-block-overlay').removeClass('active');
    }
  };

  Drupal.behaviors.contentBlockOverlay = {
    attach: function (context) {
      contentBlockOverlay.setup(context);
    }
  };
  $(document).on('elc.iframe.closeOverlay', function () {
    contentBlockOverlay.closeOverlay();
  });
})(jQuery);
