import utils from './utils';
import helper from './helper';
import type { DomainShortcuts } from '../types';

let popup: HTMLElement | null = null;
let circle: HTMLElement | null = null;
/**
 * A flag indicates whether the key was pressed.
 */
let keyPressed = false;

const circleIconUrl = chrome.runtime.getURL('icon/icon32.png');
const circleCloseUrl = chrome.runtime.getURL('icon/close.png');

function buildCircle(): HTMLElement {
  const circle = utils.createDiv('anyshortcut-circle');
  const img = document.createElement('img');
  img.className = 'anyshortcut-circle-icon';
  img.src = circleIconUrl;

  circle.appendChild(img);
  return circle;
}

function showShortcutPopup(): void {
  // List latest secondary shortcut at each shortcut popup show time
  chrome.runtime.sendMessage(
    {
      listSecondary: true,
      url: location.href,
    },
    (response: { shortcuts: DomainShortcuts | null } | undefined) => {
      if (!response || !circle) return;

      popup = utils.createDiv('anyshortcut-popup');
      const shortcuts = response.shortcuts;

      if (shortcuts && Object.keys(shortcuts).length > 0) {
        popup.innerHTML = utils.compile('shortcut-popup', { shortcuts: response.shortcuts });
      } else {
        popup.innerHTML = utils.compile('shortcut-list-empty', {
          image: chrome.runtime.getURL('img/grey-balloons.svg'),
        });
      }
      // Stop popup click event propagation to document.
      popup.addEventListener('click', (event) => {
        event.stopPropagation();
      });
      document.body.insertAdjacentElement('beforebegin', popup);

      const icon = circle.firstChild as HTMLImageElement;
      icon.classList.remove('anyshortcut-circle-icon');
      icon.classList.add('anyshortcut-circle-close');
      icon.src = circleCloseUrl;
    }
  );
}

function hideShortcutPopup(): void {
  if (popup && circle) {
    popup.remove();
    popup = null;
    const icon = circle.firstChild as HTMLImageElement;
    icon.classList.add('anyshortcut-circle-icon');
    icon.classList.remove('anyshortcut-circle-close');
    icon.src = circleIconUrl;
  }
}

export default {
  injectCircle(): void {
    // Register key and click event in all iframe.
    document.addEventListener(
      'keydown',
      (e) => {
        if (helper.isActiveElementEditable()) {
          return;
        }
        if (helper.isValidKeyCode(e.keyCode) && helper.withoutAnyModifier(e)) {
          const keyCodeChar = String.fromCharCode(e.keyCode);

          if (window.isQueryShortcutChooserShowing && ['1', '2'].includes(keyCodeChar)) {
            return;
          }

          // Stop event propagation in capture phase.
          e.stopPropagation();

          // Prevent repeat
          if (e.repeat) {
            return;
          }

          keyPressed = true;
        }
      },
      true
    );

    document.addEventListener(
      'keyup',
      (e) => {
        if (helper.isActiveElementEditable()) {
          return;
        }

        if (helper.isValidKeyCode(e.keyCode) && helper.withoutAnyModifier(e)) {
          const keyCodeChar = String.fromCharCode(e.keyCode);

          if (window.isQueryShortcutChooserShowing && ['1', '2'].includes(keyCodeChar)) {
            return;
          }

          if (keyPressed) {
            // Stop event propagation in capture phase.
            e.stopPropagation();

            chrome.runtime.sendMessage({
              jumpSecondary: true,
              url: location.href,
              key: keyCodeChar,
            });
            keyPressed = false;
          }
        }
      },
      true
    );

    // Auto hide shortcut popup when user click outside of popup.
    document.addEventListener('click', hideShortcutPopup);

    // Only inject circle in top window, ignore all iframe
    if (helper.isTopWindow()) {
      circle = buildCircle();
      circle.onclick = () => {
        if (popup) {
          hideShortcutPopup();
        } else {
          showShortcutPopup();
        }
      };

      document.body.insertAdjacentElement('beforebegin', circle);
    }
  },
};
