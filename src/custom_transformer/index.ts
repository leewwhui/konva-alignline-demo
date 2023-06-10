import Konva from "konva";
import { CustomTransformer } from "./transformer";
import { TransformerConfig } from "konva/lib/shapes/Transformer";

export class TransformController {
  private _transformer: CustomTransformer;

  constructor(config?: TransformerConfig) {
    this._transformer = new CustomTransformer({
      rotationSnaps: [0, 90, 180, 270],
      shouldOverdrawWholeArea: true,
      anchorSize: 12,
      anchorStrokeWidth: 1.5,
      anchorCornerRadius: 2,
      borderStrokeWidth: 1.5,

      ...config,
    });

    this.attachEvents();
  }

  private attachEvents() {
    const transformer = this.transformer;
    const back = transformer.find(".back")[0] as Konva.Shape;

    // drag event handler
    back.on("pointerdown", (e) => {
      this.transformer.fire("dragstart", e);

      const dragging = (e: MouseEvent) => {
        const delta = { x: 0, y: 0 };
        this.transformer.fire("drag", { evt: e, delta });
      };

      const dragEnd = (e: MouseEvent) => {
        window.removeEventListener("mousemove", dragging);
        window.removeEventListener("mouseup", dragEnd);
        this.transformer.fire("dragend", { evt: e });
      };

      window.addEventListener("mousemove", dragging);
      window.addEventListener("mouseup", dragEnd);
    });
  }

  get transformer() {
    return this._transformer;
  }
}
