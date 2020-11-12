const originalCustomElementDefine = window.customElements.define;

// Overwrite custom element define method to prevent redefining
// the same custom element before each test
window.customElements.define = function (name, constructor, options) {
  if (!window.customElements.get(name)) {
    originalCustomElementDefine.call(window.customElements, name, constructor, options);
  }
};
