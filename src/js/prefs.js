function nullOrDefault(value, default_value) {
    return value === null ? default_value : value;
}

export default {
    getDefaultCombinationKey() {
        return nullOrDefault(localStorage.getItem('combinationKey'), 'alt');
    },
    setDefaultCombinationKey(value) {
        return localStorage.setItem('combinationKey', value);
    },
    isShortcutOpenByBlank() {
        return nullOrDefault(JSON.parse(localStorage.getItem('openByBlank')), true);
    },
    setShortcutOpenByBlank(value) {
        return localStorage.setItem('openByBlank', value);
    },
    isCompoundShortcutEnable() {
        return nullOrDefault(JSON.parse(localStorage.getItem('compoundEnable')), false);
    },
    setCompoundShortcutEnable(value) {
        return localStorage.setItem('compoundEnable', value);
    },
    getShowCircleConfig() {
        return nullOrDefault(localStorage.getItem('showCircle'), 'only');
    },
    setShowCircleConfig(value) {
        return localStorage.setItem('showCircle', value);
    }
}