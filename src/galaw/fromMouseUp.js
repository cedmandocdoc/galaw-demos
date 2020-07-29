import { pipe, map } from "agos";
import fromEvent from "./fromEvent";
import throttleRAF from "./throttleRAF";

const fromMouseUp = el =>
  pipe(
    fromEvent(el, "mouseup"),
    throttleRAF,
    // map(e => ({ x: e.clientX - x, y: e.clientY - y }))
  );

export default fromMouseUp;