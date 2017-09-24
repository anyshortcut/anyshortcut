import _ from "lodash";

export default {
    createDiv(className) {
        let div = document.createElement('div');
        div.className = className;
        return div;
    },
    compile(template, data) {
        return _.template(template)(data);
    },
    parseHtml(string) {
        return new DOMParser().parseFromString(string, 'text/xml').firstChild;
    }
}