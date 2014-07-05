(function(){

  var CLICK_DELAY = 100;

  /**
   * Shows introducing help
   * @constructor
   */
  longpost.IntroduceViewer = function(){

    var self = this;
    var _help;
    var _isShowed = false;

    function constructor(){

      _help = $('[data-help-container]');
    }

    /**
     * Shows container
     */
    self.show = function() {

      if(!_isShowed) {

        _help.addClass('active');
        _isShowed = true;
        _bindHideClick();
      }
    };

    /**
     * Hides container
     */
    self.hide = function() {

      _help.removeClass('active');
      _isShowed = false;
    };

    /**
     * Binds 'click' with timeout.
     * Because otherwise container hiding immediately.
     * @private
     */
    function _bindHideClick(){

      setTimeout(function(){

        $('body').one('click', self.hide);

      }, CLICK_DELAY);
    }

    constructor();
  };
})();