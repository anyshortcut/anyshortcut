import modal from './modal';
import monitor from './key-event-monitor';
import circle from './circle';
import type { BindSuccessMessage } from '../types';
import '../scss/content-script.scss';

// Register key events as early as possible.
document.addEventListener('keyup', monitor.onKeyUp, false);
document.addEventListener('keydown', monitor.onKeyDown, false);

chrome.runtime.sendMessage(
  { info: true, url: location.href },
  (response: { showCircle: boolean; delay: boolean } | undefined) => {
    if (!response) return;
    if (response.showCircle) {
      if (document.readyState !== 'loading') {
        circle.injectCircle();
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          circle.injectCircle();
        });
      }
    }
    // Store current primary shortcut delay state.
    window.delay = response.delay;
  }
);

chrome.runtime.onMessage.addListener(function (message: BindSuccessMessage) {
  switch (true) {
    case message.bindSuccess: {
      window.delay = message.delay;

      const shortcut = message.shortcut;
      if (shortcut.primary) {
        modal.showPrimaryShortcutBindSuccess(message.combinationKey, shortcut);
      } else if (message.primaryShortcut) {
        modal.showSecondaryShortcutBindSuccess(
          message.combinationKey,
          shortcut,
          message.primaryShortcut
        );
      }
      break;
    }
  }
});
