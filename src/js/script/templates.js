import _ from "lodash";

export default {
    modalHeader: require('../../templates/modal-header.html'),
    primaryShortcutBindSuccess: require('../../templates/primary-bind-success.html'),
    secondaryShortcutBindSuccess: require('../../templates/secondary-bind-success.html'),
    shortcutNotFound: require('../../templates/shortcut-not-found.html'),
    queryShortcutFailed: require('../../templates/query-shortcut-failed.html'),
    queryShortcutChooser: require('../../templates/query-shortcut-chooser.html'),
    shortcutList: require('../../templates/shortcut-list.html'),
    shortcutListEmpty: require('../../templates/shortcut-list-empty.html'),
    compile(template, data) {
        return _.template(template)(data);
    }
};