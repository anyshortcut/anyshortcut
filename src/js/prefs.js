import client from "./background/client.js";
// Default preference value.
const DEFAULT_PREFERENCE = {
    primary_blank: true,
    secondary_blank: false,
    quick_secondary_blank: true,
    compound_shortcut_enable: false,
};

export default {
    localPreference() {
        return JSON.parse(localStorage.getItem('preference')) || DEFAULT_PREFERENCE;
    },
    isPrimaryBlank() {
        let preference = this.localPreference();
        return preference['primary_blank'];
    },
    isSecondaryBlank() {
        let preference = this.localPreference();
        return preference['secondary_blank'];
    },
    isQuickSecondaryBlank() {
        let preference = this.localPreference();
        return preference['quick_secondary_blank'];
    },
    isCompoundShortcutEnable() {
        let preference = this.localPreference();
        return !!preference['compound_shortcut_enable'];
    },
    update(preference) {
        if (preference) {
            localStorage.setItem('preference', JSON.stringify(preference));
            client.updatePreference(preference);
        }
    },
    sync() {
        client.getPreferences().then(preference => {
            preference['compound_shortcut_enable'] = false;
            localStorage.setItem('preference', JSON.stringify(preference));
        }).catch(error => {
            console.log(error);
        });
    }
}