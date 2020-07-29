import { pipe, create, map, switchMap, takeWhile, merge, listen } from "agos";
import { noop } from "./utils";
import throttleRAF from "./throttleRAF";
import fromEvent from "./fromEvent";
import fromMouseMove from "./fromMouseMove";
import fromMouseUp from "./fromMouseUp";

// revive-able? identify source listener when not use

const fromDrag = el =>
  create((open, next, fail, done, talkback) => {
    const initialize = () => {
      pipe(
        fromEvent(el, "mousedown"),
        throttleRAF,
        switchMap(e => {
          const { x, y } = e;
          next(["hold"], { x: 0, y: 0 });
          return merge([
            pipe(
              fromMouseMove(document),
              map(e => ({ x: e.clientX - x, y: e.clientY - y })),
              map(e => ["drag", e])
            ),
            pipe(
              fromMouseUp(document),
              map(e => ({ x: e.clientX - x, y: e.clientY - y })),
              map(e => ["release", e])
            )
          ]);
        }),
        takeWhile(([[name]]) => name === "drag", true),
        map(a => a[0]),
        listen(noop, next, fail, () => initialize(), talkback)
      );
    };

    open();
    initialize();
  });

export default fromDrag;
