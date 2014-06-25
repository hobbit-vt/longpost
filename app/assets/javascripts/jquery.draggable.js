(function($){

  var DROP_DELAY = 300;

  $.fn.draggable = function(){

    return new Draggable($(this));
  };

  var Draggable = function(element){

    var _isMouseDown = false;
    var _mouseDownTime = null;
    var _shadowElement = null;
    var _shadowElementMouseOffset = null;

    function constructor(){

      element.bind('mousedown', _mouseDown);
      $(window).bind('mouseup', _mouseUp);
      $('body').bind('mouseleave', _mouseOut);
    }

    function _mouseDown(e){

      _isMouseDown = true;
      _mouseDownTime = Date.now();
      var body = $('body');
      body.bind('mousemove', _mouseMove);
      body.bind('selectstart', falseFunction);

      var offset = element.offset();
      _shadowElement = _createShadowElement();
      _shadowElement.appendTo('body');
      _shadowElement.css(offset);
      _shadowElementMouseOffset = {
        x: _shadowElement.width() / 2,
        y: _shadowElement.height() / 2
      };
    }

    function _mouseMove(e){

      _shadowElement.css({
        left: e.pageX - _shadowElementMouseOffset.x,
        top: e.pageY - _shadowElementMouseOffset.y
      })
    }

    function _mouseOut(){


      _cancelDrag();
    }

    function _mouseUp(e){

      if(_isMouseDown) {

        if(Date.now() - _mouseDownTime > DROP_DELAY) {

          var width = _shadowElement.width();
          var height = _shadowElement.height();
          var event = jQuery.Event('dropped', {
            pageX: e.pageX - width / 2,
            pageY: e.pageY - height / 2,
            clientX: e.clientX - width / 2,
            clientY: e.clientY - height / 2
          });
          element.trigger(event);
        }

        _isMouseDown = false;
        _cancelDrag();
      }

    }

    /**
     * Removes shadow element, unbinds events
     * @private
     */
    function _cancelDrag(){

      var body = $('body');
      body.unbind('mousemove', _mouseMove);
      body.unbind('selectstart', falseFunction);

      if(_shadowElement) {

        _shadowElement.remove();
        _shadowElement = null;
      }
    }

    /**
     * Creates shadow element for drop element
     * @returns {*|HTMLElement}
     * @private
     */
    function _createShadowElement(){

      return element.clone().css(Draggable.SHADOW_ELEMENT_CSS);
    }

    constructor();
  };
  Draggable.SHADOW_ELEMENT_CSS = {
    opacity: 0.5,
    position: 'absolute'
  };

  function falseFunction(){
    return false;
  }

})(jQuery);