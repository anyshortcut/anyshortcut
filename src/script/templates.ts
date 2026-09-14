// Precompiled lodash templates (see ../templates/*.html for the sources),
// converted to an ES module so the bundler can tree-shake lodash-es down
// to the three helpers actually used.
import { escape, forEach, forOwn } from 'lodash-es';
import type { Shortcut } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const templates: Record<string, (data?: any) => string> = {};

templates['authenticate-required'] = function () {
  return (
    '<p>Please sign in to sync all your shortcuts.</p>\n' +
    '<a class="anyshortcut-sign-in-link" href="https://anyshortcut.com/account" target="_blank">\n' +
    '    Sign in\n' +
    '</a>'
  );
};

templates['modal-header'] = function (data: { logo: string }) {
  return (
    '<a class="anyshortcut-brand" href="https://anyshortcut.com" target="_blank">\n' +
    '    <img class="anyshortcut-brand-logo" src="' +
    escape(data.logo) +
    '" alt="">\n</a>\n' +
    '<div class="anyshortcut-modal-close" id="anyshortcut-modal-close">X</div>'
  );
};

templates['primary-bind-success'] = function (data: { combinationKey: string; key: string }) {
  return (
    '<p>Good job, the primary shortcut bind success! </p>\n' +
    '<div class="anyshortcut-text-description">\n' +
    '    You can quickly open the website page with <span class="anyshortcut-shortcut">' +
    escape(data.combinationKey) +
    ' + ' +
    escape(data.key) +
    '</span>\n</div>'
  );
};

templates['query-shortcut-chooser'] = function (data: { shortcuts: Shortcut[] }) {
  let html = '<p>Which shortcut did you mean?</p>\n<ul class="anyshortcut-shortcut-list">\n    ';
  forEach(data.shortcuts, function (shortcut, key) {
    html +=
      '\n    <li class="anyshortcut-shortcut-item">\n        <a href="' +
      escape(shortcut.url) +
      '" target="_blank">\n            <span class="anyshortcut-secondary-shortcut" title="' +
      escape(shortcut.title) +
      '">' +
      escape(String(key + 1)) +
      '</span>\n            <div>\n                <div>\n                    <img class="anyshortcut-favicon" src="' +
      escape(shortcut.favicon) +
      '" alt="">\n                    <span class="anyshortcut-comment">' +
      escape(shortcut.comment) +
      '</span>\n                </div>\n\n                <div class="anyshortcut-url">\n                    ' +
      escape(shortcut.url) +
      '\n                </div>\n            </div>\n        </a>\n    </li>\n    ';
  });
  html +=
    '\n</ul>\n<small class="anyshortcut-small-description">Click the number key (1 or 2) to open the website page</small>';
  return html;
};

templates['query-shortcut-failed'] = function (data: {
  combinationKey: string;
  firstKey: string;
  secondKey: string;
}) {
  return (
    '<p>\n    Neither <span class="anyshortcut-shortcut">' +
    escape(data.combinationKey) +
    ' + ' +
    escape(data.firstKey) +
    '' +
    escape(data.secondKey) +
    '</span> nor\n    <span class="anyshortcut-shortcut">' +
    escape(data.combinationKey) +
    ' + ' +
    escape(data.firstKey) +
    ' + ' +
    escape(data.secondKey) +
    '</span> bound yet!\n</p>'
  );
};

templates['secondary-bind-success'] = function (data: {
  combinationKey: string;
  key: string;
  primaryShortcut: Shortcut;
}) {
  return (
    '<p>Good job, the secondary shortcut bind success!</p>\n' +
    '<div class="anyshortcut-text-description">\n' +
    '    <p>There are two way to open the website page</p>\n    <ul>\n        <li>\n            Click <span class="anyshortcut-shortcut">' +
    escape(data.combinationKey) +
    ' + ' +
    escape(data.primaryShortcut.key) +
    ' + ' +
    escape(data.key) +
    '</span>\n            in any website page.\n        </li>\n        <li>\n            Click <span class="anyshortcut-shortcut">' +
    escape(data.key) +
    '</span> in any <b>' +
    escape(data.primaryShortcut.domain) +
    '</b> page.\n        </li>\n    </ul>\n</div>'
  );
};

templates['shortcut-list-empty'] = function (data: { image: string }) {
  return (
    '<img class="anyshortcut-grey-balloons" src="' +
    escape(data.image) +
    '" alt="">\n<div class="anyshortcut-text-description">\n    No secondary shortcuts for this domain.\n</div>'
  );
};

templates['shortcut-not-found'] = function (data: {
  shortcutType: string;
  combinationKey: string;
  key: string;
}) {
  return (
    '<p>\n    The ' +
    escape(data.shortcutType) +
    ' shortcut <span class="anyshortcut-shortcut">' +
    escape(data.combinationKey) +
    ' + ' +
    escape(data.key) +
    '</span>\n    not bound yet!\n</p>'
  );
};

templates['shortcut-popup'] = function (data: { shortcuts: Record<string, Shortcut> }) {
  let html = '<ul>\n    ';
  forOwn(data.shortcuts, function (shortcut) {
    html +=
      '\n    <li class="anyshortcut-shortcut-item">\n        <a href="' +
      escape(shortcut.url) +
      '">\n            <span class="anyshortcut-secondary-shortcut" title="' +
      escape(shortcut.title) +
      '">' +
      escape(shortcut.key) +
      '</span>\n            <div>\n                <div>\n                    <img class="anyshortcut-favicon" src="' +
      escape(shortcut.favicon) +
      '" alt="">\n                    <span class="anyshortcut-comment">' +
      escape(shortcut.comment) +
      '</span>\n                </div>\n\n                <div class="anyshortcut-url">\n                    ' +
      escape(shortcut.url) +
      '\n                </div>\n            </div>\n        </a>\n    </li>\n    ';
  });
  html +=
    '\n</ul>\n<small class="anyshortcut-small-description">Click specific key to open the website page</small>';
  return html;
};

templates['subscription-expired'] = function () {
  return (
    '<p class="anyshortcut-text-description">\n' +
    '    Sorry, your free trial has expired, all features are disabled temporary.\n' +
    '    Please subscribe to reactive it.\n</p>\n<br>\n' +
    '<a class="anyshortcut-subscribe-button" href="https://anyshortcut.com/account#/subscription" target="_blank">Subscribe Now</a>\n'
  );
};

templates['wrong-combination-key'] = function (data: {
  combinationKey: string;
  wrongCombinationKey: string;
}) {
  return (
    '<p>\n    You combination key is <span class="anyshortcut-shortcut">' +
    escape(data.combinationKey) +
    '</span> not\n    <span class="anyshortcut-shortcut">' +
    escape(data.wrongCombinationKey) +
    '</span>.\n</p>\n<p>Did you forget it? 😝</p>\n'
  );
};

export default templates;
