/**
 * Controller for outside events
 * @param core Longpost core object
 * @constructor
 */
longpost.OutsideController = function(core){

  longpost.EventDispatcher.prototype.apply(this);
  var self = this;

  var _core = core;

  function constructor(){

    $(window).scroll(_onWindowScroll);

    _initDragDrop();
    _initClickEvent();

    $(window).keydown(_onKeyDown)
  }

  self.EVENT = {
    drop: 'drop',
    click: 'click',
    back: 'back',
    clearSelection: 'clearSelection',
    'delete': 'delete'
  };

  /**
   * initialize drag and drop functionality
   * @private
   */
  function _initDragDrop(){

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
      drop: _dropSuccess
    });

  }

  /**
   * Initialize click event
   * @private
   */
  function _initClickEvent(){

    _core.getCanvas().on('mouse:down', function(){

    });
    _core.getCanvas().on('mouse:up', function(){

    });
  }

  /**
   * success drop to page
   * @param event Drop event
   * @returns {boolean} return for preventDefault
   * @private
   */
  function _dropSuccess(event){

    var files = event.originalEvent.dataTransfer.files;

    for(var i = 0; i < files.length; i++) {

      (function(j){

        if(files[j].type.match('image')) {
          var reader = new FileReader();
          reader.onload = function (file) {
            self.dispatchEvent(self.EVENT.drop, file.target.result);
          };
          reader.readAsDataURL(files[j]);
        }

      }(i));
    }
    return false;
  }

  /**
   * handle window scroll
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
   * Handle key down
   * @param e Event args
   * @private
   */
  function _onKeyDown(e) {

    //console.log(e);

    if(e.which === 90) { // press z

      if(e.metaKey || e.ctrlKey) {

        self.dispatchEvent(self.EVENT.back);
        e.preventDefault();
      }

    } else if(e.which === 68) { // press d

      if(e.metaKey || e.ctrlKey) {

        self.dispatchEvent(self.EVENT.clearSelection);
        e.preventDefault();
      }

    } else if(e.which === 8 || e.which === 46) {

      self.dispatchEvent(self.EVENT.delete);
      e.preventDefault();
    }
  }

  constructor();

};