/**
 * Any helper functions
 */
longpost.Helper = {
  /**
   * Returns false =)
   * @returns {boolean}
   */
  falseFunction: function() {

    return false;
  },
  /**
   * Generate random UUID
   * @returns {string}
   */
  generateUUID: function(){

    return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  },
  /**
   * Copies all enumerable properties of one object to another
   * @param dest Destination Where to copy to
   * @param source Source Where to copy from
   * @returns {Object}
   */
  extend: function(dest, source) {

    for (var property in source) {
      dest[property] = source[property];
    }
    return dest;
  },
  /**
   * Creates an empty object and copies all enumerable properties of another object to it
   * @param object Object to clone
   * @returns {Object}
   */
  clone: function(object) {

    return longpost.Helper.extend({ }, object);
  }
};