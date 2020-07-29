import { merge, map, of } from "agos";
import fromEvent from "./fromEvent";
import { pipeWith, CLOCK_MODE } from "./utils";
import { PLAY, REVERSE, PAUSE, JUMP } from "./clock";

const playBtn = document.getElementById("play");
const reverseBtn = document.getElementById("reverse");
const pauseBtn = document.getElementById("pause");
const rangeInput = document.getElementById("range");

const control = pipeWith(
  merge([
    of([CLOCK_MODE]),
    pipeWith(
      fromEvent(playBtn, "click"),
      map(() => [PLAY])
    ),
    pipeWith(
      fromEvent(reverseBtn, "click"),
      map(() => [REVERSE])
    ),
    pipeWith(
      fromEvent(pauseBtn, "click"),
      map(() => [PAUSE])
    ),
    pipeWith(
      fromEvent(rangeInput, "input"),
      map(e => +e.target.value),
      map(time => [JUMP, time])
    )
  ]),
  map(([value]) => value)
);

export default control;
