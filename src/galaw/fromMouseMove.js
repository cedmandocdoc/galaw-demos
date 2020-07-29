import { pipe, map } from "agos";
import fromEvent from "./fromEvent";
import throttleRAF from "./throttleRAF";

const fromMouseMove = (el, options) =>
  pipe(
    fromEvent(el, "mousemove", options),
    throttleRAF,
    // to do what should respect here layer screen or change
    // the settings for initial reference
    // map(e => ({ x: e.layerX - x, y: e.layerY - y }))
  );

export default fromMouseMove;