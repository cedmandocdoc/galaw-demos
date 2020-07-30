import { listen, map, pipe, switchMap, collectLatest, tap, filter } from "agos";
import tween from "../galaw/tween";
import spring from "../galaw/spring";
import autoplay from "../galaw/autoplay";
import fromMouseMove from "../galaw/fromMouseMove";
import { noop, subscribe } from "../galaw/utils";
import { createSpringSettings } from "./utils";
import fromEvent from "../galaw/fromEvent";
import throttleRAF from "../galaw/throttleRAF";

const container = document.getElementById('demo-2');
const playground = container.getElementsByClassName('playground')[0]
const square = playground.getElementsByClassName('big-square')[0];

const getSettings = createSpringSettings(container);

const bouncy = (displacement = 100) =>
  pipe(
    spring({
      mass: 50,
      stiffness: 3000,
      damping: 350,
      initialDisplacement: displacement,
      initialVelocity: 0,
      // override settings
      ...getSettings()
    }),
    map(data => Math.abs(data.displacement - displacement) / displacement)
  );


const bounce = (from, to) => {
  const { x: fromX, y: fromY } = from;
  const { x: toX, y: toY } = to;
  return autoplay(
    pipe(
      bouncy(),
      collectLatest([
        tween(p => p(fromX, toX)),
        tween(p => p(fromY, toY)),
      ])
    )
  );
}

const center = { x: playground.clientWidth / 2, y: playground.clientHeight / 2 };
const { top, left } = playground.getBoundingClientRect();
const lastCenterRatio = { x: 0, y: 0 };

const draw = ([x, y]) => {
  lastCenterRatio.x = x;
  lastCenterRatio.y = y;

  const xr = x / center.x;
  const yr = y / center.y;

  const translate = `translate(${xr * 25}px, ${yr * 25}px)`;
  const rotateX = `rotateX(${-(yr * 25)}deg)`;
  const rotateY = `rotateY(${xr * 25}deg)`;
  const scale = `scale(${(.5 * Math.abs(xr)) + 1})`;
  const perspective = `perspective(600px)`;

  square.style.transform = `
    ${perspective}
    ${translate}
    ${rotateX}
    ${rotateY}
    ${scale}
  `;
}

pipe(
  fromMouseMove(playground),
  tap(() => console.log('move')),
  map(e => ({ x: e.clientX - left - center.x, y: e.clientY - top - center.y })),
  switchMap(({ x, y }) => bounce({ ...lastCenterRatio }, { x, y })),
  subscribe(draw)
)

pipe(
  fromEvent(playground, 'mouseleave'),
  throttleRAF,
  switchMap(() => bounce({ ...lastCenterRatio }, { x: 0, y: 0 })),
  subscribe(draw)
)