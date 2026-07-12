import templates from './templates.js';

export default {
  createDiv(className) {
    let div = document.createElement('div');
    div.className = className;
    return div;
  },
  compile(template, data) {
    return templates[template](data);
  },
};
