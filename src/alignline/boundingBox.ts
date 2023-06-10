import Konva from "konva";
import { AlignLine, AlignDirections } from "./types";
import { Utils } from "./utils";

export class BoundingBox {
  private left: number;
  private top: number;
  private width: number;
  private height: number;

  constructor(left: number, top: number, width: number, height: number) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
  }

  static createBoundingBox(element: Konva.Shape) {
    const { x, y, width, height } = element.getClientRect();
    return new BoundingBox(x, y, width, height);
  }

  getHorizontalLines(): AlignLine[] {
    const x = this.left;
    const y = this.top;
    const endX = this.left + this.width;
    const centerY = this.top + this.height / 2;
    const endY = this.top + this.height;

    return [
      Utils.createAlignLine(x, y, endX, y),
      Utils.createAlignLine(x, centerY, endX, centerY),
      Utils.createAlignLine(x, endY, endX, endY),
    ];
  }

  getVerticalLines(): AlignLine[] {
    const x = this.left;
    const y = this.top;
    const endY = this.top + this.height;
    const centerX = this.left + this.width / 2;
    const endX = this.left + this.width;

    return [
      Utils.createAlignLine(x, y, x, endY),
      Utils.createAlignLine(centerX, y, centerX, endY),
      Utils.createAlignLine(endX, y, endX, endY),
    ];
  }

  getHorizontalLineDirection(line: AlignLine): AlignDirections | null {
    const [start, center, end] = this.getHorizontalLines();
    if (start.start.y === line.start.y) return AlignDirections.START;
    if (center.start.y === line.start.y) return AlignDirections.CENTER;
    if (end.start.y === line.start.y) return AlignDirections.END;

    return null;
  }

  getVerticalLineDirection(line: AlignLine): AlignDirections | null {
    const [start, center, end] = this.getVerticalLines();
    if (start.start.x === line.start.x) return AlignDirections.START;
    if (center.start.x === line.start.x) return AlignDirections.CENTER;
    if (end.start.x === line.start.x) return AlignDirections.END;

    return null;
  }

  getRelativeHorizontalLine(line: AlignLine) {
    const selfs = this.getHorizontalLines();
    const results: AlignLine[] = [];
    for (let i = 0; i < selfs.length; i++) {
      const self = selfs[i];
      const startY = self.start.y;

      const diff = Utils.yAxisOffset(self, line);
       
      if (Math.round(diff) === 0) {
        const startX = Math.min(line.start.x, self.start.x);
        const endX = Math.max(line.end.x, self.end.x);

        const alignLine = Utils.createAlignLine(startX, startY, endX, startY);

        results.push(alignLine);
      }
    }
    return results;
  }

  getRelativeVerticalLine(line: AlignLine) {
    const selfs = this.getVerticalLines();
    const results: AlignLine[] = [];

    for (let i = 0; i < selfs.length; i++) {
      const self = selfs[i];
      const startX = self.start.x;

      const diff = Utils.xAxisOffset(self, line);

      if (Math.round(diff) === 0) {
        const startY = Math.min(self.start.y, line.start.y);
        const endY = Math.max(self.end.y, line.end.y);

        const alignLine = Utils.createAlignLine(startX, startY, startX, endY);

        results.push(alignLine);
      }
    }
    return results;
  }

  get date() {
    return {
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,
    };
  }
}
