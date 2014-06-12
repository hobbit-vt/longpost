longpost.EventDispatcher = function(){};

longpost.EventDispatcher.prototype.apply = function(object){

  object.addEvent = longpost.EventDispatcher.prototype.addEvent;
  object.removeEvent = longpost.EventDispatcher.prototype.removeEvent;
  object.dispatchEvent = longpost.EventDispatcher.prototype.dispatchEvent;

};

longpost.EventDispatcher.prototype.addEvent = function ( type, listener ) {
  if ( this._listeners === undefined ) this._listeners = {};

  var listeners = this._listeners;

  if ( listeners[ type ] === undefined ) {
    listeners[ type ] = [];
  }

  if ( listeners[ type ].indexOf( listener ) === - 1 ) {
    listeners[ type ].push( listener );
  }
};

longpost.EventDispatcher.prototype.removeEvent = function ( type, listener ) {

  if ( this._listeners === undefined ) return;

  var listeners = this._listeners;
  var listenerArray = listeners[ type ];

  if ( listenerArray !== undefined ) {

    var index = listenerArray.indexOf( listener );

    if ( index !== - 1 ) {

      listenerArray.splice( index, 1 );

    }

  }

};

longpost.EventDispatcher.prototype.dispatchEvent = function ( event, args ) {

  if ( this._listeners === undefined ) return;

  var listeners = this._listeners;
  var listenerArray = listeners[ event ];

  if ( listenerArray !== undefined ) {

    var array = [];
    var length = listenerArray.length;

    for ( var i = 0; i < length; i ++ ) {

      array[ i ] = listenerArray[ i ];

    }

    for ( var i = 0; i < length; i ++ ) {

      array[ i ].call( this, args );

    }

  }

};