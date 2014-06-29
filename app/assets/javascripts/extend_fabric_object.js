/**
 * Extends fabric object to ability to get bounding rect
 * for object safely (bounds are calculated wrong in a group)
 */
fabric.util.object.extend(fabric.Object.prototype, {
  /**
   * Gets bounding rect for object safely (bounds are calculated wrong in a group)
   */
  getBoundingRectSafely: function(){

    var result = {};

    if(this.group){

      var groupLeft = this.group.getLeft(),
          groupTop = this.group.getTop(),
          rotated = this.group._getRotatedLeftTop(this);

      var scaleX = this.get('scaleX') * this.group.get('scaleX'),
          scaleY = this.get('scaleY') * this.group.get('scaleY');

      result.left = groupLeft + rotated.left;
      result.top = groupTop + rotated.top;
      result.width = this.width * scaleX;
      result.height = this.height * scaleY;

    } else {

      result = this.getBoundingRect();
    }

    return result;
  },
  /**
   * Gets object properties safely (left, top, scale)
   */
  getPropertiesSafely: function(){

    var result = {};

    if (this.group) {

      var groupLeft = this.group.getLeft(),
        groupTop = this.group.getTop(),
        rotated = this.group._getRotatedLeftTop(this);

      result.left = groupLeft + rotated.left;
      result.top = groupTop + rotated.top;
      result.scaleX = this.get('scaleX') * this.group.get('scaleX');
      result.scaleY = this.get('scaleY') * this.group.get('scaleY');

    } else if(this.type === 'group'){

      var center = this.getCenterPoint(),
          width = this.currentWidth,
          height = this.currentHeight

      result.left = center.x - width / 2;
      result.top = center.y - height / 2;
      result.scaleX = this.scaleX;
      result.scaleY = this.scaleY;

    } else {

      result.left = this.left;
      result.top = this.top;
      result.scaleX = this.scaleX;
      result.scaleY = this.scaleY;

    }

    return result;
  },
  /**
   * Saves current state of object (left, top, scale, text)
   */
  saveCurrentState: function () {

    if (!this.currentState) {

      this.currentState = {};
    }

    var props = this.getPropertiesSafely();

    this.currentState.left = props.left;
    this.currentState.top = props.top;
    this.currentState.scaleX = props.scaleX;
    this.currentState.scaleY = props.scaleY;

    if(this.text) {

      this.currentState.text = this.text;
    }

  }
});
