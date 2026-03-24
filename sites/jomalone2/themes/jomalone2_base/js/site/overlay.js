(function($, generic) {
  // Route the old perlgem overlay method to colorbox:
  generic.overlay = {
    launch: function(args, event) {
      if (typeof event !== 'undefined') {
        event.preventDefault();
      }
      // ColorBox args sent along
      var cboxArgs = {
        'height': 'auto',
        'width': '768px',
        'margin': 'auto'
      };
      // Smoosh in any overrides from other calls, looks like args.cssStyle
      _.extend(cboxArgs, args);
      _.extend(cboxArgs, args.cssStyle); // get height/width overrides
      // When mobile, override any height/width and set to 100%
      if ($(window).width() <= 768) {
        _.extend(cboxArgs, {height: 'auto', width: '100%'});
      }
      // Actual content of the overlay
      if (typeof args.content !== 'undefined') {
        cboxArgs.html = args.content;
      }
      // A custom class each launcher has the option of setting
      if (typeof args.cssClass !== 'undefined') {
        cboxArgs.className = args.cssClass;
      }
      // Scroll to an anchor, if sent over
      if (typeof args.inPageAnchor !== 'undefined') {
        cboxArgs.onComplete = function() {
          $('#cboxLoadedContent').scrollTo($('#' + args.inPageAnchor), 50);
        };
      }
      // Launch it
      $.colorbox(cboxArgs);
    },

    initLinks: function() {
      // Give us access to the parent scope so we can hit .launch()
      var self = this;
      // Links are tiggered via class, but indicate if already processed
      var $triggers = $('.overlay-link:not(.overlay-ready)').addClass('overlay-ready');

      // Depending on the type of link, the overlay needs to do something unique
      $triggers.each(function() {
        var args = { cssStyle: {} }; // args sent to overlay
        var linkClassNames = $(this).attr('class'); // class name sent to colorbox
        var linkHref = $(this).attr('href'); // actual href
        var linkHrefWithEmbed = linkHref;
        var inPageAnchor = $(this).data('inpage-anchor'); // see try/catch below
        var overlayElement = $(this).data('overlay-content'); // use an existing element as content

        // used in overlay linking below
        var urlParts = document.createElement('a'); //
        urlParts.href = linkHref; //

        // Parse height options out of the link's class
        var widthRegexResults = linkClassNames.match(/overlay-width-(\d+)/);
        if (widthRegexResults) {
          args.cssStyle.width = widthRegexResults[1];
        }
        // Parse width options
        var heightRegexResults = linkClassNames.match(/overlay-height-(\d+)/);
        if (heightRegexResults) {
          args.cssStyle.height = heightRegexResults[1];
        }
        // Add a custom class, optionally
        var cssClassRegexResults = linkClassNames.match(/overlay-addclass-([a-z\-\_]+)/);
        if (cssClassRegexResults) {
          args.className = cssClassRegexResults[1];
        }

        // Make sure embed doesn't already exist. This gets added form internal
        // drupal embeddable urls
        if (typeof overlayElement !== 'undefined') {
          args.content = $(overlayElement).html();
        } else {
          try {
            if (!linkHref.match(/[\&\?]embed=1($|&)/)) {
              linkHrefWithEmbed = urlParts.pathname + (urlParts.search === '' ? '?' : urlParts.search + '&') + 'embed=1' + urlParts.hash;

              // Retain original link if it included the protocol.
              if (linkHref.match(/https?:\/\//)) {
                linkHrefWithEmbed = urlParts.protocol + '//' + urlParts.host + linkHrefWithEmbed;
              }
            }
          } catch (e) {
            linkHrefWithEmbed = linkHref;
          }

          // Fix the link within the page
          $(this).attr('href', linkHrefWithEmbed);
          // But this is actually used to launch overlay
          args.href = linkHrefWithEmbed;
        }

        // scrollTo behavior if we have a data attribute
        if (typeof inPageAnchor !== 'undefined') {
          args.inPageAnchor = inPageAnchor;
        }

        // Launch a colorbox overlay
        $(this).on('click', function(e) {
          // use our canonical launch function for all the goodies
          self.launch(args, e);
        });
      }); // .each()
    }, // initLinks

    hide: function() {
      $.colorbox.close();
    },

    getRBKeys: function() {
      generic.rb.language = generic.rb('language');
      generic.rb.language.rb_close = generic.rb.language.get('close');
    }
  };

  (function() {
    generic.overlay.getRBKeys();
    generic.overlay.initLinks();
  });
})(jQuery, window.generic || {});
