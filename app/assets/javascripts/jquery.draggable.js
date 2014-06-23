(function($){

  $.fn.draggable = function(){

    new Draggable($(this));
  };

  var Draggable = function(element){

    var _isMouseDown = false;
    var _shadowElement = null;
    var _shadowElementMouseOffset = null;

    function constructor(){

      element.bind('mousedown', _mouseDown);
      $(window).bind('mouseup', _mouseUp);
      $('body').bind('mouseleave', _mouseOut);
    }

    function _mouseDown(e){

      _isMouseDown = true;
      $('body').bind('mousemove', _mouseMove);

      var offset = element.offset();
      _shadowElement = _createShadowElement();
      _shadowElement.appendTo('body');
      _shadowElement.css(offset);
      _shadowElementMouseOffset = {
        x: _shadowElement.width() / 2,
        y: _shadowElement.height() / 2
      };
      console.log('e');
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


        _isMouseDown = false;
        _cancelDrag();
      }

    }

    function _cancelDrag(){

      $('body').unbind('mousemove', _mouseMove);

      if(_shadowElement) {

        _shadowElement.remove();
        _shadowElement = null;
      }
    }

    function _createShadowElement(){

      return element.clone().css(Draggable.SHADOW_ELEMENT_CSS);
    }

    function _getElementPosition(el){

      var offset = el.offset();

      return {
        x: offset.left,
        y: offset.top
      };
    }
    Draggable.SHADOW_ELEMENT_CSS = {
      opacity: 0.5,
      position: 'absolute'
    };

    constructor();
  }

})(jQuery);