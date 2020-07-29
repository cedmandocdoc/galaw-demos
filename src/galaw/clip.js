import { NextInterceptor, CANCEL, create, never, emitter } from "agos";
import { EMITTER_MODE, CLOCK_MODE, noop, clipTime } from "./utils";
import clock from "./clock";

const clip = duration => create((open, next, fail, done, talkback) => {
  const interceptor = new NextInterceptor(never());
  open();
  talkback.listen(
    noop,
    ([type, payload]) => {
      if (type === CLOCK_MODE) {
        interceptor.next([CANCEL]);
        clock.listen(
          open,
          clipTime(0, duration, next),
          fail,
          done,
          interceptor
        );
        return;
      }
      if (type === EMITTER_MODE) {
        interceptor.next([CANCEL]);
        const [control, source] = emitter();
        source.listen(open, next, fail, done, interceptor);
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

export default clip;
