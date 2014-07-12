(function(){

  var ANIMATION_TIME = 600; // hack =(

  var EXPORT_CONTAINER = '[data-export]';
  var PAGE_CONTAINER = '[data-page]';

  /**
   * Shows export page
   * @constructor
   */
  longpost.Exporter = function() {

    var self = this;
    longpost.EventDispatcher.prototype.apply(this);

    var _exportContainer,
        _page,
        _dontDoubleClickOverlay,
        _image,
        _footer,
        _preloader;

    var _isImageShowed = false;


    function constructor(){

      _exportContainer = $(EXPORT_CONTAINER);
      _page = $(PAGE_CONTAINER);
      _image = _exportContainer.find('.export-image');
      _footer = _exportContainer.find('.export-footer');
      _preloader = _exportContainer.find('.export-preload');
      _dontDoubleClickOverlay = $('<div>');
      _dontDoubleClickOverlay.css({
        opacity: 0,
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        display: 'none'
      });
      _dontDoubleClickOverlay.appendTo('body');


      _exportContainer.bind('click', _handleClick);
      _image.bind('load', _imageLoaded);
      _image.bind('error', _imageLoaded);
    }

    /**
     * Begins show export window
     * @param dataUrl Base64 image url
     */
    self.exportImage = function(dataUrl) {

      _dontDoubleClickOverlay.show();
      _preloader.show();

      _exportContainer.removeClass('moveToRight');
      _page.removeClass('scaleUp');

      _exportContainer.addClass('active moveFromLeft');
      _page.addClass('scaleDown');


      var xhr = _performUploadImage(dataUrl);
      xhr.success(_successUploadImage);
      xhr.error(_cancelExport)
    };

    /**
     * Cancels export
     */
    self.cancelExport = function(){

      _cancelExport();
    };

    /**
     * Handles success upload image to server
     * @param data Image url
     * @private
     */
    function _successUploadImage(data){

      _image.attr('src', data);
    }

    /**
     * Handles image loaded event
     * @private
     */
    function _imageLoaded(){

      _isImageShowed = true;

      _image.addClass('active moveFromLeft');
      _footer.addClass('active');
    }

    /**
     * Closes export window
     * @private
     */
    function _cancelExport(){

      self.dispatchEvent(longpost.Exporter.EVENT.cancel);

      _exportContainer.removeClass('active moveFromLeft');
      _page.removeClass('scaleDown');

      _exportContainer.addClass('moveToRight');
      _page.addClass('scaleUp');

      setTimeout(function () { // hack =(
        _image.removeAttr('src');
      }, ANIMATION_TIME);
      _isImageShowed = false;
      _image.removeClass('active moveFromLeft');
      _footer.removeClass('active');

      _dontDoubleClickOverlay.hide();
      _preloader.hide();
    }

    /**
     * Handles click to window
     * @private
     */
    function _handleClick(){

      if(_isImageShowed){

        _cancelExport();
      }
    }

    constructor();
  };

  longpost.Exporter.EVENT = {
    cancel: 'cancel'
  };

  /**
   * Performs upload image to server
   * @param dataUrl Base64 encoded image
   * @returns {*|XMLHttpRequest}
   * @private
   */
  function _performUploadImage(dataUrl) {

    var blob = _dataURItoBlob(dataUrl);
    var formData = new FormData();
    formData.append("image", blob);

    return $.ajax({
      url: '/image/save',
      data: formData,
      processData: false,
      contentType: false,
      type: 'POST'
    });
  }

  /**
   * Converts Base64 encoded image to blob
   * @param dataUrl Base64 encoded window
   * @returns {Blob}
   * @private
   */
  function _dataURItoBlob(dataUrl) {
    var byteString,
        mimestring;

    if (dataUrl.split(',')[0].indexOf('base64') !== -1) {

      byteString = atob(dataUrl.split(',')[1])

    } else {

      byteString = decodeURI(dataUrl.split(',')[1])

    }

    mimestring = dataUrl.split(',')[0].split(':')[1].split(';')[0]

    var content = [];
    for (var i = 0; i < byteString.length; i++) {

      content[i] = byteString.charCodeAt(i)
    }

    return new Blob([new Uint8Array(content)], {type: mimestring});
  }

})();