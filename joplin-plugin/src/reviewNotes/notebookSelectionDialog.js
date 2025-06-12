/**
 * This is a minimal module export for webpack. 
 * The actual functionality is implemented inline in the dialog HTML.
 * 
 * This approach avoids webpack bundling issues with dialog scripts.
 */
if (typeof exports === 'object') {
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.default = {};
}
