export type positionType = { x: number; y: number };

export enum AlignLineType {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}

export enum AlignDirections {
  START = "start",
  CENTER = "center",
  END = "end",
}

export interface BoundingBoxProps {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface AlignLine {
  type: AlignLineType;
  start: positionType;
  end: positionType;
}

export interface SorbResult {
  x: {
    offset: {
      start: null | number;
      center: null | number;
      end: null | number;
      min: null | number;
    };
    absolute: {
      start: null | number;
      center: null | number;
      end: null | number;
    };
  };
  y: {
    offset: {
      start: null | number;
      center: null | number;
      end: null | number;
      min: null | number;
    };
    absolute: {
      start: null | number;
      center: null | number;
      end: null | number;
    };
  };
}

export interface AlignResult {
  horizontalAlignLines: AlignLine[];
  verticalAlignLines: AlignLine[];
  horizontal: Record<AlignDirections, AlignLine | null>;
  vertical: Record<AlignDirections, AlignLine | null>;
  alignLines: AlignLine[];
}
