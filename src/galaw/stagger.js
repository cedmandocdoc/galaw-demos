import { NextInterceptor, CANCEL, create, never, emitter } from "agos";
import { EMITTER_MODE, CLOCK_MODE, noop, clipTime } from "./utils";
import clock from "./clock";

const stagger = (clip, { count, delay }) =>
  create((open, next, fail, done, talkback) => {
    const clipControls = [];

    let duration = 0;

    const listenOnClip = index => {
      if (index >= count) return;
      const interceptor = new NextInterceptor(never());
      clip(index, count).listen(noop, data => next([data, index]), fail, noop, interceptor);
      interceptor.next([
        EMITTER_MODE,
        (dur, control) => {
          const start = delay(index, count);
          const end = start + dur;
          duration = end;
          clipControls.push({
            ...control,
            next: clipTime(start, end, data => control.next(data))
          });
          duration = Math.max(duration, dur);
          listenOnClip(index + 1);
        }
      ]);
    };

    listenOnClip(0);

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

export default stagger;
