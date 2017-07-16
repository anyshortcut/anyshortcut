import _ from "lodash";

// Lodash templates
const shortcutNotFound = '<p>The <%- shortcutType %> shortcut key <span class="anyshortcut-shortcut"><%- key %></span>not bound for this domain yet!</p>';

const queryShortcutFailed = '<p>Neither <span class="anyshortcut-shortcut">SHIFT+ALT+<%- firstKey %><%- secondKey %></span> nor <span class="anyshortcut-shortcut">SHIFT+ALT+<%- firstKey %>➯<%- secondKey %></span> bound yet!</p>';

const queryShortcutChooser = `<ul>
                            <% _.forEach(shortcuts, function(shortcut, key) { %>
                            <li><div>
                            <%- key + 1 %> <img class="shortcut-favicon" src="<%- shortcut.favicon %>" alt="favicon"> <%- shortcut.comment %>
                            </div></li>
                            <% }); %> 
                        </ul>`;

const shortcutList = `<div>Secondary shortcuts for <span class="anyshortcut-shortcut">ALT+SHIFT+<%- key %></span><ul>
                            <% _.forOwn(shortcuts, function(shortcut) { %>
                            <li><div>
                            <%- shortcut.key %> <img class="shortcut-favicon" src="<%- shortcut.favicon %>" alt="favicon"> <%- shortcut.comment %>
                            </div></li>
                            <% }); %> 
                      </ul></div>`;

const shortcutListEmpty = `<img class="grey-balloons" alt="">
                         <div>No secondary shortcuts for 
                             <span class="anyshortcut-shortcut">ALT+SHIFT+<%- key %></span>
                         </div>`;

export default {
    shortcutNotFound,
    queryShortcutFailed,
    queryShortcutChooser,
    shortcutList,
    shortcutListEmpty,
    compile(template, data){
        return _.template(template)(data);
    }
};