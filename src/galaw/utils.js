export const noop = () => { };

export const clipTime = (start, end, next) => {
  const status = [0, 0];
  return ({ time, forward }) => {
    if (time >= start && time <= end) {
      const currentTime = time - start;
      next({
        time: currentTime,
        forward,
        progress: currentTime / (end - start)
      });
      status[0] = 0;
      status[1] = 0;
    } else if (time < start && !status[0] && !forward) {
      next({ time: start, forward, progress: 0 });
      status[0] = 1;
      status[1] = 0;
    } else if (time > end && !status[1] && forward) {
      next({ time: end, forward, progress: 1 });
      status[0] = 0;
      status[1] = 1;
    }
  };
};

export const CLOCK_MODE = Symbol("CLOCK_MODE");
export const EMITTER_MODE = Symbol("EMITTER_MODE");
