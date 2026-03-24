var lpTag = window.lpTag || {};
var deviceName = 'unknown';

function findDeviceName(userAgent) {
  var iosList = ['ipad', 'iphone', 'ipod'];

  if (userAgent.toLowerCase().includes('windows phone')) {
    deviceName = 'Windows';
  } else if (userAgent.toLowerCase().includes('android')) {
    deviceName = 'Android';
  } else if (iosList.some((item) => userAgent.toLowerCase().includes(item)) && !window.MSStream) {
    deviceName = 'iOS';
  }

  return deviceName;
}

function getMobileOS() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  return findDeviceName(userAgent);
}

if (window.location === window.parent.location) {
  lpTag.section = [Drupal.settings?.lp?.site_name];

  if (Drupal.settings?.lp?.sms_chat) {
    deviceName = getMobileOS().toLowerCase();

    $('.js-' + deviceName).removeClass('hidden');
    lpTag.section.push('bb_' + deviceName);
  }
}
