var longpost = {};

/**
 * Extend fabric object to ability to save previous state of object
 */
fabric.util.object.extend(fabric.Object.prototype, {
  //prevProps: {},
  savePrev: function () {

    if (!this.prevProps) {

      this.prevProps = {};
    }

    if (this.group) {

      var groupLeft = this.group.getLeft(),
          groupTop = this.group.getTop(),
          rotated = this.group._getRotatedLeftTop(this);

      this.prevProps.left = groupLeft + rotated.left;
      this.prevProps.top = groupTop + rotated.top;
      this.prevProps.scaleX = this.get('scaleX') * this.group.get('scaleX');
      this.prevProps.scaleY = this.get('scaleY') * this.group.get('scaleY');

    } else {

      this.prevProps.left = this.left;
      this.prevProps.top = this.top;
      this.prevProps.scaleX = this.scaleX;
      this.prevProps.scaleY = this.scaleY;

    }

    if(this.text) {

      this.prevProps.text = this.text;
    }

  }
});