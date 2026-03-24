window.site = window.site || {};

site.template = (function($) {
  site.templates = site.templates || {};
  site.translations = site.translations || {};

  var defaults = {
    globals: {
      t: site.translations,
      variables: {
        // IE doesn't support location.origin, so...
        site_url: window.location.protocol + '//' + window.location.hostname
      }
    }
  };

  // include config settings from brand common module
  if (typeof Drupal !== 'undefined' && typeof Drupal.settings !== 'undefined' && typeof Drupal.settings.common !== 'undefined') {
    $.extend(defaults.globals.variables, Drupal.settings.common);
  }

  var public = {
    get: function(args) {
      var template = site.templates[args.name];

      // If that didn't work, search for a versioned match of the same template
      // (eg. template_v2)
      if (!template && args.name) {
        for (var key in site.templates) {
          if (site.templates.hasOwnProperty(key)) {
            var matcher = new RegExp(args.name + "_v(\\d+)$");
            if (matcher.test(key)) {
              template = site.templates[key];
              break;
            }
          }
        }
      }

      if (typeof template === 'undefined') {
        console.log('The template ' + args.name + ' cannot be found');
      }

      var rendered = this.render(template, args.data);

      if ($.isFunction(args.callback)) {
        var so = args.callback(rendered);
        if (typeof so !== 'undefined') {
          return so;
        }
      }

      return rendered;
    },

    render: function(template, data) {
      defaults.globals.t = site.translations;
      data = data || {};

      // You can pass just the template as a string if you want:
      if ($.type(template) === 'string') {
        template = {
          content: template,
          data: {}
        };
      }

      var view = $.extend({}, defaults, template.data, data);
      var partials = {};

      if (typeof template.partials !== 'undefined') {
        $.each(template.partials, function(key, name) {
          if (typeof site.templates[key] === 'undefined' && typeof site.templates[name] === 'undefined') {
            console.log('The partial ' + key + ' or ' + name + ' cannot be found');
          }

          var pkey = (typeof site.templates[key] !== 'undefined') ? key : name;
          partials[pkey] = site.templates[pkey].content;
        });
      }

      return Mustache.render(template.content, view, partials);
    }
  };

  return public;
})(
  window.jQuery = window.jQuery || function(){}
);
