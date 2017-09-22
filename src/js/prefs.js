function nullOrDefault(value, default_value) {
    return value === null ? default_value : value;
}

export default {
    isShortcutOpenByBlank() {
        return nullOrDefault(JSON.parse(localStorage.getItem('openByBlank')), true);
    },
    isCompoundShortcutEnable() {
        return nullOrDefault(JSON.parse(localStorage.getItem('compoundEnable')), false);
    },
    setShortcutOpenByBlank(value) {
        return localStorage.setItem('openByBlank', value);
    },
    setCompoundShortcutEnable(value) {
        return localStorage.setItem('compoundEnable', value);
    },
}