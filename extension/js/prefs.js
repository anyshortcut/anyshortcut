export default {
    setOpenPrimaryShortcutByBlank(flag){
        localStorage.setItem('primaryByBlank', flag);
    },
    isOpenPrimaryShortcutByBlank(){
        return localStorage.getItem('primaryByBlank') === 'true';
    },
    setOpenSecondaryShortcutByBlank(flag){
        localStorage.setItem('secondaryByBlank', flag);
    },
    isOpenSecondaryShortcutByBlank(){
        return localStorage.getItem('secondaryByBlank') === 'true';
    }
}