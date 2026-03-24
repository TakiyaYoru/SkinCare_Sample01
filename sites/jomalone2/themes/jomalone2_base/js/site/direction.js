var site = window.site || {};
var html_dir = document.getElementsByTagName('html')[0].getAttribute('dir');

site.direction = site.direction || {};
site.direction.isRTL = (html_dir && html_dir === 'rtl');
