import { create, never, CANCEL } from "agos";
import { noop } from "./utils";

import engine from "./engine";

export const PLAY = Symbol("play");
export const PAUSE = Symbol("pause");
export const REVERSE = Symbol("reverse");
export const JUMP = Symbol("jump");

const clock = create((open, next, fail, done, talkback) => {
  let id = 0;
  let start = 0;
  let offset = 0;
  let current = 0;
  let forward = true;

  const play = () => {
    if (id) return;
    start = 0;
    id = engine.add(time => {
      start = start || time;
      current = forward ? time - start + offset : offset - (time - start);
      next({ time: current, forward });
    });
  };

  const pause = () => {
    if (!id) return;
    engine.delete(id);
    id = 0;
    start = 0;
    offset = current;
  };

  const reverse = () => {
    start = 0;
    offset = current;
    forward = !forward;
    play();
  };

  const jump = time => {
    start = 0;
    current = time;
    offset = time;
    if (!id) {
      id = engine.add(time => {
        start = start || time;
        current = forward ? time - start + offset : offset - (time - start);
        next({ time: current, forward });
        engine.delete(id);
        id = 0;
      });
    }
  };

  const cancel = () => {
    pause();
    done(true);
  };

  open();
  play();

  talkback.listen(
    noop,
    ([type, payload]) => {
      if (type === PLAY) play();
      else if (type === PAUSE) pause();
      else if (type === REVERSE) reverse();
      else if (type === JUMP) jump(payload);
      else if (type === CANCEL) cancel();
    },
    noop,
    noop,
    never()
  );
});

export default clock;
