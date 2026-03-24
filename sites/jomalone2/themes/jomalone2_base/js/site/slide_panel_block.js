(function($, Drupal, site) {
  Drupal.behaviors.slidePanelBlock = {
    attached: false,
    isPaddingtonPage: $('body').hasClass('section-paddington-limited-edition-collection'),
    isChristmasGiftsPage: $('body').hasClass('section-christmas-gifts'),
    attach: function(context) {
      if (this.attached) {
        return;
      }
      this.attached = true;

      var self = this;
      var $modules = $('.js-show-slide-panel-with-cta', context);
      $modules.each(function() {
        var $module = $(this);
        var $cta = $('.js-elc-button', $module).first();
        var ctaIndex = $module.data('cta-launch-slide') || 1;
        var $tempCta = $('.js-cta-launch-slide--' + ctaIndex + ' .js-elc-button', $module);
        var startPositionY = 0;
        var startPositionX = 0;
        var endPositionY = 0;
        var endPositionX = 0;
        var bps = Unison.fetch.all();
        var bp = Unison.fetch.now();
        var isMobile = parseInt(bp.width, 10) < parseInt(bps.landscape, 10);
        var $footerTop = $module.closest('.sitewide-footer-formatter__top');
        var isOffersRoundel = $footerTop.find('.offers-roundel').length;
        var $roundelClose = $footerTop.find('.offers-roundel__close');
        var triggerEvent;

        if ($tempCta.length) {
          $cta = $tempCta;
        }
        if (!$cta.length) {
          $module.addClass('not-attached');
        }
        $cta.off('click.reveal').on('click.reveal', function() {
          var eventLabel = 'start - Fragrance Finder';

          if (self.isPaddingtonPage) {
            eventLabel = 'Banner Clicks | Project P | Promo Bar';
          } else if (self.isChristmasGiftsPage) {
            eventLabel = 'banner click | christmas fy25 | promobar';
          }

          self.activateSlidePanel($(this).closest($('.js-show-slide-panel-with-cta')));
          self.trackEvtLink(eventLabel);
          // runs both the event.stopPropagation() and event.preventDefault() functions needs to stop event click on this element and parent.
          return false;
        });
        triggerEvent = function (e) {
          var $this = $(this);
          var thisOffset = $this.offset();

          endPositionY = thisOffset.top;
          endPositionX = thisOffset.left;
          if (
            Math.abs(startPositionY - endPositionY) < 5 &&
            Math.abs(startPositionX - endPositionX) < 5
          ) {
            $(this).trigger(e);
          }
        };

        if (isMobile && isOffersRoundel) {
          $cta.add($roundelClose).on('touchstart', function () {
            var $this = $(this);
            var thisOffset = $this.offset();

            startPositionY = thisOffset.top;
            startPositionX = thisOffset.left;
          });
          $cta.on('touchend', function () {
            triggerEvent.call(this, 'click.reveal');
          });
          $roundelClose.on('touchend', function () {
            triggerEvent.call(this, 'click');
          });
        }
      });
    },
    activateSlidePanel: function($module) {
      var self = this;
      var newContent;
      var $body = $('body');
      var slidePanelBlockHtml = $('.js-slide-panel-block-reveal', $module).html();
      var plpPanel = $('.js-slide-panel-block-generated').hasClass('plp-panel');
      var $reveal = $(slidePanelBlockHtml);
      $body.children('.js-slide-panel-block-generated').remove();
      newContent = $body.append($reveal);
      var $close = $('.js-slide-panel-block-close', $reveal);
      self.toggleAnimation(true);
      $close.off('click.close').on('click.close', function(e) {
        e.preventDefault();
        self.toggleAnimation(false);
      });
      $(document).on('click', '.js-add-to-bag-button', function () {
        self.handleAddToCart($(this), plpPanel);
      });

      $(document).on('click', '.js-product-content-card-atb', function (e) {
        var $this = $(this);
        var $card = $this.closest('.js-product-content-card');
        var skuIds = $card.data('skuId');
        var payload = {
          quantity: 1,
          replenishment: false
        };
        e.preventDefault();
        if (skuIds) {
          $(document).trigger('perlgem.cart.addItem', [
            skuIds.toString(),
            payload
          ]);
        }
        self.handleAddToCart($this, plpPanel);
      });
      $(document).off('keyup.close').on('keyup.close', function(e) {
        // escape key
        if (e.keyCode === 27) {
          self.toggleAnimation(false);
        }
      });
      $(document).on('slide-panel-block.close', function() {
        if (!self.isPaddingtonPage && !self.isChristmasGiftsPage) {
          self.trackEvtLink('closed - Fragrance Finder');
        }
      });
      $('.js-form-formatter.fragrance-finder, .js-quiz-page-formatter', $reveal).on('mantle-form:request-tokenless',  function () {
        var buid = Drupal.settings.elc_ecom.businessUnitId;
        var token = window.btoa(`${buid}:${origin}`);

        return token;
      });
      if (!plpPanel) {
        Drupal.attachBehaviors(newContent[0]);
      }
    },

    handleAddToCart: function($button, plpPanel) {
      var self = this;

      $(document).one('addToCart.success', function () {
        if (plpPanel) {
          $('.js-gnav-util-cart-content').addClass('hide-gnav-overlay');
          $button.addClass('product-added');
        }
        self.toggleAnimation(false);
      });
    },

    trackEvtLink: function(label) {
      var self = this;
      var eventObj = {
        event_name: 'diagtools',
        event_category: 'diagnostic tool – Fragrance Finder',
        event_action: 'overlay',
        event_label: label
      };

      if (self.isPaddingtonPage) {
        eventObj.event_name = 'content-module-click';
        eventObj.event_category = 'project-p modules clicks';
        eventObj.event_action = 'Module Clicks';
      } else if (self.isChristmasGiftsPage) {
        eventObj.event_name = 'christmas-gifts';
        eventObj.event_category = 'fy25 christmas modules clicks';
        eventObj.event_action = 'module clicks';
      }
      site.track.evtLink(eventObj);
    },

    toggleAnimation: function(open) {
      var self = this;
      var $body = $('body');
      var $html = $('html');
      if (self.queuedAction) {
        clearTimeout(self.queuedAction);
      }
      if (open) {
        $body.addClass('active-content-panel');
        $html.addClass('slide_panel_enabled');
        $(document).trigger('slide-panel-block.open');
        // Allows CSS transitions
        setTimeout(function() {
          $body.addClass('active-content-panel-animation');
          // Force carousel refresh
          $(window).trigger('resize');
        }, 1);
      } else {
        $body.removeClass('active-content-panel-animation');
        this.queuedAction = setTimeout(function() {
          $body.removeClass('active-content-panel');
          $html.removeClass('slide_panel_enabled');
          $body.children('.js-slide-panel-block-generated').remove();
          $(document).trigger('slide-panel-block.close');
        }, 300);
      }
    }
  };
})(jQuery, Drupal, window.site || {});
