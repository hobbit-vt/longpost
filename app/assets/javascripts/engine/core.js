longpost.Core = function(domElement){

  var self = this;

  var DEFAULT_OPTIONS = {
    cornerColor: "#f00",
    borderColor: "#000",
    transparentCorners: false,
    hasRotatingPoint: false,
    lockUniScaling: true
  };
  var DEFAULT_SIZE = {
    width: 600,
    height: 600
  };
  var SNAP_PIXELS_LIMIT = 5;

  var _container = $(domElement);
  var _canvas = null;
  var _resizingCanvas = null;

  var _outsideController = null;

  function constructor(){

    _initContainer();
    _outsideController = new longpost.OutsideController(self);
    _outsideController.addEvent(_outsideController.EVENT.drop, self.addImage);
    _outsideController.addEvent(_outsideController.EVENT.delete, _deleteCurrentSelection);
    _outsideController.addEvent(_outsideController.EVENT.clearSelection, _clearSelection);

    _canvas.on('mouse:down', _onCanvasMouseDown);
    _canvas.on('object:modified', _onObjectsModified);
    _canvas.on('object:selected', function(e){ e.target.set(DEFAULT_OPTIONS); });
    _canvas.on('object:moving', _onObjectMoving);
  }

  /**
   * return all text objects on canvas
   * @returns {Array}
   */
  self.getTextObjects = function(){

    var textObjects = [];

    if(_canvas){

      for(var i = 0; i < _canvas._objects.length; i++){

        if(_canvas._objects[i].type.match('text') !== null) {

          textObjects.push(_canvas.item(i));
        }
      }
    }
    return textObjects;

  };

  /**
   * Add some text to canvas at special position
   * @param string Text that will add to canvas
   * @param position Text position
   */
  self.addText = function(string, position){

    var text = new fabric.ExtIText("Hello, World!", DEFAULT_OPTIONS);
    text.set({
      fontSize: 13,
      fontFamily: 'Arial',
      padding: 15
    });
    _canvas.add(text);
  };

  /**
   * Add image to canvas at bottom of a most lower object
   * @param imageUrl
   */
  self.addImage = function(imageUrl){

    _resizeImageToMaxWidth(imageUrl, function(scaledImageUrl){

      fabric.Image.fromURL(scaledImageUrl, function(img) {

          var mostLowerObject = _getMostLowerObject();

          img.scaleToWidth(DEFAULT_SIZE.width);
          img.set(DEFAULT_OPTIONS);

          if(mostLowerObject) {

            var mostLowerBounds = mostLowerObject.getBoundingRect();
            img.set({
              top: mostLowerBounds.top + mostLowerBounds.height
            });
          }
          _canvas.add(img);
          _optimizeCanvasSize();
        }
      );
    });
  };

  /**
   * Get application canvas, which wrapped fabric js
   * @returns {*}
   */
  self.getCanvas = function(){

    return _canvas;
  };

  /**
   * initialize container, create canvas
   * @private
   */
  function _initContainer(){

    var cnv = document.createElement('canvas');
    cnv.width =  DEFAULT_SIZE.width;
    cnv.height = DEFAULT_SIZE.height;
    cnv.id = 'longpost_canvas';

    _container.append(cnv);

    _canvas = new fabric.Canvas('longpost_canvas', {
      backgroundColor: '#fff'
    });

    _resizingCanvas = document.createElement('canvas');
  }

  /**
   * check and remove empty IText
   * @private
   */
  function _checkEmptyIText(textObj){

    var trimmedText = textObj.text.replace(/^\s+|\s+$/g, '');

    if(trimmedText === ''){

      _canvas.remove(textObj);
    }
  }

  /**
   * get most lower object at scene
   * @returns {object}
   * @private
   */
  function _getMostLowerObject(){

    var objectBounds,
        objectLowerY,
        mostLowerY = 0,
        mostLowerResult;
    for(var i = 0; i < _canvas._objects.length; i++){

      objectBounds = _canvas.item(i).getBoundingRect();
      objectLowerY = objectBounds.top + objectBounds.height;

      if(objectLowerY > mostLowerY){

        mostLowerY = objectLowerY;
        mostLowerResult = _canvas.item(i);
      }
    }

    return mostLowerResult;
  }

  /**
   * Optimize canvas size to min height or to position of most lower object
   * @private
   */
  function _optimizeCanvasSize(){

    var mostLowerObject = _getMostLowerObject();
    if(mostLowerObject){

      var bounds = mostLowerObject.getBoundingRect();
      var maxY = bounds.height + bounds.top;

      if(maxY > DEFAULT_SIZE.width){

        _canvas.setHeight(maxY);

      } else {

        _canvas.setHeight(DEFAULT_SIZE.width);
      }
    }
  }

  /**
   * Resize image base64url to max width for canvas
   * @param imageUrl
   * @returns {string}
   * @private
   */
  function _resizeImageToMaxWidth(imageUrl, callback){

    var img = document.createElement('img');
    img.src = imageUrl;

    img.onload = function() {

      if (img.width > DEFAULT_SIZE.width) {

        var tempWidth = img.width;
        img.width = DEFAULT_SIZE.width;
        img.height = img.height * (DEFAULT_SIZE.width / tempWidth);
      }
      _resizingCanvas.width = img.width;
      _resizingCanvas.height = img.height;

      _resizingCanvas.getContext("2d").drawImage(img, 0, 0, img.width, img.height);

      callback(_resizingCanvas.toDataURL('image/jpeg', 0.8));
    };
  }

  /**
   * Snap object to canvas bounds and other objects
   * @param object
   * @private
   */
  function _processSnapToSmth(object){

    //to left side
    if(Math.abs(object.left - object.padding) < SNAP_PIXELS_LIMIT) {

      object.set({
        left: object.padding
      });
    }
    //to right side
    if(Math.abs(object.left + (object.width * object.scaleX + object.padding) - DEFAULT_SIZE.width) < SNAP_PIXELS_LIMIT) {

      object.set({
        left: DEFAULT_SIZE.width - (object.width * object.scaleX + object.padding)
      });
    }
    //to top
    if(Math.abs(object.top - object.padding) < SNAP_PIXELS_LIMIT) {

      object.set({
        top: object.padding
      });
    }
    //to center
    if(Math.abs(object.left + object.width  * object.scaleX / 2 - DEFAULT_SIZE.width / 2) < SNAP_PIXELS_LIMIT) {

      object.set({
        left: DEFAULT_SIZE.width / 2 - object.width  * object.scaleX / 2
      });
    }
    //left side to center
    if(Math.abs(object.left - object.padding - DEFAULT_SIZE.width / 2) < SNAP_PIXELS_LIMIT) {

      object.set({
        left: DEFAULT_SIZE.width / 2 + object.padding
      });
    }
    //right side to center
    if(Math.abs(object.left + (object.width * object.scaleX + object.padding) - DEFAULT_SIZE.width / 2) < SNAP_PIXELS_LIMIT) {

      object.set({
        left: DEFAULT_SIZE.width / 2 - (object.width * object.scaleX + object.padding)
      });
    }

    var i, smthObj;
    for(i = 0; i < _canvas.getObjects().length; i++) {

      smthObj = _canvas.item(i);
      if(smthObj === object) continue;

      //left side to left side smth
      if(Math.abs((smthObj.left - smthObj.padding) - (object.left - object.padding)) < SNAP_PIXELS_LIMIT) {

        object.set({
          left: smthObj.left - smthObj.padding + object.padding
        });
      }
      //left side to right side smth
      if(Math.abs((smthObj.left + smthObj.width * smthObj.scaleX + smthObj.padding) - (object.left - object.padding)) < SNAP_PIXELS_LIMIT) {

        object.set({
          left: smthObj.left + smthObj.width * smthObj.scaleX + smthObj.padding + object.padding
        });
      }
      //right side to left side smth
      if(Math.abs((object.left + object.width * object.scaleX + object.padding) - (smthObj.left - smthObj.padding)) < SNAP_PIXELS_LIMIT) {

        object.set({
          left: (smthObj.left - smthObj.padding) - (object.width * object.scaleX + object.padding)
        });
      }
      //right side to right side smth
      if(Math.abs((object.left + object.width * object.scaleX + object.padding) - (smthObj.left + smthObj.width * smthObj.scaleX  + smthObj.padding)) < SNAP_PIXELS_LIMIT) {

        object.set({
          left: (smthObj.left + smthObj.width * smthObj.scaleX + smthObj.padding) - (object.width * object.scaleX  + object.padding)
        });
      }

      //top side to top side smth
      if(Math.abs((smthObj.top - smthObj.padding) - (object.top - object.padding)) < SNAP_PIXELS_LIMIT) {

        object.set({
          top: smthObj.top - smthObj.padding + object.padding
        });
      }
      //top side to down side smth
      if(Math.abs((smthObj.top + smthObj.height * smthObj.scaleX + smthObj.padding) - (object.top - object.padding)) < SNAP_PIXELS_LIMIT) {

        object.set({
          top: smthObj.top + smthObj.height * smthObj.scaleX + smthObj.padding + object.padding
        });
      }
      //down side to top side smth
      if(Math.abs((object.top + object.height * object.scaleX + object.padding) - (smthObj.top - smthObj.padding)) < SNAP_PIXELS_LIMIT) {

        object.set({
          top: (smthObj.top - smthObj.padding) - (object.height * object.scaleX + object.padding)
        });
      }
      //down side to down side smth
      if(Math.abs((object.top + object.height * object.scaleX + object.padding) - (smthObj.top + smthObj.height * smthObj.scaleX + smthObj.padding)) < SNAP_PIXELS_LIMIT) {

        object.set({
          top: (smthObj.top + smthObj.height * smthObj.scaleX + smthObj.padding) - (object.height * object.scaleX  + object.padding)
        });
      }
    }
  }

  function _deleteCurrentSelection(){

    if(_canvas.getActiveGroup()) {

      _canvas.getActiveGroup().forEachObject( function(o){
        _canvas.remove(o);
      }, self);
      _canvas.discardActiveGroup().renderAll();

    } else {

      _canvas.remove(_canvas.getActiveObject());
    }
  }

  function _clearSelection(){

    if(_canvas.getActiveGroup()) {

      _canvas.discardActiveGroup();
      _canvas.renderAll();

    } else {

      _canvas.discardActiveObject()

    }

  }

  function _onCanvasMouseDown(){

    var allTextObjects = self.getTextObjects();
    for(var i = 0; i < allTextObjects.length; i++){

      _checkEmptyIText(allTextObjects[i]);
    }
  }

  function _onObjectsModified(e){

    console.log(e);
    _optimizeCanvasSize();
  }

  function _onObjectMoving(e) {

    _processSnapToSmth(e.target);
  }

  constructor();

};