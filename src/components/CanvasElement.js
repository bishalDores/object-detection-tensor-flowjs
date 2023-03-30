import React, { useState, useEffect } from "react";
import { Stage, Layer, Image } from "react-konva";
import useImage from "use-image";

const CanvasElement = ({ imgSrc, dimensions }) => {
  const [image] = useImage(imgSrc.src);
  const CANVAS_VIRTUAL_WIDTH = 700;
  const CANVAS_VIRTUAL_HEIGHT = 700;

  const scale = Math.min(
    window.innerWidth / CANVAS_VIRTUAL_WIDTH,
    window.innerHeight / CANVAS_VIRTUAL_HEIGHT
  );

  return (
    <Stage
      width={dimensions.width}
      height={dimensions.height}
      scaleX={scale}
      scaleY={scale}
    >
      <Layer>
        <Image image={image} />
      </Layer>
    </Stage>
  );
};

export default CanvasElement;
