var __phone_order__ = function($) {
  $('#csr_header').draggable({handle: '#csr_dragger'});
}(jQuery);

// POA - CSI recording
(function ($, settings, site, generic) {
  var isCsrActive = false;
  var isPaymentPanelActive = false;
  var _cookie = {
    state: 'POA_RECORDING_STATE',
    email: 'POA_RECORDING_EMAIL',
    getState: function() {
      return Number(this._get(this.state));
    },
    setState: function(value) {
      this._set(this.state, value);
    },
    getEmail: function() {
      return this._get(this.email);
    },
    setEmail: function(value) {
      this._set(this.email, value);
    },
    _get: function(name) {
      return generic.cookie(name);
    },
    _set: function(name, value) {
      generic.cookie(name, value, {path: '/', expires: 1});
    },
  }

  function init() {
    var data = {
      WinName: '',
      TagField01: '', // LIGHTS_OUT_START / LIGHTS_OUT_STOP
      TagField02: '', // brand_id
      TagField03: '', // region_id
      TagField04: '', // environment
    }
    if (settings.perlgem && settings.perlgem.pg_reqs) {
      var pg_reqs = settings.perlgem.pg_reqs.split(/[&=]/);
      $.each(pg_reqs, function(index, value) {
        switch(value) {
          case 'brand_id':
            data.TagField02 = pg_reqs[index + 1];
            break;
          case 'region_id':
            data.TagField03 = pg_reqs[index + 1];
            break;
          default:
            break;
        }
      });
      if (settings.env) {
        data.TagField04 = settings.env;
      }
    }

    // on page load, wait for both user.loaded and checkout panel activation (if on checkout) to trigger
    Promise.all([getLoggedUser(), checkoutPaymentPanel()]).then(function(result) {
      var user = result[0];
      isPaymentPanelActive = result[1];
      isCsrActive = user && isCsr(user);
      data.WinName = isCsrActive ? user.csr_email : _cookie.getEmail();
      record(data);
    });

    // bind for active checkout panel
    $(document).bind('checkout:panel:displayed', function(e, args) {
      isPaymentPanelActive = isPaymentPanel(args);
      if (isCsrActive) {
        record(data);
      }
    });
  }

  function record(data) {
    if (isCsrActive && !isPaymentPanelActive) {
      startRecording(data);
    } else {
      stopRecording(data);
    }
  }

  function checkoutPaymentPanel() {
    return new Promise(function(resolve, reject) {
      if (isCheckout()) {
        $(document).bind('checkout:panel:displayed', function(e, args) {
          resolve(isPaymentPanel(args));
        });
      } else {
        resolve(false);
      }
    });
  }

  function getLoggedUser() {
    return new Promise(function(resolve, reject) {
      $(document).ready(function() {
        var signedIn = Number(site.userInfoCookie.getValue('signed_in')) === 1 || Number(site.userInfoCookie.getValue('csr_logged_in')) === 1;
        if (signedIn) {
          $(document).bind('user.loaded', function(e, user) {
            resolve(user);
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  function isCsr(args) {
    return (args && args['csr_email'] !== undefined) && (args['csr_email'] !== null);
  }

  function isCheckout() {
    return site.checkout !== undefined && site.panels !== undefined;
  }

  function isPaymentPanel(args) {
    return args.panelName === 'review' && args.statesKey === 'checkout_index';
  }

  function toggleRecordingIcon(state) {
    var $poa = $('#csr_info_box');
    if (!$poa.length) {
      return;
    }
    var $icon = $('#csr_recording_icon');
    if (!$icon.length) {
      $icon = $('<div/>', {id: 'csr_recording_icon'});
      $icon.appendTo($poa);
    }
    $icon.toggleClass('csr_recording_green', state);
    $icon.toggleClass('csr_recording_red', !state);
  }

  function startRecording(data) {
    if (_cookie.getState()) {
      //already started
      toggleRecordingIcon(true);
      return;
    }
    data.TagField01 = 'LIGHTS_OUT_STOP';
    _csiRequest(data)
      .then(function(message) {
        _cookie.setState(1);
        _cookie.setEmail(data.WinName);
        toggleRecordingIcon(true);
      })
      .catch(function(message) {
        console.log('Cannot start recording - Error: ', message);
      });
  }

  function stopRecording(data) {
    if (!_cookie.getState()) {
      //already stopped or not started
      toggleRecordingIcon(false);
      return;
    }
    data.TagField01 = 'LIGHTS_OUT_START';
    _csiRequest(data)
      .then(function(message) {
        _cookie.setState(0);
        toggleRecordingIcon(false);
      })
      .catch(function(message) {
        console.log('Cannot STOP recording - Error: ', message);
      });
  }

  function _csiRequest(params) {
    return new Promise(function(resolve, reject) {
      generic.jsonrpc.fetch({
        method: 'csi.request',
        params:[params],
        onBoth: function(jsonRpcResponse) {
          var response = jsonRpcResponse.getValue();
          if (response) {
            if (response.success) {
              resolve(response.message)
            } else {
              reject(response.message)
            }
          } else {
            reject('No response from CSI API');
          }
        }
      });
    });
  }

  // init if enabled on domains/[locale].inc
  if (settings.poa_recording) {
    init();
  }

})(jQuery, Drupal.settings || {}, site || {}, generic || {});
