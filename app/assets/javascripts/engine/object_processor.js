/**
 * Processor for object on canvas (add/remove/modification/back operations)
 * @param canvas Fabric canvas
 * @constructor
 */
longpost.ObjectProcessor = function(canvas){

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
      addingObjects[i].savePrev();
    }

    _backStack.push({
      ids: ids,
      action: ACTION.add
    });
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
  };

  /**
   * Tell, that something was modified
   * @param {array} objects Objects, that were modified
   */
  self.modified = function (objects) {

    var ids = _getInternalObjectsIds(objects);
    var props = [];

    for(var i = 0; i < ids.length; i++){

      props.push(longpost.Helper.clone(objects[i].prevProps));
      console.log(objects[i].prevProps);
      objects[i].savePrev();
    }

    _backStack.push({
      ids: ids,
      action: ACTION.modify,
      prevProps: props
    });
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
        _objects[stackItem.ids[iter]].savePrev();
      }
    }
    canvas.renderAll();
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

  constructor();

};