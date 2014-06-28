(function(){

  var MARGIN = 10;
  var ACTIVE = 'active';
  var IMAGE_CLASS = 'exported-image';
  var OVERLAY_CLASS = 'exported-overlay';
  var OVERLAY_OPACITY = 0.5;

  /**
   * Exporter controller for image
   * @param container Container of canvas
   * @constructor
   */
  longpost.Exporter = function(container) {

    var self = this;

    var _enabled = false;

    var _image;
    var _overlay;
    var _defaultPosition;

    function constructor(){

      var body = $('body');

      _defaultPosition = container.offset();

      _image = $('<img>').css({
        position: 'absolute',
        top: _defaultPosition.top,
        left: _defaultPosition.left,
        zIndex: 10
      });
      _image.addClass(IMAGE_CLASS);
      body.append(_image);
      _bindTransitionEnd(_image, _transitionComplete);
      _image.bind('load', _imageLoadComplete)

      _overlay = $('<div>').addClass(OVERLAY_CLASS);
      _overlay.hide();
      body.append(_overlay);
    }

    /**
     * Export image
     * @param imageUrl Image for export
     */
    self.exportImage = function(imageUrl){

      _image.attr('src', imageUrl);
    };

    /**
     * Handles load complete for image
     * @private
     */
    function _imageLoadComplete(){

      _showExportedImage();
    }

    /**
     * Shows image and overlay
     * @private
     */
    function _showExportedImage(){

      _image.show();
      _overlay.show();

      setTimeout(function() { // that's magic =( Need async, because jquery, probably, does 'show' too slow
        _image.addClass(ACTIVE);
        _overlay.css('opacity', OVERLAY_OPACITY);
      }, 1);

      var scale = _calculateScale(_image.height());
      _setTransform(_image, 'scale(' + scale + ')');

      _image.css({
        top: MARGIN
      });
    }

    /**
     * Hide image and overlay begin
     * @private
     */
    function _hideExportedImage(){

      _overlay.css('opacity', 0);

      _image.css(_defaultPosition);
      _image.removeClass(ACTIVE);

      _setTransform(_image, 'scale(' + 1 + ')');
    }

    /**
     * Handles transition end event (finally hide)
     * @param e Event args
     * @private
     */
    function _transitionComplete(e) {

      if(e.originalEvent.propertyName.match(/transform/)) {

        if (_enabled) {

          _image.hide();
          _image.attr('src', '');
          _overlay.hide();
          _enabled = false;

        } else {

          _enabled = true;
          $('body').one('click', _hideExportedImage);

        }

      }
    }

    constructor();
  };

  /**
   * Calculates scale relative to the height of argument and height of document
   * @param height Height of smth
   * @returns {number} Scale
   * @private
   */
  function _calculateScale(height) {

    var docHeight = $(document).height() - MARGIN*2;

    return docHeight / height;

  }

  /**
   * Sets css transform
   * @param element Target element
   * @param transform Transform for element
   * @private
   */
  function _setTransform(element, transform){

    element.css({
      '-moz-transform': transform,
      '-ms-transform': transform,
      '-webkit-transform': transform,
      '-o-transform': transform,
      'transform': transform
    });
  }

  /**
   * Binds transition event
   * @param element Target element
   * @param listener Listener for event
   * @private
   */
  function _bindTransitionEnd(element, listener){

    element.bind('webkitTransitionEnd', listener);
    element.bind('transitionend', listener);
    element.bind('msTransitionEnd', listener);
    element.bind('oTransitionEnd', listener);
  }

})();