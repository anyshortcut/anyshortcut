import _ from "lodash";

// Lodash templates
const modalHeader = `<a class="brand" href="https://anyshortcut.com" target="_blank">
    <img class="brand-logo" alt="">
    <span>anyshortcut</span>
</a>
<div class="anyshortcut-modal-close" id="anyshortcut-modal-close">X</div>`;

const primaryShortcutBindSuccess = '<div>Congratulation, primary shortcut bind success! You can quickly open the website with <span class="anyshortcut-shortcut"><%- key %></span></div>';
const secondaryShortcutBindSuccess = `<div>
                                            <p>Congratulation, secondary shortcut bind success!</p>
                                            <p>There are two way to open secondary shortcut</p>
                                            <ul>
                                                <li>Click <span class="anyshortcut-shortcut">ALT+<%- key %></span> in any <%- primaryShortcut.domain %> page</li>
                                                <li>Click <span class="anyshortcut-shortcut">SHIFT+ALT+<%- primaryShortcut.key %>+<%- key %></span> in any website page</li>
                                            </ul>
                                      </div>`;
const shortcutNotFound = '<p>The <%- shortcutType %> shortcut key <span class="anyshortcut-shortcut"><%- key %></span>not bound for this domain yet!</p>';

const queryShortcutFailed = '<p>Neither <span class="anyshortcut-shortcut">SHIFT+ALT+<%- firstKey %><%- secondKey %></span> nor <span class="anyshortcut-shortcut">SHIFT+ALT+<%- firstKey %>➯<%- secondKey %></span> bound yet!</p>';

const queryShortcutChooser = `
    <ul>
        <% _.forEach(shortcuts, function(shortcut, key) { %>
        <li class="anyshortcut-shortcut-item">
            <span class="anyshortcut-secondary-shortcut" title="<%- shortcut.title %>"><%- key + 1 %></span>
            <img class="shortcut-favicon" src="<%- shortcut.favicon %>" alt="favicon">
            <a href="<%- shortcut.url %>" title="<%- shortcut.url %>" target="_blank"><%- shortcut.comment %></a>
        </li>
        <% }); %>
    </ul>`;

const shortcutList = `<div>Secondary shortcuts for <span class="anyshortcut-shortcut">ALT+SHIFT+<%- key %></span>
    <ul>
        <% _.forOwn(shortcuts, function(shortcut) { %> 
        <li class="anyshortcut-shortcut-item">
            <span class="anyshortcut-secondary-shortcut" title="<%- shortcut.title %>"><%- shortcut.key %></span>
            <a href="<%- shortcut.url %>" title="<%- shortcut.url %>" target="_blank"><%- shortcut.comment %></a>
        </li>
        <% }); %>
    </ul>
</div>`;

const shortcutListEmpty = `<img class="grey-balloons" alt="">
<div>No secondary shortcuts for
    <span class="anyshortcut-shortcut">ALT+SHIFT+<%- key %></span>
</div>`;

export default {
    modalHeader,
    primaryShortcutBindSuccess,
    secondaryShortcutBindSuccess,
    shortcutNotFound,
    queryShortcutFailed,
    queryShortcutChooser,
    shortcutList,
    shortcutListEmpty,
    compile(template, data) {
        return _.template(template)(data);
    }
};