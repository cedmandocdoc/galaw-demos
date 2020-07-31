import { merge, map, of, never, pipe } from "agos";
import { CLOCK_MODE } from "./utils";
import { PLAY, REVERSE, PAUSE, JUMP } from "./clock";

const controller = ({
  play = never(),
  pause = never(),
  reverse = never(),
  jump = never()
} = {}) => pipe(
  merge([
    of([CLOCK_MODE]),
    pipe(
      play,
      map(() => [PLAY])
    ),
    pipe(
      pause,
      map(() => [PAUSE])
    ),
    pipe(
      reverse,
      map(() => [REVERSE])
    ),
    pipe(
      jump,
      map(time => [JUMP, time])
    )
  ]),
  map(([value]) => value)
);

export default controller;
