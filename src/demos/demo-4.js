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
} from "../galaw";
import { subscribe } from "./utils";

const container = document.getElementById("demo-4");
const page = container.getElementsByClassName('page')[0];
const playground = container.getElementsByClassName("playground")[0];

const rotateRange = page.getElementsByClassName('control')[0].getElementsByTagName('input')[0];
const rotateLabel = page.getElementsByClassName('control')[0].querySelector('label span');

const rectCount = 51;
const rects = [];
for (let index = 0; index < rectCount; index++) {
  const rect = document.createElement("div");
  rect.classList.add("rect");
  rects.push(rect);
  playground.appendChild(rect);
}

let rotate = 45
const distribute = (l, h, c, i) => ((h - l) / c) * i + l;
pipe(
  stagger(
    (i, count) =>
      pipe(
        repeat(clip(400), Infinity),
        map((data) => data.alternate),
        map(easeInOutQuad),
        tween((p) => [
          p(0, distribute(rotate * -1, rotate, count, i)),
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
  subscribe(
    (data) => {
      const [[rotation, scale], index] = data;
      const rect = rects[index];
      rect.style.transform = `rotate(${rotation}deg) scale(${scale})`;
    },
    controller({
      play: fromEvent(page, "mouseenter"),
      pause: fromEvent(page, "mouseleave"),
    })
  )
);

pipe(
  fromEvent(rotateRange, 'input'),
  subscribe(e => {
    rotate = +e.target.value;
    rotateLabel.innerText = rotate;
  })
)