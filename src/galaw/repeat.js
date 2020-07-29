import { NextInterceptor, CANCEL, create, never, emitter } from "agos";
import { EMITTER_MODE, CLOCK_MODE, noop, clipTime } from "./utils";
import clock from "./clock";

const repeat = (clip, loop) => create((open, next, fail, done, talkback) => {
  let duration = 0;
  let control = null;
  let lapse = 0;
  const clipInterceptor = new NextInterceptor(never());
  clip.listen(noop, next, fail, noop, clipInterceptor);
  clipInterceptor.next([
    EMITTER_MODE,
    (dur, ctrl) => {
      duration = dur * loop;
      lapse = dur;
      control = ctrl;
    }
  ]);

  const _next = ({ time, forward }) => {
    const count = Math.trunc(time / lapse);
    if (count >= loop) return;
    if (time >= 0 && time <= duration) {
      const current = time - lapse * count;
      control.next({ time: current, forward, progress: current / lapse });
    }
  };

  const _open = () => control.open();

  const interceptor = new NextInterceptor(never());
  open();
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

export default repeat;