/**
 * Processor for object on canvas (add/remove/modification/back operations)
 * @param canvas Fabric canvas
 * @constructor
 */
longpost.ObjectProcessor = function(canvas){

  longpost.EventDispatcher.prototype.apply(this);
  var self = this;

  /**
   * Possible actions
   * @type {object}
   */
  var ACTION = {
    add: 0,
    remove: 1,
    modify: 2
  };

  /**
   * Internal objects collections
   * Object key - internal id
   * Object value - fabric object
   * @type {object}
   * @private
   */
  var _objects = {};
  /**
   * Stack for backward operations
   *  {
   *    ids: [],
   *    action: '',
   *    prevProps: {}
   *  }
   * @type {Array}
   * @private
   */
  var _backStack = [];

  function constructor(){

    var state = _loadState();

    if(state !== null) {

      canvas.loadFromJSON(state,
        function(){ //callback loading


          self.dispatchEvent(longpost.ObjectProcessor.EVENT.loadStateComplete);

        }, function(json, object){ //callback for every loaded object

          _objects[longpost.Helper.generateUUID()] = object;
          object.saveCurrentState();
        });
    }
  }

  /**
   * Add objects to canvas
   * @param {array} addingObjects Objects array for adding
   */
  self.add = function(addingObjects){

    var ids = [];
    for(var i = 0; i < addingObjects.length; i++) {

      ids.push(longpost.Helper.generateUUID());
      _objects[ids[ids.length - 1]] = addingObjects[i];

      canvas.add(addingObjects[i]);
      addingObjects[i].saveCurrentState();
    }

    _backStack.push({
      ids: ids,
      action: ACTION.add
    });
    _saveState();
  };

  /**
   * Remove objects from canvas
   * @param {array} removingObjects Objects array for removing
   */
  self.remove = function(removingObjects){

    var ids = _getInternalObjectsIds(removingObjects);

    for(var i = 0; i < ids.length; i++){

      canvas.remove(_objects[ids[i]]);
    }
    canvas.discardActiveGroup().renderAll();

    _backStack.push({
      ids: ids,
      action: ACTION.remove
    });
    _saveState();
  };

  /**
   * Tell, that something was modified
   * @param {array} objects Objects, that were modified
   */
  self.modified = function (objects) {

    var ids = _getInternalObjectsIds(objects);
    var props = [];

    for(var i = 0; i < ids.length; i++){

      props.push(longpost.Helper.clone(objects[i].currentState));
      console.log(objects[i].currentState);
      objects[i].saveCurrentState();
    }

    _backStack.push({
      ids: ids,
      action: ACTION.modify,
      prevProps: props
    });
    _saveState();
  };

  /**
   * Backward action
   */
  self.back = function(){

    var stackItem = _backStack.pop();
    if (!stackItem) return;

    var iter;

    if (stackItem.action === ACTION.add) {

      for(iter = 0; iter < stackItem.ids.length; iter++){

        canvas.remove(_objects[stackItem.ids[iter]]);
        delete _objects[stackItem.ids[iter]];
      }
    } else if (stackItem.action === ACTION.remove) {

      for(iter = 0; iter < stackItem.ids.length; iter++){

        canvas.add(_objects[stackItem.ids[iter]]);
      }
    } else if (stackItem.action === ACTION.modify) {

      for(iter = 0; iter < stackItem.ids.length; iter++){

        _objects[stackItem.ids[iter]].set(stackItem.prevProps[iter]);
        _objects[stackItem.ids[iter]].setCoords();
        _objects[stackItem.ids[iter]].saveCurrentState();
      }
    }
    canvas.renderAll();
    _saveState();
  };

  /**
   * Resolve objects and their id
   * @param objects Objects for resolve
   * @returns {Array} Internal objects id
   * @private
   */
  function _getInternalObjectsIds(objects){

    var ids = [];

    for(var i = 0; i < objects.length; i++) {

      for(var internalObjId in _objects){

        if(_objects[internalObjId] === objects[i]){

          ids.push(internalObjId);
        }
      }
    }
    return ids;
  }

  /**
   * Serializes canvas sate in local storage
   * @private
   */
  function _saveState(){

    var serialized = canvas.toJSON(['padding']);

    try {

      window.localStorage.setItem(longpost.ObjectProcessor.STORAGE_KEY, JSON.stringify(serialized));

    } catch(e) {

      console.error('Can\'t save canvas =( It\'s so much size. Need UI error')
    }

  }

  /**
   * Deserializes canvas from local storage
   * @returns {*|Object}
   * @private
   */
  function _loadState(){

    var result = null;
    var deserialized;
    try {
      deserialized = window.localStorage.getItem(longpost.ObjectProcessor.STORAGE_KEY);
    } catch (e){

    }

    if(deserialized) {

      result = JSON.parse(deserialized);
    }

    return result;
  }

  constructor();

};

longpost.ObjectProcessor.STORAGE_KEY = '_canvas_state_'
longpost.ObjectProcessor.EVENT = {
  saveStateError: 'saveStateError',
  loadStateComplete: 'loadStateComplete'
};