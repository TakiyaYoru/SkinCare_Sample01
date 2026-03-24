var site = site || {};
var generic = generic || {};
var rb = rb || {};

site.sd_engraving = function() {
  //Move the close button to inside a more specific defined area for X image overrides
  $('.engraving-preview-popup .spp-engraving-preview .background-swap').prepend($('.engraving-preview-popup').find('.close-container'));
  $('.engraving-preview-popup').removeClass('quick-shop-opened');
  if ($('.js-product-quick-view-wrapper').length > 0) {
    $('.engraving-preview-popup').addClass('quick-shop-opened');
  }
  //Multiple Engraving Choices Form Switching
  $('.engraving-preview-popup .spp-engraving-preview .engraving-form-choice-btn a.engraving-choice').on('click', function(e) {
    e.preventDefault();
    //Remove siblings already selected
    $(this).siblings('a.engraving-choice').removeClass('engrave-style-chosen');
    //Add selected to this button
    $(this).addClass('engrave-style-chosen');
    //find the correct form to show
    var theClass = Drupal.behaviors.sdPerlgemEngraving.searchClassValue($(this), 'engraving-form-choice-');
    switch (theClass) {
      case 'engraving-form-choice-1':
        Drupal.behaviors.sdPerlgemEngraving.analytics_event('engraving options', 'Engraving Lid');
        break;
      case 'engraving-form-choice-4':
        Drupal.behaviors.sdPerlgemEngraving.analytics_event('engraving options', 'Engraving Bottle');
        break;
      default:
    }
    Drupal.behaviors.sdPerlgemEngraving.analytics_event('overlay', '2nd page loaded');
    //Hide/Deactivate all forms
    $('.engraving-preview-popup .spp-engraving-preview .engraving-forms').
      find('form').
      removeClass('active-engraving-form').
      addClass('hidden');
    //Add choice selected class to the background-wrap wrapper
    var $backgroundSwap = $('.engraving-preview-popup .spp-engraving-preview .background-swap');
    Drupal.behaviors.sdPerlgemEngraving.removeClassPrefix($backgroundSwap, 'engraving-form-choice-');
    $backgroundSwap.addClass(theClass);

    //Hide Choices screen
    $('.engraving-preview-popup .spp-engraving-preview .engraving-query.choices').fadeOut('slow', function() {
      //Now show the selected choice form
      $('.engraving-preview-popup .spp-engraving-preview .engraving-forms').find('.' + theClass).
        addClass('active-engraving-form').
        removeClass('hidden').
        fadeIn('slow');
      Drupal.behaviors.sdPerlgemEngraving.resizeEngravingOnMobile();
    });
  });

  //Left Arrow Binding
  $('.engraving-preview-popup .spp-engraving-preview').find('.overlay-left-arrow-nav a.back-choices').on('click', function(e) {
    e.preventDefault();

    var $backgroundSwap = $('.engraving-preview-popup .spp-engraving-preview .background-swap');
    Drupal.behaviors.sdPerlgemEngraving.removeClassPrefix($backgroundSwap, 'engraving-form-choice-');

    $('.engraving-preview-popup .spp-engraving-preview .engraving-forms form.active-engraving-form').fadeOut('slow', function() {
      $(this).removeClass('active-engraving-form');
      $('.engraving-preview-popup .spp-engraving-preview .engraving-query.choices').fadeIn('slow');
      Drupal.behaviors.sdPerlgemEngraving.resizeEngravingOnMobile();
    });
  });

  //Multiple Choice Font Switching but allow different forms different selected
  $('.engraving-preview-popup .spp-engraving-preview .engraving-form .engraving-form-font-choice-btn a.change-font').on('click', function(e) {
    e.preventDefault();
    var theClass = Drupal.behaviors.sdPerlgemEngraving.searchClassValue($(this), 'engrave-choice-');
    switch (theClass) {
      case 'engrave-choice-script':
        Drupal.behaviors.sdPerlgemEngraving.analytics_event('engraving options', 'Engrave Script');
        break;
      case 'engrave-choice-block':
        Drupal.behaviors.sdPerlgemEngraving.analytics_event('engraving options', 'Engrave Block');
        break;
      default:
    }
    //If we have copy set the font style
    $(this).closest('form.engraving-form').find('input.engraving-message').each(function() {
      var $this = $(this);
      if ($this.val().length) {
        Drupal.behaviors.sdPerlgemEngraving.removeClassPrefix($this, 'engrave-choice-');
        $this.addClass(theClass);
      }
    });

    var $newCanvas = $(this).closest('form.engraving-form').find('.new-canvas input');
    Drupal.behaviors.sdPerlgemEngraving.removeClassPrefix($newCanvas, 'engrave-choice-');
    $newCanvas.addClass(theClass);

    //Now set button selected styles
    $(this).closest('.engraving-form-font-choice-btn').find('a.change-font').removeClass('engrave-style-chosen');
    $(this).addClass('engrave-style-chosen');
    //Now set the form value for the font
    var value = Drupal.behaviors.sdPerlgemEngraving.searchClassValue($(this), 'value-').replace('value-', '');
    $(this).closest('form.engraving-form').find('input[name="MONOGRAM_FONT"]').val(value);
  });

  //Preview Button for Mobile
  $('.engraving-preview-popup .spp-engraving-preview .engraving-form .engraving-form-element-preview').find('a.engraving-preview').on('click', function(e) {
    e.preventDefault();
    Drupal.behaviors.sdPerlgemEngraving.analytics_event('preview', 'click');
    //Hide this preview block
    $(this).closest('.engraving-form-element-preview').hide();
    //Hide the main form
    $(this).closest('.engraving-form').find('.engraving-edit-form').hide();
    //Show Add To Bag button
    $(this).closest('.engraving-form').find('.engraving-save').show();
    //Show Preview Image
    $(this).closest('.engraving-form').find('.engraving-form-preview').show();

    Drupal.behaviors.sdPerlgemEngraving.resizeEngravingOnMobile();
  });
  //Back button inside preview for Mobile
  $('.engraving-preview-popup .spp-engraving-preview .engraving-form .engraving-form-preview').find('.overlay-left-arrow-nav a.back-preview').on('click', function(e) {
    e.preventDefault();
    //Hide the Add to Bag button
    // $(this).closest('.engraving-form').find('.engraving-save').hide();
    //Hide Preview Image
    $(this).closest('.engraving-form').find('.engraving-form-preview').hide();
    //Show the preview block
    $(this).closest('.engraving-form').find('.engraving-form-element-preview').show();
    //Show the main form
    $(this).closest('.engraving-form').find('.engraving-edit-form').show();
  });

  //Bind keyup, keydown paste and autocomplete for input text fields
  $('.engraving-preview-popup .spp-engraving-preview .engraving-form input.engraving-message').on('input', function() {
    var $msgTextNode = $(this);
    //If we have copy set the font style on input
    if ($msgTextNode.val().length) {
      var $engraveStyle = $(this).closest('form.engraving-form').find('.engrave-style-chosen');
      var theClass = Drupal.behaviors.sdPerlgemEngraving.searchClassValue($engraveStyle, 'engrave-choice-');
      Drupal.behaviors.sdPerlgemEngraving.removeClassPrefix($msgTextNode, 'engrave-choice-');
      $msgTextNode.addClass(theClass);
    } else {
      Drupal.behaviors.sdPerlgemEngraving.removeClassPrefix($msgTextNode, 'engrave-choice-');
    }
    //Update Char count
    var currentLength = $msgTextNode.val().length;
    var maxLength = $msgTextNode.attr('maxlength') || 10;
    //Check and force the length of the field whilst typing
    if (currentLength > maxLength) {
      $msgTextNode.val($msgTextNode.val().substr(0, maxLength));
      return false;
    } else {
      //Update the preview copy
      var theId = $msgTextNode.attr('id').replace('txt-', 'preview-');
      $msgTextNode.closest('.engraving-form').find('.new-canvas').find('#' + theId).val($(this).val());
    }

    //Now update the counter
    var messageLenNode = $msgTextNode.closest('.engraving-form-line').find('.chars-left');
    if (messageLenNode.length) {
      messageLenNode.html($msgTextNode.val().length + '/' + maxLength);
    }
  });

  //Return key within text field
  $('.engraving-preview-popup .spp-engraving-preview .engraving-form input.engraving-message').on('keydown', function(e) {
    if (e.keyCode === 13) {
      $(this).closest('.engraving-form').find('.edit-engraving-form-cta a.engraving-save').trigger('click');
    }
  });

  //Cancel
  $('.engraving-preview-popup .spp-engraving-preview .engraving-form .edit-engraving-form-cta a.engraving-cancel').on('click', function(e) {
    e.preventDefault();
    Drupal.behaviors.sdPerlgemEngraving.analytics_event('cancelled', 'click');
    generic.overlay.hide();
  });

  //Add to Cart
  $('.engraving-preview-popup .spp-engraving-preview .engraving-form .edit-engraving-form-cta a.engraving-save').on('click', function(e) {
    e.preventDefault();
    Drupal.behaviors.sdPerlgemEngraving.analytics_event('added to cart', 'click');
    var $form = $(this).closest('form.engraving-form');
    // retrieve form data
    var params = Drupal.behaviors.sdPerlgemEngraving.engravingJSON($form);
    //error messages
    var $errorNode = $form.find('ul.error_messages');
    //when used from bespoke gifting grid
    var useOverride = $(this).hasClass('use-override') ? true : false;
    if (useOverride) {
      params['action'] = 'validate';
    }
    generic.jsonrpc.fetch({
      method: 'form.rpc',
      params: [params],
      onBoth: function(r) {
        var messages = r.getMessages();
        //Filter messages to remove SUCCESS messages
        if (messages) {
          messages = $.grep(messages, function(e) {
            return $.inArray('SUCCESS', e.tags) === -1;
          });
        }
        //Filter messages to remove SUCCESS messages
        //If we have error messages aftr stripping SUCCESS tags then show them otherwise we're successful
        if (messages && messages.length) {
          generic.showErrors(messages, $errorNode, $form);
        } else {
          if (useOverride) {
            // leaving this here as i'm not sure but we might need it for other locals
            // will be easier to track, implement
            //  $(document).trigger('quickshop:engraving:submit', params);
          } else {
            var resultData = r.getData();
            $(document).trigger('addToCart.success', [resultData]);
            generic.overlay.hide();
          }
        }
        //If we have error messages aftr stripping SUCCESS tags then show them otherwise we're successful
      }
    });
  });
};

(function($) {
  var isMobile = 0;
  if (typeof Unison !== 'undefined') {
    var bps = Unison.fetch.all();
    var bp = Unison.fetch.now();
    isMobile = parseInt(bp.width, 10) < parseInt(bps.landscape, 10);
  }

  $(document).on('perlgem.engraving.open', function(e, args) {
    Drupal.behaviors.sdPerlgemEngraving.analytics_event('overlay', '1st page loaded');
    if (!args.skuBaseId) {
      return;
    }
    var query = '?SKU_BASE_ID=' + args.skuBaseId;
    query += args.personaliseEngraving ? '&page=' + args.personaliseEngraving : '';
    Drupal.behaviors.sdPerlgemEngraving.openEngraving(query);
  });

  Drupal.behaviors.sdPerlgemEngraving = {
    attach: function(context, settings) {
      var self = this;
      if (self.attached) {
        return;
      }
      self.attached = true;
    },

    searchClassValue: function($elem, prefix) {
      var theClass = $elem.attr('class').match(new RegExp(prefix + '[0-9a-zA-Z]+(s+)?', 'g'));
      if (Array.isArray(theClass)) {
        return theClass[0];
      }
      return false;
    },

    removeClassPrefix: function($elem, prefix) {
      $elem.each(function(i, $el) {
        var classes = $el.className.split(' ').filter(function(c) {
          return c.lastIndexOf(prefix, 0) !== 0;
        });
        $el.className = $.trim(classes.join(' '));
      });
    //  return $elem;
    },

    engravingJSON: function($form) {
      var formSerial = $form.serializeArray();
      // transform string into array of form elements
      var paramStr = '';
      var params = {};
      // iterate through collection to transform form name/value into key/value properties of a literal object string.
      $.each(formSerial, function() {
        var key = this.name, value = this.value;
        if (params[key]) { //If the key exists
          if (!Array.isArray(params[key])) { //and its not current already an array
            params[key] = new Array(params[key], value); //Then create a new array with Stirng as key 0 and this value as key 1
          } else {
            params[key].push(value); //Otherwise if its already an array lets add the new value to the array say 3rd or 4th input
          }
        } else {
          params[key] = value; //Otherwise its a simply string store
        }
      });
      //Join MONOGRAM_TEXT array if we have multiple lines
      if (Array.isArray(params['MONOGRAM_TEXT'])) {
        params['MONOGRAM_TEXT'] = params['MONOGRAM_TEXT'].filter(function(val) {
          return val.trim() ? val : false;
        }).join('[BR]');
      }
      // leaving this here, as i'm not sure what was the purpose of it, should remove once we start use the engraving,
      // and everything works without it
      // $.each(params, function(key, value) {
      //   paramStr += '"' + key + '":"' + value + '",';
      // });
      return params;
      // parse the string and create the literal object
      // return eval('(' + '{' + paramStr.substring(0, paramStr.length - 1) + '}' + ')');
    },

    resizeEngravingOnMobile: function() {
      if (isMobile) {
        $('.engraving-preview-popup').colorbox.resize();
      }
    },

    openEngraving: function(query) {
      var path = '/templates/engraving-qvform.tmpl' + query;
      var abp = Unison.fetch.all();
      var cbp = Unison.fetch.now();
      var isMob = parseInt(cbp.width, 10) < parseInt(abp.landscape, 10);
      var maxHeight = isMob && Drupal?.settings?.engraving_popup_maxheight ? Drupal.settings.engraving_popup_maxheight : '541px';

      if (Drupal?.settings?.is_hub_translated_tdc_enabled && Drupal?.settings?.pathPrefix) {
        path = "/" + Drupal.settings.pathPrefix + path.substring(1);
      }

      var self = this;
      generic.template.get({
        path,
        callback: function(html) {
          generic.overlay.launch({
            content: $(html),
            cssClass: 'engraving-preview-popup',
            center: true,
            width: '100%',
            maxWidth: '926px',
            height: '100%',
            maxHeight: maxHeight,
            lockPosition: false,
            opacity: 0.5,
            includeBackground: true,
            backgroundNodeClickHide: true,
            onComplete: function(overlay) {
              try {
                site.sd_engraving();
              } catch (e) {
              }
            }
          });
        },
        object: []
      });
    },
    attached: false,

    analytics_event: function(eventAction, eventLabel) {
      site.track.evtLink({
        event_name: 'engraving',
        event_category: 'engraving',
        event_action: eventAction,
        event_label: eventLabel
      });
    }
  };
})(jQuery);
