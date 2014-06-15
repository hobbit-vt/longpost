/**
 * Interface for events
 * @constructor
 */
longpost.EventDispatcher = function(){};

/**
 * Apply event interface to some object
 * @param object
 */
longpost.EventDispatcher.prototype.apply = function(object){

  object.addEvent = longpost.EventDispatcher.prototype.addEvent;
  object.removeEvent = longpost.EventDispatcher.prototype.removeEvent;
  object.dispatchEvent = longpost.EventDispatcher.prototype.dispatchEvent;

};

/**
 * Add event to object
 * @param type Type of event
 * @param listener Function for handle that event
 */
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

/**
 * Remove event from object
 * @param type Type of event
 * @param listener Function for handle that event
 */
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

/**
 * Fire event from object
 * @param type Type of event
 * @param args Event arguments
 */
longpost.EventDispatcher.prototype.dispatchEvent = function ( type, args ) {

  if ( this._listeners === undefined ) return;

  var listeners = this._listeners;
  var listenerArray = listeners[ type ];

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