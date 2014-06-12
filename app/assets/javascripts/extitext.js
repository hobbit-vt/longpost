fabric.ExtIText = fabric.util.createClass(fabric.IText, fabric.Observable, {

  type: "ext-i-text",

  initialize: function(text, options) {
    this.styles = options ? (options.styles || { }) : { };
    this.callSuper('initialize', text, options);

  }

});