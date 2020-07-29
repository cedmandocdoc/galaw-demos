import { NextInterceptor, CANCEL, create, never, emitter } from "agos";
import { EMITTER_MODE, CLOCK_MODE, noop, clipTime } from "./utils";
import clock from "./clock";

const timeline = (...clips) => create((open, next, fail, done, talkback) => {
  const clipControls = [];

  let duration = 0;

  for (let index = 0; index < clips.length; index++) {
    const interceptor = new NextInterceptor(never());
    const clip = clips[index];
    clip.listen(noop, next, fail, noop, interceptor);
    interceptor.next([
      EMITTER_MODE,
      (dur, control) => {
        clipControls[index] = {
          ...control,
          next: clipTime(0, dur, control.next)
        };
        duration = Math.max(duration, dur);
      }
    ]);
  }

  const _next = ({ time, forward }) => {
    for (let index = 0; index < clipControls.length; index++) {
      const control = clipControls[index];
      control.next({ time, forward });
    }
  };

  const _open = () => {
    for (let index = 0; index < clipControls.length; index++) {
      const control = clipControls[index];
      control.open();
    }
  };

  open();
  const interceptor = new NextInterceptor(never());
  talkback.listen(
    noop,
    ([type, payload]) => {
      if (type === CLOCK_MODE) {
        interceptor.next([CANCEL]);
        clock.listen(
          _open,
          clipTime(0, duration, _next),
          fail,
          done,
          interceptor
        );
        return;
      }
      if (type === EMITTER_MODE) {
        interceptor.next([CANCEL]);
        const [control, source] = emitter();
        source.listen(_open, _next, fail, done, interceptor);
        payload(duration, control);
        return;
      }
      interceptor.next([type, payload]);
    },
    noop,
    noop,
    never()
  );
});

export default timeline;
