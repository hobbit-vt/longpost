(function(){

  var WATERMARK_TEXT = 'longpost.me';
  var WATERMARK_SIZE = 18;
  var WATERMARK_PADDING = 5;

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
  var IMAGE_FORMAT = 'jpeg';
  var IMAGE_QUALITY = 0.9;

  var SNAP_PIXELS_LIMIT = 5;
  var DEFAULT_TEXT = 'Text';
  var CLEAR_OBJECTS_MESSAGE = 'Do you really want to remove all objects from the canvas?';
  var FONT_SIZE = 18;
  var PADDING = 15;

  /**
   * Core for longpost engine
   * @param domElement Dom element for action
   * @constructor
   */
  longpost.Core = function(domElement){

    var self = this;

    var _container = $(domElement);
    var _canvas = null;
    var _canvasOffset = null;
    var _resizingCanvas = null;

    var _outsideController = null;
    var _objectsProcessor = null;
    var _imageExporter = null;
    var _introduceViewer = null;

    var _waterMark;

    function constructor(){

      _initContainer();
      _initWaterMark();
      _objectsProcessor = new longpost.ObjectProcessor(_canvas);
      _objectsProcessor.addEvent(longpost.ObjectProcessor.EVENT.loadStateComplete, _optimizeCanvasSize);
      _optimizeCanvasSize();

      _imageExporter = new longpost.Exporter();

      _introduceViewer = new longpost.IntroduceViewer();

      _outsideController = new longpost.OutsideController(self);
      _outsideController.addEvent(longpost.OutsideController.EVENT.imageDrop, self.addImage);
      _outsideController.addEvent(longpost.OutsideController.EVENT.delete, _deleteCurrentSelection);
      _outsideController.addEvent(longpost.OutsideController.EVENT.clearSelection, _clearSelection);
      _outsideController.addEvent(longpost.OutsideController.EVENT.back, _onBack);
      _outsideController.addEvent(longpost.OutsideController.EVENT.clearObjects, _onClearObjects);
      _outsideController.addEvent(longpost.OutsideController.EVENT.clearObjects, _onClearObjects);
      _outsideController.addEvent(longpost.OutsideController.EVENT.addText, _onAddText);
      _outsideController.addEvent(longpost.OutsideController.EVENT.dropText, _onDropText);
      _outsideController.addEvent(longpost.OutsideController.EVENT.save, _onSave);
      _outsideController.addEvent(longpost.OutsideController.EVENT.help, _onHelp);
      _outsideController.addEvent(longpost.OutsideController.EVENT.selectAll, _selectAll);

      _canvas.on('mouse:down', _onCanvasMouseDown);
      _canvas.on('object:modified', _onObjectsModified);
      _canvas.on('text:changed', _onObjectsModified);
      _canvas.on('object:selected', _onObjectsSelected);

      _canvas.on('object:moving', _onObjectMoving);

      $('body').bind('mousedown', _clearSelection);
      _container.bind('mousedown', longpost.Helper.falseFunction);
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

      if(!string) {
        string = DEFAULT_TEXT;
      }
      if(!position) {

        position = {
          x:0,
          y:0
        };
      }
      var text = new fabric.IText(string, DEFAULT_OPTIONS);
      text.set({
        fontSize: FONT_SIZE,
        fontFamily: 'Arial',
        padding: PADDING,
        left: position.x,
        top: position.y
      });
      _objectsProcessor.add([text]);
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

              var mostLowerBounds = mostLowerObject.getBoundingRectSafely();
              img.set({
                top: mostLowerBounds.top + mostLowerBounds.height
              });
            }
            _objectsProcessor.add([img]);
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
      _canvasOffset = $(_container).offset();

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

        objectBounds = _canvas.item(i).getBoundingRectSafely();
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

        var bounds = mostLowerObject.getBoundingRectSafely();
        var maxY = bounds.height + bounds.top;

        if(maxY > DEFAULT_SIZE.width){

          _canvas.setHeight(maxY);

        } else {

          _canvas.setHeight(DEFAULT_SIZE.width);
        }
      } else {

        _canvas.setHeight(DEFAULT_SIZE.width);
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

        callback(_resizingCanvas.toDataURL('image/jpeg', IMAGE_QUALITY));
      };
    }

    /**
     * Snap object to canvas bounds and other objects
     * @param object
     * @private
     */
    function _processStickToSmth(object){
      console.time('s');
      var objProps = object.getPropertiesSafely();

      //console.log(objProps);

      var div,
          groupAddition = {
            left: object.type === 'group' ? object.width / 2 : 0,
            top: object.type === 'group' ? object.height / 2 : 0
          };
      var nearestVertical = {
        div: 0,
        action: null
      };
      var nearestHorizontal = {
        div: 0,
        action: null
      };


      //to left side
      div = Math.abs(objProps.left - object.padding);
      if(div < SNAP_PIXELS_LIMIT) {

        nearestHorizontal.div = nearestHorizontal.div > div ? div : nearestHorizontal.div;
        nearestHorizontal.action = function(){
          object.set({
            left: object.padding + groupAddition.left
          });
        };
      }
      //to right side
      div = Math.abs(objProps.left + (object.width * objProps.scaleX + object.padding) - DEFAULT_SIZE.width);
      if(div < SNAP_PIXELS_LIMIT) {

        nearestHorizontal.div = nearestHorizontal.div > div ? div : nearestHorizontal.div;
        nearestHorizontal.action = function() {
          object.set({
            left: DEFAULT_SIZE.width - (object.width * objProps.scaleX + object.padding) + groupAddition.left
          });
        };
      }
      //to top
      div = Math.abs(objProps.top - object.padding);
      if(div < SNAP_PIXELS_LIMIT) {

        nearestVertical.div = nearestVertical.div > div ? div : nearestVertical.div;
        nearestVertical.action = function() {
          object.set({
            top: object.padding + groupAddition.top
          });
        };
      }
      //to center
      div = Math.abs(objProps.left + object.width  * objProps.scaleX / 2 - DEFAULT_SIZE.width / 2);
      if(div < SNAP_PIXELS_LIMIT) {

        nearestHorizontal.div = nearestHorizontal.div > div ? div : nearestHorizontal.div;
        nearestHorizontal.action = function() {
          object.set({
            left: DEFAULT_SIZE.width / 2 - object.width * objProps.scaleX / 2 + groupAddition.left
          });
        };
      }
      //left side to center
      div = Math.abs(objProps.left - object.padding - DEFAULT_SIZE.width / 2);
      if(div < SNAP_PIXELS_LIMIT) {

        nearestHorizontal.div = nearestHorizontal.div > div ? div : nearestHorizontal.div;
        nearestHorizontal.action = function() {
          object.set({
            left: DEFAULT_SIZE.width / 2 + object.padding + groupAddition.left
          });
        };
      }
      //right side to center
      div = Math.abs(objProps.left + (object.width * objProps.scaleX + object.padding) - DEFAULT_SIZE.width / 2);
      if(div < SNAP_PIXELS_LIMIT) {

        nearestHorizontal.div = nearestHorizontal.div > div ? div : nearestHorizontal.div;
        nearestHorizontal.action = function() {
          object.set({
            left: DEFAULT_SIZE.width / 2 - (object.width * objProps.scaleX + object.padding) + groupAddition.left
          });
        };
      }

      var i, smthObj;
      for(i = 0; i < _canvas.getObjects().length; i++) {

        smthObj = _canvas.item(i);
        if(smthObj === object) continue;
        if(object._objects) {
          var needContinue = object._objects.some(function(val){
            return smthObj === val
          });
          if(needContinue) continue;
        }

        //left side to left side smth
        div = Math.abs((smthObj.left - smthObj.padding) - (objProps.left - object.padding));
        if(div < SNAP_PIXELS_LIMIT) {

          nearestHorizontal.div = nearestHorizontal.div > div ? div : nearestHorizontal.div;
          (function(obj){
            nearestHorizontal.action = function() {
              object.set({
                left: obj.left - obj.padding + object.padding + groupAddition.left
              });
            };
          })(smthObj);
        }
        //left side to right side smth
        div = Math.abs((smthObj.left + smthObj.width * smthObj.scaleX + smthObj.padding) - (objProps.left - object.padding));
        if(div < SNAP_PIXELS_LIMIT) {

          nearestHorizontal.div = nearestHorizontal.div > div ? div : nearestHorizontal.div;
          (function(obj){
            nearestHorizontal.action = function() {
              object.set({
                left: obj.left + obj.width * obj.scaleX + obj.padding + object.padding + groupAddition.left
              });
            }
          })(smthObj);
        }
        //right side to left side smth
        div = Math.abs((objProps.left + object.width * objProps.scaleX + object.padding) - (smthObj.left - smthObj.padding));
        if(div < SNAP_PIXELS_LIMIT) {

          nearestHorizontal.div = nearestHorizontal.div > div ? div : nearestHorizontal.div;
          (function(obj){
            nearestHorizontal.action = function() {
              object.set({
                left: (obj.left - obj.padding) - (object.width * objProps.scaleX + object.padding) + groupAddition.left
              });
            }
          })(smthObj);
        }
        //right side to right side smth
        div = Math.abs((objProps.left + object.width * objProps.scaleX + object.padding) - (smthObj.left + smthObj.width * smthObj.scaleX + smthObj.padding));
        if(div < SNAP_PIXELS_LIMIT) {

          nearestHorizontal.div = nearestHorizontal.div > div ? div : nearestHorizontal.div;
          (function(obj){
            nearestHorizontal.action = function() {
              object.set({
                left: (obj.left + obj.width * obj.scaleX + obj.padding) - (object.width * objProps.scaleX + object.padding) + groupAddition.left
              });
            }
          })(smthObj);
        }

        //top side to top side smth
        div = Math.abs((smthObj.top - smthObj.padding) - (objProps.top - object.padding));
        if(div < SNAP_PIXELS_LIMIT) {

          nearestVertical.div = nearestVertical.div > div ? div : nearestVertical.div;
          (function(obj){
            nearestVertical.action = function(){
              object.set({
                top: obj.top - obj.padding + object.padding + groupAddition.top
              });
            };
          })(smthObj);
        }
        //top side to down side smth
        div = Math.abs((smthObj.top + smthObj.height * smthObj.scaleX + smthObj.padding) - (objProps.top - object.padding));
        if(div < SNAP_PIXELS_LIMIT) {

          nearestVertical.div = nearestVertical.div > div ? div : nearestVertical.div;
          (function(obj){
            nearestVertical.action = function(){
              object.set({
                top: obj.top + obj.height * obj.scaleX + obj.padding + object.padding + groupAddition.top
              });
            };
          })(smthObj);
        }
        //down side to top side smth
        div = Math.abs((objProps.top + object.height * objProps.scaleX + object.padding) - (smthObj.top - smthObj.padding));
        if(div < SNAP_PIXELS_LIMIT) {

          nearestVertical.div = nearestVertical.div > div ? div : nearestVertical.div;
          (function(obj){
            nearestVertical.action = function(){
              object.set({
                top: (obj.top - obj.padding) - (object.height * objProps.scaleX + object.padding) + groupAddition.top
              });
            };
          })(smthObj);
        }
        //down side to down side smth
        div = Math.abs((objProps.top + object.height * objProps.scaleX + object.padding) - (smthObj.top + smthObj.height * smthObj.scaleX + smthObj.padding));
        if(div < SNAP_PIXELS_LIMIT) {

          nearestVertical.div = nearestVertical.div > div ? div : nearestVertical.div;
          (function(obj){
            nearestVertical.action = function(){
              object.set({
                top: (obj.top + obj.height * obj.scaleX + obj.padding) - (object.height * objProps.scaleX + object.padding) + groupAddition.top
              });
            };
          })(smthObj);
        }
      }

      //if need to stick to something
      nearestHorizontal.action && nearestHorizontal.action();
      nearestVertical.action && nearestVertical.action();
      console.timeEnd('s');
    }

    /**
     * Delete selected objects
     * @private
     */
    function _deleteCurrentSelection(){

      if(_canvas.getActiveGroup()) {

        _objectsProcessor.remove(_canvas.getActiveGroup().getObjects())

      } else {

        _objectsProcessor.remove([ _canvas.getActiveObject() ]);
      }
      _optimizeCanvasSize();
    }

    /**
     * Clear selected objects
     * @private
     */
    function _clearSelection(){

      if(_canvas.getActiveGroup()) {

        _canvas.discardActiveGroup();
        _canvas.renderAll();

      } else {

        _canvas.discardActiveObject()

      }

    }

    /**
     * Selects all object on canvas
     * @private
     */
    function _selectAll(){

      if(_canvas.getObjects().length > 0) {

        _clearSelection();

        var objs = _canvas.getObjects().map(function (o) {
          return o.set('active', true);
        });

        var group = new fabric.Group(objs, {
          originX: 'center',
          originY: 'center'
        });

        _canvas._activeObject = null;

        _canvas.setActiveGroup(group.setCoords()).renderAll();
      }
    }

    /**
     * Create a watermark
     * @private
     */
    function _initWaterMark(){

      _waterMark = new fabric.Text(WATERMARK_TEXT, {
        fontSize: WATERMARK_SIZE,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        //fill: 'white',
        backgroundColor: 'white',
        //stroke: '#555',
        //strokeWidth: 1.2,
        left: WATERMARK_PADDING
      });
    }

    /**
     * Draws watermark at canvas
     * @private
     */
    function _printWaterMark() {

      _waterMark.set({
        top: _canvas.height - _waterMark.height - WATERMARK_PADDING
      });
      _canvas.add(_waterMark);
    }

    /**
     * Remove watermark from canvas
     * @private
     */
    function _removeWaterMark() {

      _canvas.remove(_waterMark);
    }

    /**
     * handle mouse down on canvas
     * @private
     */
    function _onCanvasMouseDown(){

      var allTextObjects = self.getTextObjects();
      for(var i = 0; i < allTextObjects.length; i++){

        _checkEmptyIText(allTextObjects[i]);
      }
    }

    /**
     * Handle, that object was modified
     * @param e Event args
     * @private
     */
    function _onObjectsModified(e){

      _objectsProcessor.modified(e.target._objects ? e.target._objects : [e.target]);
      _optimizeCanvasSize();
    }

    /**
     * Handle, that object was moved
     * @param e Event args
     * @private
     */
    function _onObjectMoving(e) {

      _processStickToSmth(e.target);
    }

    /**
     * Handles, that object was selected
     * @param e
     * @private
     */
    function _onObjectsSelected(e){

      e.target.set(DEFAULT_OPTIONS);
    }

    /**
     * Handle press back hotkey
     * @private
     */
    function _onBack(){

      _clearSelection();
      _objectsProcessor.back();
      _optimizeCanvasSize();
    }

    /**
     * Handles, that user click to toolbar Clear objects
     * @private
     */
    function _onClearObjects(){

      if(_canvas.getObjects().length > 0 && confirm(CLEAR_OBJECTS_MESSAGE)) {

        _objectsProcessor.remove(_canvas.getObjects());
        _optimizeCanvasSize();
      }
    }

    /**
     * Handles, that user click to toolbar Text
     * @private
     */
    function _onAddText(){

      var mostLowerObject = _getMostLowerObject();
      var pos = {};

      if(mostLowerObject){

        var bounds = mostLowerObject.getBoundingRectSafely();
        pos.y = bounds.height + bounds.top + PADDING;

      } else {

        pos.y = PADDING;
      }
      pos.x = PADDING;

      self.addText(null, pos);
      _optimizeCanvasSize();
    }

    /**
     * Handles, that user drop Text from toolbar
     * @private
     */
    function _onDropText(e){

      var offset = _container.offset();
      var pointer = {
        x: e.pageX - offset.left,
        y: e.pageY - offset.top
      };

      if (!(pointer.x < 0 || pointer.y < 0 ||
        pointer.x > _canvas.width || pointer.y > _canvas.height)) {

        self.addText(null, pointer);
        _optimizeCanvasSize();

      }
    }

    /**
     * Handles, that user wants to save image
     * @private
     */
    function _onSave(){

      _clearSelection();
      _printWaterMark();
      _imageExporter.exportImage(
        _canvas.toDataURL({
            format: IMAGE_FORMAT,
            quality: IMAGE_QUALITY
        })
      );
      _removeWaterMark();
    }

    /**
     * Handles, that user want to see help
     * @private
     */
    function _onHelp(){

      _introduceViewer.show();
    }


    constructor();

  };
})();