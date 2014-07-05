(function(){

  var TOOLBAR_TEXT = '[data-toolbar-text]';
  var TOOLBAR_CLEAR = '[data-toolbar-clear]';
  var TOOLBAR_SAVE = '[data-toolbar-save]';
  var TOOLBAR_HELP = '[data-toolbar-help]';

  /**
   * Controller for outside events
   * @param core Longpost core object
   * @constructor
   */
  longpost.OutsideController = function(core){

    longpost.EventDispatcher.prototype.apply(this);
    var self = this;

    var _core = core;

    /**
     * is true if text was dropped from toolbar
     * @type {boolean}
     * @private
     */
    var _isNeedToCancelTextToolbarClick = false;

    function constructor(){

      $(window).scroll(_onWindowScroll);

      _initOutsideDragDrop();
      _initToolbar();

      $(window).keydown(_onKeyDown)
    }

    /**
     * Initializes toolbar buttons
     * @private
     */
    function _initToolbar(){

      var textButton = $(TOOLBAR_TEXT);
      textButton.draggable();
      textButton.bind('dropped', _textToolbarDropSuccess);
      textButton.bind('mousedown', _textToolbarMouseDown);
      textButton.bind('mouseup', _textToolbarMouseUp);

      var clearButton = $(TOOLBAR_CLEAR);
      clearButton.bind('click', _clearToolbarClick);

      var saveButton = $(TOOLBAR_SAVE);
      saveButton.bind('click', _saveToolbarClick);

      var helpButton = $(TOOLBAR_HELP);
      helpButton.bind('click', _helpToolbarClick);
    }

    /**
     * initializes drag and drop functionality
     * @private
     */
    function _initOutsideDragDrop(){

      $("body").bind({
        dragenter: function() {
          return false;
        },
        dragover: function() {
          return false;
        },
        dragleave: function() {
          return false;
        },
        drop: _outsideDropSuccess
      });

    }

    /**
     * success drop to page
     * @param event Drop event
     * @returns {boolean} return for preventDefault
     * @private
     */
    function _outsideDropSuccess(event){

      var files = event.originalEvent.dataTransfer.files;

      for(var i = 0; i < files.length; i++) {

        (function(j){

          if(files[j].type.match('image')) {
            var reader = new FileReader();
            reader.onload = function (file) {
              self.dispatchEvent(longpost.OutsideController.EVENT.imageDrop, file.target.result);
            };
            reader.readAsDataURL(files[j]);
          }

        }(i));
      }
      return false;
    }

    /**
     * handles window scroll
     * @private
     */
    function _onWindowScroll(){

      var textObjects = _core.getTextObjects();

      for(var i = 0; i < textObjects.length; i++){
        if(textObjects[i].hiddenTextarea){
          textObjects[i].hiddenTextarea.style.top = window.scrollY + 'px';
        }
      }

    }

    /**
     * Handles key down
     * @param e Event args
     * @private
     */
    function _onKeyDown(e) {

      if(e.which === 90) { // press z

        if(e.metaKey || e.ctrlKey) {

          self.dispatchEvent(longpost.OutsideController.EVENT.back);
          e.preventDefault();
        }

      } else if(e.which === 68) { // press d

        if(e.metaKey || e.ctrlKey) {

          self.dispatchEvent(longpost.OutsideController.EVENT.clearSelection);
          e.preventDefault();
        }

      } else if(e.which === 8 || e.which === 46) { // press delete or backspace

        self.dispatchEvent(longpost.OutsideController.EVENT.delete);
        e.preventDefault();

      } else if(e.which === 65) { // press a

        if(e.metaKey || e.ctrlKey) {

          self.dispatchEvent(longpost.OutsideController.EVENT.selectAll);
          e.preventDefault();
        }
      }
    }

    function _textToolbarMouseDown(){

      _isNeedToCancelTextToolbarClick = false;
    }

    /**
     * If drop text not triggered
     * @private
     */
    function _textToolbarMouseUp(){

      if(!_isNeedToCancelTextToolbarClick) {

        self.dispatchEvent(longpost.OutsideController.EVENT.addText);
      }
    }

    function _textToolbarDropSuccess(e){

      _isNeedToCancelTextToolbarClick = true;

      self.dispatchEvent(longpost.OutsideController.EVENT.dropText, e);
    }

    function _clearToolbarClick(){

      self.dispatchEvent(longpost.OutsideController.EVENT.clearObjects);
    }

    function _saveToolbarClick(){

      self.dispatchEvent(longpost.OutsideController.EVENT.save);
    }

    function _helpToolbarClick(){

      self.dispatchEvent(longpost.OutsideController.EVENT.help);
    }

    constructor();

  };

  longpost.OutsideController.EVENT = {
    imageDrop: 'drop',
    click: 'click',
    selectAll: 'selectAll',
    back: 'back',
    clearSelection: 'clearSelection',
    'delete': 'delete',
    dropText: 'dropText',
    addText: 'text',
    clearObjects: 'clearObjects',
    save: 'save',
    help: 'help'
  };

})();