require('./templates.js');
import _ from "lodash";

export default {
    createDiv(className) {
        let div = document.createElement('div');
        div.className = className;
        return div;
    },
    compile(template, data) {
        return _.templates[template](data);
    },
}