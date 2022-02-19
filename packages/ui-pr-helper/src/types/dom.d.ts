import type { Rectangle } from "sketch/dom";

declare type ImageLayerFrame = {
  x:  number
  y: number
  width: number
  height: number
} & Partial<Rectangle>
