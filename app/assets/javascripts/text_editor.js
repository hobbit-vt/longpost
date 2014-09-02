var ste = {
  ver: '0.0.0'
};

(function(){

  var CONTAINER_CLASS = 'ste-editor';
  var TEXTAREA_CLASS = 'ste-editor__editor';
  var TOOLBAR_CLASS = 'ste-editor__toolbar';

  ste.Editor = function(containerSelector){

    this._container = document.querySelector(containerSelector);
  };
  ste.Editor.prototype = {
    constructor: ste.Editor,

    _inited: false,
    _textarea: null,
    _toolbar: null,
    _arrow: null,

    _defaultColor: 'black',

    /**
     * Initializes
     */
    init: function(){

      this._createToolbar();

      var textArea = document.createElement('div');
      textArea.setAttribute('contenteditable', 'true');
      textArea.style.color = this._defaultColor;
      ste.Helper.addClass(textArea, TEXTAREA_CLASS);

      this._container.appendChild(textArea);
      ste.Helper.addClass(this._container, CONTAINER_CLASS);

      this._textarea = textArea;
      this._inited = true;
    },

    setDefaultColor: function(color){

      if(this._inited){

        this._textarea.style.color = color;
      }
    },

    setPosition: function(){

    },

    setWidth: function(){

    },

    /**
     * Export editor content to image
     * @param callback Will be invoke when image is ready
     */
    toImage: function(callback){

      if(this._inited) {

        html2canvas(this._textarea, {
          onrendered: function (canvas) {

            callback(
              canvas.toDataURL('image/png')
            )
          }.bind(this)
        })

      } else  {

        callback(null);
      }
    },


    _createToolbar: function(){

      var toolbar = document.createElement('div');
      ste.Helper.addClass(toolbar, TOOLBAR_CLASS);

      this._container.appendChild(toolbar);
    }
  };

  ste.Helper = {
    addClass: addClass
  };

  function addClass(element, cls){
    var space = ' ';
    if(element.className === ''){
      space = '';
    }
    element.className += space + cls;
  }
})();