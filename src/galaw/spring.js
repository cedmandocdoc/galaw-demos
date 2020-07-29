import { NextInterceptor, CANCEL, create, never, emitter } from "agos";
import { EMITTER_MODE, CLOCK_MODE, noop } from "./utils";
import clock from "./clock";

const computeMotion = (settings, time) => {
  const {
    mass,
    stiffness,
    damping,
    initialDisplacement,
    initialVelocity,
    precision = 0.01
  } = settings;

  const t = time / 1000;
  const b = damping;
  const m = mass;
  const k = stiffness;
  const x0 = initialDisplacement;
  const x1 = initialVelocity;

  let velocity = 0;
  let displacement = 0;

  const z = b / Math.sqrt(4 * k * m);
  if (z < 1) {
    // underdamped
    const w = Math.sqrt(Math.abs(Math.pow(b / m, 2) - (4 * k) / m));
    const B = -(x1 + (x0 * b) / (2 * m)) / w;
    const A = x0;
    displacement =
      Math.exp((-b * t) / (2 * m)) *
      (A * Math.cos(w * t) + B * Math.sin(w * t));
    velocity =
      (A * Math.cos(w * t) + B * Math.sin(w * t)) *
      (-1 * (b / (2 * m))) *
      Math.exp((-1 * b * t) / (2 * m)) +
      (A * w * Math.sin(w * t) + B * w * Math.cos(w * t)) *
      Math.exp((-1 * b * t) / (2 * m));
  } else if (z === 1) {
    // critically damped
    const r = -(b / (2 * m));
    const B = x1 - x0 * r;
    const A = x0;
    displacement = A * Math.exp(r * t) + B * t * Math.exp(r * t);
    velocity =
      A * r * Math.exp(r * t) + B * (Math.exp(r * t) + t * Math.exp(r * t));
  } else if (z > 1) {
    // overdamped
    const w = Math.sqrt(Math.abs(Math.pow(b / m, 2) - (4 * k) / m));
    const r1 = 0.5 * (-b / m + w);
    const r2 = 0.5 * (-b / m - w);
    const B = (x1 - r1 * x0) / (r2 - r1);
    const A = x0 - B;
    displacement = A * Math.exp(r1 * t) + B * Math.exp(r2 * t);
    velocity = A * r1 * Math.exp(r1 * t) + B * r2 * Math.exp(r2 * t);
  }

  if (Math.abs(velocity) <= precision || Math.abs(displacement) <= precision) {
    displacement = 0;
    velocity = 0;
  }

  return {
    displacement,
    velocity
  };
};

const computeDuration = settings => {
  const {
    mass,
    stiffness,
    damping,
    initialDisplacement,
    precision = 0.5
  } = settings;

  const b = damping;
  const m = mass;
  const k = stiffness;
  const x0 = initialDisplacement;

  const z = b / Math.sqrt(4 * k * m);

  if (z < 1) {
    return ((-2 * m * Math.log(precision / x0)) / b) * 1000;
  }

  let time = 0;
  while (true) {
    time += 100 / 6;
    const { displacement, velocity } = computeMotion(settings, time);
    if (displacement === 0 && velocity === 0) break;
  }
  return time;
};

// TO DO: spring
// should propagate done on finish?
// should depend on motion when to propagate or stop?
const spring = settings =>
  create((open, next, fail, done, talkback) => {
    const interceptor = new NextInterceptor(never());
    const status = [0, 0];
    open();

    const _next = ({ time, forward }) => {
      const { displacement, velocity } = computeMotion(settings, time);
      if (time >= 0 && displacement !== 0 && velocity !== 0) {
        status[0] = 0;
        status[1] = 0;
        const progress =
          Math.abs(
            (time < 0 ? settings.initialDisplacement : displacement) -
            settings.initialDisplacement
          ) / settings.initialDisplacement;
        next({ time, forward, displacement, velocity, progress });
      } else if (!forward && !status[0] && time < 0) {
        status[0] = 1;
        status[1] = 0;
        next({ time, forward, displacement, velocity, progress: 0 });
      } else if (
        forward &&
        !status[1] &&
        displacement === 0 &&
        velocity === 0
      ) {
        status[0] = 0;
        status[1] = 1;
        next({ time, forward, displacement, velocity, progress: 1 });
      }
    };
    talkback.listen(
      noop,
      ([type, payload]) => {
        if (type === CLOCK_MODE) {
          interceptor.next([CANCEL]);
          clock.listen(open, _next, fail, done, interceptor);
          return;
        }
        if (type === EMITTER_MODE) {
          interceptor.next([CANCEL]);
          const [control, source] = emitter();
          source.listen(open, _next, fail, done, interceptor);
          payload(computeDuration(settings), control);
          return;
        }
        interceptor.next([type, payload]);
      },
      noop,
      noop,
      never()
    );
  });

export default spring;
