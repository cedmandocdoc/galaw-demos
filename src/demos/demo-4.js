import { pipe, map, } from "agos";
import {
  stagger,
  clip,
  easeInQuad,
  tween,
  controller,
  fromEvent,
  easeInOutQuad,
  repeat,
  track,
} from "../galaw";
import { subscribe } from "./utils";

const container = document.getElementById("demo-4");
const page = container.getElementsByClassName('page')[0];
const playground = container.getElementsByClassName("playground")[0];

const rectCount = 51;
const rects = [];
for (let index = 0; index < rectCount; index++) {
  const rect = document.createElement("div");
  rect.classList.add("rect");
  rects.push(rect);
  playground.appendChild(rect);
}

const lastStyles = [];
const distribute = (l, h, c, i) => ((h - l) / c) * i + l;

pipe(
  repeat(track(
    stagger(
      (i, count) =>
        pipe(
          clip(400),
          map((data) => data.progress),
          map(easeInOutQuad),
          tween((p) => [
            p(0, distribute(-250, 250, count, i)),
            p(1, distribute(1, 2, count, i)),
          ])
        ),
      {
        count: rectCount,
        delay: (i) => {
          const delay = easeInQuad(Math.abs(i - 25) / 25) * 100;
          return delay;
        },
      }
    ),
    stagger(
      (i, count) =>
        pipe(
          clip(400),
          map((data) => data.progress),
          map(easeInOutQuad),
          tween((p) => [
            p(lastStyles[i].rotation, 0),
            p(lastStyles[i].scale, 1),
            p(0, distribute(-100, 100, count, i)),
          ])
        ),
      {
        count: rectCount,
        delay: (i) => {
          const delay = easeInQuad(Math.abs(i - 25) / 25) * 100;
          return delay;
        },
      }
    ),
    stagger(
      (i, count) =>
        pipe(
          clip(800),
          map((data) => data.progress),
          map(easeInOutQuad),
          tween((p) => [
            p(lastStyles[i].rotation, distribute(-720, 560, count, i)),
            p(lastStyles[i].scale, 1),
            p(lastStyles[i].translateY, lastStyles[i].translateY),
            p(0, distribute(-100, -250, count, i)),
          ])
        ),
      {
        count: rectCount,
        delay: (i) => {
          const delay = easeInQuad(Math.abs(i - 25) / 25) * 100;
          return delay;
        },
      }
    ),
    stagger(
      (i, count) =>
        pipe(
          clip(600),
          map((data) => data.progress),
          map(easeInOutQuad),
          tween((p) => [
            p(lastStyles[i].rotation, 90),
            p(lastStyles[i].scale, 2),
            p(lastStyles[i].translateY, -30),
            p(lastStyles[i].translateX, (i * 8) - 150),
          ])
        ),
      {
        count: rectCount,
        delay: (i) => {
          const delay = easeInQuad(Math.abs(i - 25) / 25) * 100;
          return delay;
        },
      }
    ),
    stagger(
      (i, count) =>
        pipe(
          clip(400),
          map((data) => data.progress),
          map(easeInOutQuad),
          tween((p) => [
            p(lastStyles[i].rotation, 90),
            p(lastStyles[i].scale, 1),
            p(lastStyles[i].translateY, distribute(-100, 100, count, i)),
            p(lastStyles[i].translateX, 0),
          ])
        ),
      {
        count: rectCount,
        delay: (i) => {
          const delay = easeInQuad(Math.abs(i - 25) / 25) * 100;
          return delay;
        },
      }
    ),
    stagger(
      (i, count) =>
        pipe(
          clip(600),
          map((data) => data.progress),
          map(easeInOutQuad),
          tween((p) => [
            p(lastStyles[i].rotation, 0),
            p(lastStyles[i].scale, 1),
            p(lastStyles[i].translateY, 0),
            p(lastStyles[i].translateX, 0),
          ])
        ),
      {
        count: rectCount,
        delay: (i) => {
          const delay = easeInQuad(Math.abs(i - 25) / 25) * 100;
          return delay;
        },
      }
    )
  ), Infinity),
  subscribe(
    (data) => {
      const [[rotation, scale, translateY = 0, translateX = 0], index] = data;
      const rect = rects[index];
      lastStyles[index] = { rotation, scale, translateY, translateX };
      rect.style.transform = `rotate(${rotation}deg) scale(${scale}) translateY(${translateY}px) translateX(${translateX}px)`;
    },
    controller({
      play: fromEvent(page, "mouseenter"),
      pause: fromEvent(page, "mouseleave"),
    })
  )
);
