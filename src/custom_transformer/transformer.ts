import Konva from "konva";
import { Konva as GlobalKonva } from "konva/lib/Global";
import { Transform, Util } from "konva/lib/Util";

export type transformAttrs = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export class CustomTransformer extends Konva.Transformer {
  _fitNodesInto(newAttrs: transformAttrs, evt?: MouseEvent) {
    var oldAttrs = this._getNodeRect();

    const minSize = 1;

    if (Util._inRange(newAttrs.width, -this.padding() * 2 - minSize, minSize)) {
      this.update();
      return;
    }
    if (
      Util._inRange(newAttrs.height, -this.padding() * 2 - minSize, minSize)
    ) {
      this.update();
      return;
    }

    const allowNegativeScale = this.flipEnabled();
    var t = new Transform();
    t.rotate(GlobalKonva.getAngle(this.rotation()));
    if (
      this._movingAnchorName &&
      newAttrs.width < 0 &&
      this._movingAnchorName.indexOf("left") >= 0
    ) {
      const offset = t.point({
        x: -this.padding() * 2,
        y: 0,
      });
      newAttrs.x += offset.x;
      newAttrs.y += offset.y;
      newAttrs.width += this.padding() * 2;
      this._movingAnchorName = this._movingAnchorName.replace("left", "right");
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      if (!allowNegativeScale) {
        this.update();
        return;
      }
    } else if (
      this._movingAnchorName &&
      newAttrs.width < 0 &&
      this._movingAnchorName.indexOf("right") >= 0
    ) {
      const offset = t.point({
        x: this.padding() * 2,
        y: 0,
      });
      this._movingAnchorName = this._movingAnchorName.replace("right", "left");
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      newAttrs.width += this.padding() * 2;
      if (!allowNegativeScale) {
        this.update();
        return;
      }
    }
    if (
      this._movingAnchorName &&
      newAttrs.height < 0 &&
      this._movingAnchorName.indexOf("top") >= 0
    ) {
      const offset = t.point({
        x: 0,
        y: -this.padding() * 2,
      });
      newAttrs.x += offset.x;
      newAttrs.y += offset.y;
      this._movingAnchorName = this._movingAnchorName.replace("top", "bottom");
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      newAttrs.height += this.padding() * 2;
      if (!allowNegativeScale) {
        this.update();
        return;
      }
    } else if (
      this._movingAnchorName &&
      newAttrs.height < 0 &&
      this._movingAnchorName.indexOf("bottom") >= 0
    ) {
      const offset = t.point({
        x: 0,
        y: this.padding() * 2,
      });
      this._movingAnchorName = this._movingAnchorName.replace("bottom", "top");
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      newAttrs.height += this.padding() * 2;
      if (!allowNegativeScale) {
        this.update();
        return;
      }
    }

    if (this.boundBoxFunc()) {
      const bounded = this.boundBoxFunc()(oldAttrs, newAttrs);
      if (bounded) {
        newAttrs = bounded;
      } else {
        Util.warn(
          "boundBoxFunc returned falsy. You should return new bound rect from it!"
        );
      }
    }

    const baseSize = 10000000;
    const oldTr = new Transform();
    oldTr.translate(oldAttrs.x, oldAttrs.y);
    oldTr.rotate(oldAttrs.rotation);
    oldTr.scale(oldAttrs.width / baseSize, oldAttrs.height / baseSize);

    const newTr = new Transform();
    newTr.translate(newAttrs.x, newAttrs.y);
    newTr.rotate(newAttrs.rotation);
    newTr.scale(newAttrs.width / baseSize, newAttrs.height / baseSize);

    const delta = newTr.multiply(oldTr.invert());
    const node_attrs = new Map();

    this._nodes.forEach((node) => {
      const parentTransform = node.getParent().getAbsoluteTransform();
      const localTransform = node.getTransform().copy();
      localTransform.translate(node.offsetX(), node.offsetY());

      const newLocalTransform = new Transform();
      newLocalTransform
        .multiply(parentTransform.copy().invert())
        .multiply(delta)
        .multiply(parentTransform)
        .multiply(localTransform);

      const attrs = newLocalTransform.decompose();
      node.setAttrs(attrs);
      node_attrs.set(node, attrs);
    });

    this._fire("transform", { evt: evt, node_attrs });
    this.rotation(Util._getRotation(newAttrs.rotation));
    this._resetTransformCache();
    this.update();

    const layer = this.getLayer();
    if (layer) layer.batchDraw();
  }

  getClientRect() {
    const { width, height } = this.find(".back")[0].getClientRect();

    const top_left = this.find(".top-left")[0];
    const top_right = this.find(".top-right")[0];
    const bottom_left = this.find(".bottom-left")[0];
    const bottom_right = this.find(".bottom-right")[0];

    const anchors = [top_left, top_right, bottom_left, bottom_right];

    const x = Math.min(...anchors.map((node) => node.getAbsolutePosition().x));
    const y = Math.min(...anchors.map((node) => node.getAbsolutePosition().y));

    return {
      x,
      y,
      width: width - this.borderStrokeWidth(),
      height: height - this.borderStrokeWidth(),
    };
  }
}
