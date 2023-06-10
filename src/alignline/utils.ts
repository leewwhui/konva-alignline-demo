import { BoundingBox } from "./boundingBox";
import { AlignLine, AlignLineType } from "./types";

const abs = Math.abs;

export class Utils {
  static createAlignLine(
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): AlignLine {
    const isHorizontal = startY === endY;
    return {
      type: isHorizontal ? AlignLineType.HORIZONTAL : AlignLineType.VERTICAL,
      start: { x: startX, y: startY },
      end: { x: endX, y: endY },
    };
  }

  static yAxisOffset(line1: AlignLine, line2: AlignLine) {
    return line1.start.y - line2.start.y;
  }

  static xAxisOffset(line1: AlignLine, line2: AlignLine) {
    return line1.start.x - line2.start.x;
  }

  static calcDeltaY(
    boundingBox: BoundingBox,
    lines: AlignLine[],
    sorbRange: number
  ) {
    const [top, center, bottom] = boundingBox.getHorizontalLines();

    let start_offset = Infinity;
    let center_offset = Infinity;
    let end_offset = Infinity;

    let start_line: number | null = null;
    let center_line: number | null = null;
    let end_line: number | null = null;

    lines.forEach((line) => {
      const s_diff = this.yAxisOffset(line, top);
      const c_diff = this.yAxisOffset(line, center);
      const e_diff = this.yAxisOffset(line, bottom);

      if (abs(s_diff) <= sorbRange && abs(s_diff) < abs(start_offset)) {
        start_offset = s_diff;
        start_line = line.start.y;
      }

      if (abs(c_diff) <= sorbRange && abs(c_diff) < abs(center_offset)) {
        center_offset = c_diff;
        center_line = line.start.y;
      }

      if (abs(e_diff) <= sorbRange && abs(e_diff) < abs(end_offset)) {
        end_offset = e_diff;
        end_line = line.start.y;
      }
    });

    const min = this.getMinOffset([start_offset, center_offset, end_offset]);

    return {
      offset: {
        start: start_offset === Infinity ? null : start_offset,
        center: center_offset === Infinity ? null : center_offset,
        end: end_offset === Infinity ? null : end_offset,
        min: min === Infinity ? null : min,
      },
      absolute: {
        start: start_line,
        center: center_line,
        end: end_line,
      },
    };
  }

  static calcDeltaX(
    boundingBox: BoundingBox,
    lines: AlignLine[],
    sorbRange: number
  ) {
    const [top, center, bottom] = boundingBox.getVerticalLines();

    let start_offset = Infinity;
    let center_offset = Infinity;
    let end_offset = Infinity;

    let start_line: number | null = null;
    let center_line: number | null = null;
    let end_line: number | null = null;

    lines.forEach((line) => {
      const s_diff = this.xAxisOffset(line, top);
      const c_diff = this.xAxisOffset(line, center);
      const e_diff = this.xAxisOffset(line, bottom);

      if (abs(s_diff) <= sorbRange && abs(s_diff) < abs(start_offset)) {
        start_offset = s_diff;
        start_line = line.start.x;
      }

      if (abs(c_diff) <= sorbRange && abs(c_diff) < abs(center_offset)) {
        center_offset = c_diff;
        center_line = line.start.x;
      }

      if (abs(e_diff) <= sorbRange && abs(e_diff) < abs(end_offset)) {
        end_offset = e_diff;
        end_line = line.start.x; 
      }
    });

    const min = this.getMinOffset([start_offset, center_offset, end_offset]);
    return {
      offset: {
        start: start_offset === Infinity ? null : start_offset,
        center: center_offset === Infinity ? null : center_offset,
        end: end_offset === Infinity ? null : end_offset,
        min: min === Infinity ? null : min,
      },
      absolute: {
        start: start_line,
        center: center_line,
        end: end_line,
      }
    };
  }

  static getMinOffset(offsets: number[]) {
    return offsets.reduce((accumulator, current) => {
      if (Math.abs(accumulator) < Math.abs(current)) return accumulator;
      return current;
    }, Infinity);
  }

  static mergeHorizontalLines(lines: AlignLine[]) {
    const alignLinesMap = new Map<number, number[]>();

    lines.forEach((line) => {
      if (!Utils.isHorizontalLine(line)) return;
      const y = line.start.y;
      const startX = line.start.x;
      const endX = line.end.x;

      alignLinesMap.set(y, [...(alignLinesMap.get(y) || []), startX, endX]);
    });

    const keys = Array.from(alignLinesMap.keys());

    return keys.map((y) => ({
      type: AlignLineType.HORIZONTAL,
      start: { x: Math.min(...alignLinesMap.get(y)!), y },
      end: { x: Math.max(...alignLinesMap.get(y)!), y },
    }));
  }

  static mergeVerticalLines(lines: AlignLine[]) {
    const alignLinesMap = new Map<number, number[]>();

    lines.forEach((line) => {
      if (!Utils.isVerticalLine(line)) return;
      const x = line.start.x;
      const startY = line.start.y;
      const endY = line.end.y;

      alignLinesMap.set(x, [...(alignLinesMap.get(x) || []), startY, endY]);
    });

    const keys = Array.from(alignLinesMap.keys());

    return keys.map((x) => ({
      type: AlignLineType.HORIZONTAL,
      start: { x, y: Math.min(...alignLinesMap.get(x)!) },
      end: { x, y: Math.max(...alignLinesMap.get(x)!) },
    }));
  }

  static isHorizontalLine(line: AlignLine) {
    return line.start.y === line.end.y;
  }

  static isVerticalLine(line: AlignLine) {
    return line.start.x === line.end.x;
  }
}
