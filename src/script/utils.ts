import templates from './templates';

export default {
  createDiv(className: string): HTMLDivElement {
    const div = document.createElement('div');
    div.className = className;
    return div;
  },
  compile(template: string, data?: unknown): string {
    return templates[template](data);
  },
};
