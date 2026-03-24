/**
 * Adaptive Placeholders
 */

(function ($) {
  Drupal.behaviors.adaptivePlaceholders = {
    attached: false,

    labelMode: function ($input) {
      $input.addClass('adpl__mode-label label-mode');
      $input.removeClass('adpl__mode-placeholder placeholder-mode');
    },

    placeholderMode: function ($input) {
      $input.removeClass('adpl__mode-label label-mode');
      $input.addClass('adpl__mode-placeholder placeholder-mode');
    },

    toggleMode: function ($input) {
      var self = this;

      if ($input.val() === '') {
        self.placeholderMode($input);
      } else {
        self.labelMode($input);
      }
    },

    bindEvents: function ($input) {
      var self = this;

      // Swap out placeholder/label classes on focus in or out
      $input.on('focusin', function () {
        self.labelMode($input);
      });

      $input.on('focusout', function () {
        self.toggleMode($input);
      });

      $input.on('change', function () {
        self.toggleMode($input);
      });
    },

    setupDOM: function ($inputs) {
      var self = this;

      $inputs.each(function () {
        var $input = $(this);

        if (!$input.hasClass('adpl--processed')) {
          var $label = $input.siblings('label');
          var placeholder = $input.attr('placeholder') || $label.attr('placeholder');
          var containedLabel = false;

          if ($input.parent().is('label.adpl-container')) {
            containedLabel = true;
          }

          // Input needs a placeholder
          if (!placeholder) {
            return true;
          }

          if (!containedLabel) {
            // If label exists
            if ($label.length > 0) {
              $label.remove();
            } else {
              // If label does not exist, build it
              var id = $input.attr('id');

              if (!!id) {
                $label = $('<label class="label" for="' + id + '">' + placeholder + '</label>');
              } else {
                // If there is no label, and no id on the input, then we cannot proceed
                return true;
              }
            }
          } else {
            $label = $('<span class="label adpl-label">' + placeholder + '</span>');
          }

          // Ensure that label contains attributes required for display
          if (!$label[0].hasAttribute('placeholder')) {
            $label.attr('placeholder', placeholder);
          }

          // Ensure that label contains attributes required for display
          if (!$label[0].hasAttribute('alt')) {
            $label.attr('alt', placeholder);
          }

          // Ensure that label contains an inner span.label-content wrapping the text
          if ($label.find('span.label-content').length < 1) {
            $label.wrapInner('<span class="label-content"></span>');
          }

          // Position the label after the input, required for proper z-index
          $label.insertAfter($input);

          // Cleanup inputs
          if ($input.attr('id') === 'google_autocomplete') {
            $input.attr('placeholder', '');
          } else {
            $input.removeAttr('placeholder');
          }

          // Set states, bind events
          self.placeholderMode($input);
          self.bindEvents($input);
          self.toggleMode($input);

          // Add CSS class for styling
          $input.addClass('adpl--processed');
        }
      });
    },

    attach: function (context) {
      if (this.attached) {
        return;
      }
      this.attached = true;

      if ($('html').hasClass('no-placeholder')) {
        return;
      }

      var $inputs = $('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="password"], textarea', context).not('.no-adpl');

      this.setupDOM($inputs);
    }
  };
})(jQuery);
