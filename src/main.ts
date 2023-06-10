import Konva from "konva";
import { TransformController } from "./custom_transformer";
import { prepareDetectAlignLines } from "./alignline";
import { rect1, rect2, rect3 } from "./shapes";
import { AlignLine } from "./alignline/types";

const width = window.innerWidth;
const height = window.innerHeight;

const stage = new Konva.Stage({
  container: "app",
  width: width,
  height: height,
});

const shapeGroup = new Konva.Group();
const layer = new Konva.Layer();
const alignlineLayer = new Konva.Layer();

layer.add(shapeGroup);
stage.add(layer, alignlineLayer);

shapeGroup.add(rect1, rect2, rect3);

const tr = new TransformController({ keepRatio: false }).transformer;
layer.add(tr);

const renderLine = (line: AlignLine) => {
  const start = line.start;
  const end = line.end;
  return new Konva.Line({
    points: [start.x, start.y, end.x, end.y],
    stroke: "#0eb9f7",
    strokeWidth: 2,
  });
};

stage.on("click tap", function (e) {
  if (e.target === stage) {
    tr.nodes([]);
    return;
  }

  if (!e.target.hasName("rect")) return;

  const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
  const isSelected = tr.nodes().indexOf(e.target) >= 0;

  if (!metaPressed && !isSelected) {
    tr.nodes([e.target]);
  } else if (metaPressed && isSelected) {
    const nodes = tr.nodes().slice();
    nodes.splice(nodes.indexOf(e.target), 1);
    tr.nodes(nodes);
  } else if (metaPressed && !isSelected) {
    const nodes = tr.nodes().concat([e.target]);
    tr.nodes(nodes);
  }
});

tr.on("dragstart", () => {
  const childs = shapeGroup
    .getChildren()
    .filter((node) => !tr.nodes().includes(node));

  const detectedItems = childs.map((child) => {
    if (child instanceof Konva.Group) {
      return child.getClientRect();
    }
    return child.getClientRect();
  });

  const detect = prepareDetectAlignLines(detectedItems, tr.getClientRect(), 5);

  const detectSorb = detect.detectSorb;
  const detectAlignLines = detect.detectAlignLines;

  tr.on("drag", () => {
    tr.anchorSize(0);
    tr.rotateEnabled(false);

    if (detectSorb) {
      const clientRect = tr.getClientRect();
      const { x, y } = detectSorb(clientRect);

      tr.nodes().forEach((node) => {
        x.offset.min && node.x(node.x() + x.offset.min);
        y.offset.min && node.y(node.y() + y.offset.min);
      });
    }

    if (detectAlignLines) {
      const clientRect = tr.getClientRect();
      alignlineLayer.removeChildren();

      const { alignLines } = detectAlignLines(clientRect);

      alignLines.forEach((line) => {
        alignlineLayer.add(renderLine(line));
      });
    }
  });
});

tr.on("dragend", () => {
  tr.anchorSize(12);
  tr.rotateEnabled(true);
  alignlineLayer.removeChildren();
  tr.off("drag");
});

tr.on("transformstart", () => {
  const sorbRange = 5;

  const childs = shapeGroup
    .getChildren()
    .filter((node) => !tr.nodes().includes(node));

  const detectedItems = childs.map((child) => {
    if (child instanceof Konva.Group) {
      return child.getClientRect();
    }
    return child.getClientRect();
  });

  const detect = prepareDetectAlignLines(
    detectedItems,
    tr.getClientRect(),
    sorbRange
  );

  const detectSorb = detect.detectSorb;
  const detectAlignLines = detect.detectAlignLines;

  tr.anchorDragBoundFunc((_, newAbsPos) => {
    let absX = newAbsPos.x;
    let absY = newAbsPos.y;

    if (tr.rotation() !== 0) return newAbsPos;
    if (detectSorb) {
      const clientRect = tr.getClientRect();
      const { x, y } = detectSorb(clientRect);

      if (y.absolute.start && Math.abs(absY - y.absolute.start) <= sorbRange) {
        absY = y.absolute.start;
      }

      if (y.absolute.end && Math.abs(absY - y.absolute.end) <= sorbRange) {
        absY = y.absolute.end;
      }

      if (x.absolute.start && Math.abs(absX - x.absolute.start) <= sorbRange) {
        absX = x.absolute.start;
      }

      if (x.absolute.end && Math.abs(absX - x.absolute.end) <= sorbRange) {
        absX = x.absolute.end;
      }
    }

    return { x: absX, y: absY };
  });

  tr.on("transform", () => {
    if (
      detectAlignLines &&
      tr.getActiveAnchor() !== "rotater" &&
      tr.rotation() === 0
    ) {
      const clientRect = tr.getClientRect();
      alignlineLayer.removeChildren();

      const { horizontal, vertical } = detectAlignLines(clientRect);
      const activeAnchor = tr.getActiveAnchor();

      if (activeAnchor.includes("top") && horizontal.start) {
        alignlineLayer.add(renderLine(horizontal.start));
      }

      if (activeAnchor.includes("bottom") && horizontal.end) {
        alignlineLayer.add(renderLine(horizontal.end));
      }

      if (activeAnchor.includes("left") && vertical.start) {
        alignlineLayer.add(renderLine(vertical.start));
      }

      if (activeAnchor.includes("right") && vertical.end) {
        alignlineLayer.add(renderLine(vertical.end));
      }
    }
  });
});

tr.on("transformend", () => {
  alignlineLayer.removeChildren();
  tr.off("transform");
});
