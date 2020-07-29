import { create, CANCEL, never } from "agos";
import { noop } from "./utils";

const fromEvent = (target, name, options) =>
  create((open, next, fail, done, talkback) => {
    open();
    target.addEventListener(name, next, options);
    talkback.listen(
      noop,
      payload => {
        if (payload[0] === CANCEL) {
          target.removeEventListener(name, next);
          done(true);
        }
      },
      noop,
      noop,
      never()
    );
  });

export default fromEvent;
