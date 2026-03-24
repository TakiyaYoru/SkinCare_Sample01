(function ($) {
  Drupal.behaviors.heroBlockV1 = {
    attached: false,
    attach: function (context) {
      if (this.attached) {
        return;
      }
      this.attached = true;

      var $template = $('.js-hero-block', context);
      var $contentOverMedia = $('.js-hero-content-over-media', $template);
      var alphaValue = $contentOverMedia.attr('data-bg-color-opacity') || 0;

      if(alphaValue !== 0) {
        const bgColor = $contentOverMedia.css('background-color');
        const rgba = bgColor.replace(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/, `rgba($1, $2, $3, ${alphaValue})`);

        $contentOverMedia.css('background-color', rgba);
      }
    }
  }
  })(jQuery);