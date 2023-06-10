import { BoundingBox } from './boundingBox';
import { AlignLine, AlignDirections, SorbResult, AlignResult } from './types';
import { Utils } from './utils';
import { IRect } from 'konva/lib/types';

export const prepareDetectAlignLines = (
  items: IRect[],
  active: IRect,
  sorbRange: number
) => {
  // collect all align lines
  let horizontalLines: AlignLine[] = [];
  let verticalLines: AlignLine[] = [];

  items.forEach(el => {
    if (el === active) return;
    const { x, y, width, height } = el;
    const boundingBox = new BoundingBox(x, y, width, height);
    horizontalLines.push(...boundingBox.getHorizontalLines());
    verticalLines.push(...boundingBox.getVerticalLines());
  });

  // merge all align lines
  horizontalLines = Utils.mergeHorizontalLines(horizontalLines);
  verticalLines = Utils.mergeVerticalLines(verticalLines);

  // invoke when drag elemnts to sorb
  function detectSorb(active: IRect): SorbResult {
    const { x, y, width, height } = active;
    const boundingBox = new BoundingBox(x, y, width, height);

    const xAxisSorb = Utils.calcDeltaX(boundingBox, verticalLines, sorbRange);

    const yAxisSorb = Utils.calcDeltaY(boundingBox, horizontalLines, sorbRange);

    return {
      x: xAxisSorb,
      y: yAxisSorb,
    };
  }

  // invoke after sorb, and display relative align lines
  function detectAlignLines(active: IRect): AlignResult {
    const horizontalAlignLines: AlignLine[] = [];
    const verticalAlignLines: AlignLine[] = [];

    const horizontal: Record<AlignDirections, AlignLine | null> = {
      [AlignDirections.START]: null,
      [AlignDirections.CENTER]: null,
      [AlignDirections.END]: null,
    };

    const vertical: Record<AlignDirections, AlignLine | null> = {
      [AlignDirections.START]: null,
      [AlignDirections.CENTER]: null,
      [AlignDirections.END]: null,
    };

    const { x, y, width, height } = active;
    const boundingBox = new BoundingBox(x, y, width, height);

    horizontalLines.forEach(h => {
      horizontalAlignLines.push(...boundingBox.getRelativeHorizontalLine(h));
    });

    verticalLines.forEach(v => {
      verticalAlignLines.push(...boundingBox.getRelativeVerticalLine(v));
    });

    horizontalAlignLines.forEach(line => {
      const direction = boundingBox.getHorizontalLineDirection(line);
      if (direction) horizontal[direction] = line;
    });

    verticalAlignLines.forEach(line => {
      const direction = boundingBox.getVerticalLineDirection(line);
      if (direction) vertical[direction] = line;
    });

    return {
      horizontalAlignLines,
      verticalAlignLines,
      horizontal,
      vertical,
      alignLines: [...horizontalAlignLines, ...verticalAlignLines],
    };
  }

  return {
    detectSorb,
    detectAlignLines,
    getState: () => {
      return { horizontalLines, verticalLines };
    },
  };
};
