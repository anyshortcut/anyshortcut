import Vue from "vue";

window.onload = function() {
    let vm = new Vue({
        el: 'body',
        data: {
            primaryByBlank: null,
            secondaryByBlank: null,
        },
        watch: {
            'primaryByBlank': function() {
                localStorage.setItem('primaryByBlank', this.primaryByBlank);
            },
            'secondaryByBlank': function() {
                localStorage.setItem('secondaryByBlank', this.secondaryByBlank);
            }
        },
        created: function() {
            this.primaryByBlank = localStorage.getItem('primaryByBlank');
            this.secondaryByBlank = localStorage.getItem('secondaryByBlank');
        }
    });
};