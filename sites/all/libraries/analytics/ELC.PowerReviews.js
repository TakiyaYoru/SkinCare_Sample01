// Image Gallery Review Tagging - Analytics.
(function (site, $) {
  Drupal.behaviors.analyticsPowerReviewBehavior = {
    attach: function (context) {
      // Event track common function call - Start
      function triggerEvent(eName, eCategory, eAction, elabel, eventObj) {
        eventObj = eventObj || {};
        Object.assign(eventObj, {
          event_name: eName,
          event_category: eCategory,
          event_action: eAction,
          event_label: elabel
        });
        site.track.evtLink(eventObj);
      }
      // Event track common function call - End
      if (site && site.track && site.track.evtLink) {
        $(document).on('click', '.pr-rid-tile-overlay', function () {
          var eventLabel = $(this).find('.pr-rid-tile-image-title').text().trim();

          triggerEvent('read_write_review_images', 'product_review_images', 'open', eventLabel);
        });

        if ($('div').hasClass('image_gallery_reviews')) {
          $(document).on('click', '.button__close', function () {
            var eventLabel = $(this)
              .next('.pr-media-carousel')
              .find('.carousel__footer span')
              .html();

            triggerEvent('read_write_review_images', 'product_review_images', 'close', eventLabel);
          });

          $(document).on('click', '.button__next', function () {
            var eventLabel = $(this).next('.carousel__footer').find('span').html();

            triggerEvent('read_write_review_images', 'product_review_images', 'next', eventLabel);
          });

          $(document).on('click', '.button__prev', function () {
            var eventLabel = $(this).nextAll('.carousel__footer').find('span').html();

            triggerEvent(
              'read_write_review_images',
              'product_review_images',
              'previous',
              eventLabel
            );
          });

          $(document).on('click', '.pr-helpful-yes', function () {
            var eventLabel = $(this)
              .closest('.pr-media-carousel')
              .find('.carousel__footer span')
              .html();

            triggerEvent(
              'read_write_review_images',
              'product_review_images',
              'helpful',
              eventLabel
            );
          });

          $(document).on('click', '.pr-helpful-no', function () {
            var eventLabel = $(this)
              .closest('.pr-media-carousel')
              .find('.carousel__footer span')
              .html();

            triggerEvent(
              'read_write_review_images',
              'product_review_images',
              'not_helpful',
              eventLabel
            );
          });

          $(document).on('click', '.pr-rd-flag-image-container', function () {
            var eventLabel = $(this)
              .closest('.pr-media-carousel')
              .find('.carousel__footer span')
              .html();

            triggerEvent('read_write_review_images', 'product_review_images', 'flag', eventLabel);
          });

          $(document).on('click', '.pr-rid-btn-container', function () {
            var eventLabel = $(this).find('.pr-rid-btn-text').html();

            triggerEvent(
              'read_write_review_images',
              'product_review_images',
              'show_more',
              eventLabel
            );
          });
        } else {
          $(document).on('click', '.pr-ggl', function () {
            var eventLabel = $(this)
              .nextUntil('.pr-media-carousel--light')
              .find('.slide__center')
              .children('.pr-media-card')
              .find('.pr-media-card-content-text-headline')
              .text();

            triggerEvent('read_write_review_images', 'product_review_images', 'open', eventLabel);
          });

          $(document).on('click', '.button__close', function () {
            var eventLabel = $(this)
              .next('.pr-media-carousel--light')
              .find('.slide__center')
              .children('.pr-media-card')
              .find('.pr-media-card-content-text-headline')
              .text();

            triggerEvent('read_write_review_images', 'product_review_images', 'close', eventLabel);
          });

          $(document).on('click', '.button__next', function () {
            var eventLabel = $(this)
              .prev('.carousel__body ')
              .find('.slide__center')
              .children('.pr-media-card')
              .find('.pr-media-card-content-text-headline')
              .text();

            triggerEvent('read_write_review_images', 'product_review_images', 'next', eventLabel);
          });

          $(document).on('click', '.button__prev', function () {
            var eventLabel = $(this)
              .next('.carousel__body')
              .children('.slide__center')
              .find('.pr-media-card-content-text-headline')
              .text();

            triggerEvent(
              'read_write_review_images',
              'product_review_images',
              'previous',
              eventLabel
            );
          });

          $(document).on('click', '.pr-helpful-yes', function () {
            var eventLabel = $(this)
              .closest('.pr-media-card')
              .find('.pr-media-card-content-text-headline')
              .text();

            triggerEvent(
              'read_write_review_images',
              'product_review_images',
              'helpful',
              eventLabel
            );
          });

          $(document).on('click', '.pr-helpful-no', function () {
            var eventLabel = $(this)
              .closest('.pr-media-card')
              .find('.pr-media-card-content-text-headline')
              .text();

            triggerEvent(
              'read_write_review_images',
              'product_review_images',
              'not_helpful',
              eventLabel
            );
          });

          $(document).on('click', '.pr-media-card-footer-flagging', function () {
            var eventLabel = $(this)
              .closest('.pr-media-card')
              .find('.pr-media-card-content-text-headline')
              .text();

            triggerEvent('read_write_review_images', 'product_review_images', 'flag', eventLabel);
          });

          $(document).on('click', '.pr-ggl_show-more-btn-container', function () {
            var eventLabel = $(this).text().trim();

            triggerEvent(
              'read_write_review_images',
              'product_review_images',
              'show_more',
              eventLabel
            );
          });
        }
      }
    }
  };
})(window.site || {}, jQuery);
