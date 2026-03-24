(function ($) {
  Drupal.behaviors.gnavSectionFormatterV1 = {
    attached: false,
    attach: function (context) {
      if (this.attached) {
        return;
      }
      this.attached = true;

      var timeout;
      var lastTap = 0;
      var $body = $('body');
      var $template = $('.js-gnav-section-formatter-v1', context);
      var $sectionTrigger = $('.js-gnav-section-formatter__link--trigger', $template);
      var $allSections = $body.find('.js-gnav-section-formatter');
      var $allSectionsContent = $body.find('.js-gnav-section-formatter__content-wrapper');
      var $allGroupSections = $body.find('.gnav-section-group__section');

      // Collapse subnav using js only.
      $allSectionsContent.attr('aria-hidden', 'true');

      // close all sections.
      function closeSections() {
        $allSections.attr('aria-expanded', 'false');
        $allSectionsContent.attr('aria-hidden', 'true');
        $allGroupSections.removeClass('mobile-expanded--true mobile-expanded--false');
      }

      gnavSectionTrigger();

      Unison.on('change', function () {
        closeSections();
        gnavSectionTrigger();
      });

      function gnavSectionTrigger() {
        // Calculate desktop for mobile menu stuff.
        var bps = Unison.fetch.all();
        var bp = Unison.fetch.now();
        var isDesktop = parseInt(bp.width, 10) >= parseInt(bps.landscape, 10);

        if (isDesktop) {
          $sectionTrigger.off('touchend mouseover click').on('touchend mouseover', function (e) {
            var $self = $(this);

            sectionTriggerPC($self, e);
          });
        } else {
          $sectionTrigger.off('touchend mouseover click').on('click', function (e) {
            var $self = $(this);

            sectionTriggerMobile($self, e);
          });
        }
      }

      function sectionTriggerPC($self, e) {
        var $parent = $self.parent();
        var $content = $self.next('.js-gnav-section-formatter__content-wrapper');
        var expanded = $parent.attr('aria-expanded') === 'true';

        if (e.type === 'touchend' && detectDoubleTap() && expanded) {
          return;
        }
        e.preventDefault();
        closeSections();
        $parent.attr('aria-expanded', 'true');
        $content.attr('aria-hidden', 'false');
      }

      function sectionTriggerMobile($self, e) {
        var $parent = $self.parent();
        var $content = $self.next('.js-gnav-section-formatter__content-wrapper');
        var $group = $self.closest('.js-gnav-header-sections__section');
        var $groupSection = $self.closest('.gnav-section-group__section');
        var $groupLabel = $('.js-gnav-header-sections__section-label', $group);
        var expanded = $parent.attr('aria-expanded') === 'false' ? false : true;
        var $mom = $self.closest('.js-gnav-header-sections__section');

        // If only a single section the first interaction is managed in gnav_header_block.js
        if ($mom.hasClass('gnav-sections-mobile-single')) {
          return;
        }
        e.preventDefault();
        closeSections();
        $parent.attr('aria-expanded', !expanded);
        $content.attr('aria-hidden', expanded);
        $group.addClass('gnav-mobile-group-active');
        $groupSection.addClass('mobile-expanded--' + !expanded);
        $groupLabel.addClass('gnav-mobile-group-label-active');
      }

      function detectDoubleTap() {
        var currentTime = new Date().getTime();
        var tapLength = currentTime - lastTap;
        var hasTappedTwice = false;

        clearTimeout(timeout);
        if (tapLength < 500 && tapLength > 0) {
          hasTappedTwice = true;
        } else {
          timeout = setTimeout(function () {
            clearTimeout(timeout);
          }, 500);
        }
        lastTap = currentTime;

        return hasTappedTwice;
      }
    }
  };
})(jQuery);
