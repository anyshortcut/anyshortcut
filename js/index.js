import Vue from "vue";

window.onload = function() {
    let vm = new Vue({
        el: '#vue',
        data: {
            primaryByBlank: null,
            secondaryByBlank: null,
            quickSecondaryByBlank: null,
        },
        watch: {
            'primaryByBlank': function() {
                localStorage.setItem('primaryByBlank', this.primaryByBlank);
            },
            'secondaryByBlank': function() {
                localStorage.setItem('secondaryByBlank', this.secondaryByBlank);
            },
            'quickSecondaryByBlank': function() {
                localStorage.setItem('quickSecondaryByBlank', this.quickSecondaryByBlank);
            }
        },
        created: function() {
            this.primaryByBlank = localStorage.getItem('primaryByBlank');
            this.secondaryByBlank = localStorage.getItem('secondaryByBlank');
            this.quickSecondaryByBlank = localStorage.getItem('quickSecondaryByBlank');
        }
    });
};