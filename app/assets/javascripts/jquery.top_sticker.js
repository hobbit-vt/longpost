(function($){

  var PROPERTIES_FOR_SAVE = ['position', 'top'];
  var STICK_CSS = {
    position: 'fixed',
    top: 0
  };

  /**
   * Sticks element to top of page
   */
  $.fn.stick = function(){

    var element = $(this);
    var defaultProperties = extractDefaultProperties(element);
    var anchor = createStickAnchor(element);
    $(window).scroll(function(){

      stickyRelocate(element, anchor, defaultProperties);
    });
    stickyRelocate(element, anchor, defaultProperties);
  };

  /**
   * Extracts default options from element
   * @param element
   */
  function extractDefaultProperties(element){

    var result = {};

    PROPERTIES_FOR_SAVE.forEach(function(val, idx){

      result[val] = element.css(val);
    });
    return result;
  }

  /**
   * Create anchor for element
   * @param element Element for which anchor is created
   * @returns {*|HTMLElement} Created anchor
   */
  function createStickAnchor(element){

    var offset = element.offset();

    var anchor = $('<div>');
    anchor.css({
      position: 'absolute',
      top: offset.top,
      left: offset.left
    });

    $('body').append(anchor);

    return anchor;
  }

  /**
   * Sticks element to top or restores default options
   * @param element Element for relocate
   * @param anchor Anchor for element
   * @param defaultProperties Default options for element
   */
  function stickyRelocate(element, anchor, defaultProperties) {

    var window_top = $(window).scrollTop();
    var div_top = anchor.offset().top;

    if (window_top > div_top) {
      element.css(STICK_CSS);
    } else {
      element.css(defaultProperties);
    }
  }

})(jQuery);