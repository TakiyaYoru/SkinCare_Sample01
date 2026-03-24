/**
 * Clickable blocks - entire block will be clickable
 * Styles are in _helpers.scss under .block--linked
 *
 * Usage:
 * {{#link}} data-clickable="{{link_path}}"{{/link}}
 * {{#url}} data-clickable="{{href}}"{{/url}}
 */
var site = window.site || {};

(function($) {
  Drupal.behaviors.clickable = {
    attach: function(context, settings) {
      $('[data-clickable!=""][data-clickable]', context).once('clickable').addClass('block--linked').on('click', function (evt) {
        var targetElem = evt.target;
        var $containerElem = '';
        var moduleTitle = '';
        var eventObj = {};

        var dataClickable = $(this).data('clickable');
        if (window.location.hash && (dataClickable.toString().substr(0,1) === '/' || (dataClickable.toString().indexOf(window.location.hostname) !== -1))) {
          history.replaceState('', '', dataClickable); // fix for hitchhiking hashes
        }

        if ($('body').hasClass('section-rose-fragrance-collection')) {
          eventObj = {
            event_name: 'content-module-click',
            event_category: 'rose-fragrance-collection modules clicks',
            event_action: 'Module Clicks'
          };

          $containerElem = $(targetElem).closest('.js-split-width-wrapper');
          moduleTitle = $containerElem.find('.js-content-block-line-title .js-mantle-custom-text').text().trim();

          if ('track' in site && 'evtLink' in site.track && moduleTitle !== '') {
            if (targetElem.tagName === 'P') {
              eventObj.event_label = moduleTitle + ' Read More CTA';
              site.track.evtLink(eventObj);
            } else if (targetElem.tagName === 'IMG') {
              eventObj.event_label = moduleTitle + ' image';
              site.track.evtLink(eventObj);
            }
          }
        }
        window.location.href = dataClickable;
      });
    }
  };
})(jQuery);
