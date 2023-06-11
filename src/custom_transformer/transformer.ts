import Konva from "konva";

export type transformAttrs = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export class CustomTransformer extends Konva.Transformer {
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
