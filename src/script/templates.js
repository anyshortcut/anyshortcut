;(function() {
  var undefined;

  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  var root = freeGlobal || freeSelf || Function('return this')();

  var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

  var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

  var _ = root._ || {};

  /*----------------------------------------------------------------------------*/

  var templates = {
    'authenticate-required': {},
    'modal-header': {},
    'primary-bind-success': {},
    'query-shortcut-chooser': {},
    'query-shortcut-failed': {},
    'secondary-bind-success': {},
    'shortcut-list-empty': {},
    'shortcut-not-found': {},
    'shortcut-popup': {},
    'subscription-expired': {},
    'wrong-combination-key': {}
  };

  templates['authenticate-required'] =   function(data) {
  var __t, __p = '';
  __p += '<p>Please sign in to sync all your shortcuts.</p>\n<a class="anyshortcut-sign-in-link" href="https://anyshortcut.com/account" target="_blank">\n    Sign in\n</a>';
  return __p
  };

  templates['modal-header'] =   function(data) {
  var __t, __p = '', __e = _.escape;
  __p += '<a class="anyshortcut-brand" href="https://anyshortcut.com" target="_blank">\n    <img class="anyshortcut-brand-logo" src="' +
  __e( data.logo ) +
  '" alt="">\n</a>\n<div class="anyshortcut-modal-close" id="anyshortcut-modal-close">X</div>';
  return __p
  };

  templates['primary-bind-success'] =   function(data) {
  var __t, __p = '', __e = _.escape;
  __p += '<p>Good job, the primary shortcut bind success! </p>\n<div class="anyshortcut-text-description">\n    You can quickly open the website page with <span class="anyshortcut-shortcut">' +
  __e( data.combinationKey ) +
  ' + ' +
  __e( data.key ) +
  '</span>\n</div>';
  return __p
  };

  templates['query-shortcut-chooser'] =   function(data) {
  var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
  function print() { __p += __j.call(arguments, '') }
  __p += '<p>Which shortcut did you mean?</p>\n<ul class="anyshortcut-shortcut-list">\n    ';
   _.forEach(data.shortcuts, function(shortcut, key) {
  __p += '\n    <li class="anyshortcut-shortcut-item">\n        <a href="' +
  __e( shortcut.url ) +
  '" target="_blank">\n            <span class="anyshortcut-secondary-shortcut" title="' +
  __e( shortcut.title ) +
  '">' +
  __e( key + 1 ) +
  '</span>\n            <div>\n                <div>\n                    <img class="anyshortcut-favicon" src="' +
  __e( shortcut.favicon ) +
  '" alt="">\n                    <span class="anyshortcut-comment">' +
  __e( shortcut.comment ) +
  '</span>\n                </div>\n\n                <div class="anyshortcut-url">\n                    ' +
  __e( shortcut.url ) +
  '\n                </div>\n            </div>\n        </a>\n    </li>\n    ';
   }); ;
  __p += '\n</ul>\n<small class="anyshortcut-small-description">Click the number key (1 or 2) to open the website page</small>';
  return __p
  };

  templates['query-shortcut-failed'] =   function(data) {
  var __t, __p = '', __e = _.escape;
  __p += '<p>\n    Neither <span class="anyshortcut-shortcut">' +
  __e( data.combinationKey ) +
  ' + ' +
  __e( data.firstKey ) +
  '' +
  __e( data.secondKey ) +
  '</span> nor\n    <span class="anyshortcut-shortcut">' +
  __e( data.combinationKey ) +
  ' + ' +
  __e( data.firstKey ) +
  ' + ' +
  __e( data.secondKey ) +
  '</span> bound yet!\n</p>';
  return __p
  };

  templates['secondary-bind-success'] =   function(data) {
  var __t, __p = '', __e = _.escape;
  __p += '<p>Good job, the secondary shortcut bind success!</p>\n<div class="anyshortcut-text-description">\n    <p>There are two way to open the website page</p>\n    <ul>\n        <li>\n            Click <span class="anyshortcut-shortcut">' +
  __e( data.combinationKey ) +
  ' + ' +
  __e( data.primaryShortcut.key ) +
  ' + ' +
  __e( data.key ) +
  '</span>\n            in any website page.\n        </li>\n        <li>\n            Click <span class="anyshortcut-shortcut">' +
  __e( data.key ) +
  '</span> in any <b>' +
  __e( data.primaryShortcut.domain ) +
  '</b> page.\n        </li>\n    </ul>\n</div>';
  return __p
  };

  templates['shortcut-list-empty'] =   function(data) {
  var __t, __p = '', __e = _.escape;
  __p += '<img class="anyshortcut-grey-balloons" src="' +
  __e( data.image ) +
  '" alt="">\n<div class="anyshortcut-text-description">\n    No secondary shortcuts for this domain.\n</div>';
  return __p
  };

  templates['shortcut-not-found'] =   function(data) {
  var __t, __p = '', __e = _.escape;
  __p += '<p>\n    The ' +
  __e( data.shortcutType ) +
  ' shortcut <span class="anyshortcut-shortcut">' +
  __e( data.combinationKey ) +
  ' + ' +
  __e( data.key ) +
  '</span>\n    not bound yet!\n</p>';
  return __p
  };

  templates['shortcut-popup'] =   function(data) {
  var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
  function print() { __p += __j.call(arguments, '') }
  __p += '<ul>\n    ';
   _.forOwn(data.shortcuts, function(shortcut) {
  __p += '\n    <li class="anyshortcut-shortcut-item">\n        <a href="' +
  __e( shortcut.url ) +
  '">\n            <span class="anyshortcut-secondary-shortcut" title="' +
  __e( shortcut.title ) +
  '">' +
  __e( shortcut.key ) +
  '</span>\n            <div>\n                <div>\n                    <img class="anyshortcut-favicon" src="' +
  __e( shortcut.favicon ) +
  '" alt="">\n                    <span class="anyshortcut-comment">' +
  __e( shortcut.comment ) +
  '</span>\n                </div>\n\n                <div class="anyshortcut-url">\n                    ' +
  __e( shortcut.url ) +
  '\n                </div>\n            </div>\n        </a>\n    </li>\n    ';
   }); ;
  __p += '\n</ul>\n<small class="anyshortcut-small-description">Click specific key to open the website page</small>';
  return __p
  };

  templates['subscription-expired'] =   function(data) {
  var __t, __p = '';
  __p += '<p class="anyshortcut-text-description">\n    Sorry, your free trial has expired, all features are disabled temporary.\n    Please subscribe to reactive it.\n</p>\n<br>\n<a class="anyshortcut-subscribe-button" href="https://anyshortcut.com/account#/subscription" target="_blank">Subscribe Now</a>\n';
  return __p
  };

  templates['wrong-combination-key'] =   function(data) {
  var __t, __p = '', __e = _.escape;
  __p += '<p>\n    You combination key is <span class="anyshortcut-shortcut">' +
  __e( data.combinationKey ) +
  '</span> not\n    <span class="anyshortcut-shortcut">' +
  __e( data.wrongCombinationKey ) +
  '</span>.\n</p>\n<p>Did you forget it? 😝</p>\n';
  return __p
  };

  /*----------------------------------------------------------------------------*/

  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    define(['lodash'], function(lodash) {
      _ = lodash;
      lodash.templates = lodash.extend(lodash.templates || {}, templates);
    });
  }
  else if (freeModule) {
    _ = require('lodash');
    (freeModule.exports = templates).templates = templates;
    freeExports.templates = templates;
  }
  else if (_) {
    _.templates = _.extend(_.templates || {}, templates);
  }
}.call(this));
