import { listen, map, pipe, switchMap, collectLatest, tap, filter } from "agos";
import tween from "../galaw/tween";
import spring from "../galaw/spring";
import autoplay from "../galaw/autoplay";
import fromMouseMove from "../galaw/fromMouseMove";
import { noop } from "../galaw/utils";
import { createSpringSettings } from "./utils";

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

const center = { x: playground.clientWidth / 2, y: playground.clientHeight / 2 };
const { top, left } = playground.getBoundingClientRect();
const lastCenterRatio = { x: 0, y: 0 };

pipe(
  fromMouseMove(playground),
  map(e => ({ x: e.clientX - left - center.x, y: e.clientY - top - center.y })),
  switchMap(({ x, y }) => {

    const lastCenterRatioX = lastCenterRatio.x;
    const lastCenterRatioY = lastCenterRatio.y;
    return autoplay(
      pipe(
        bouncy(),
        collectLatest([
          tween(p => p(lastCenterRatioX, x)),
          tween(p => p(lastCenterRatioY, y)),
        ]),
        tap(([xr, yr]) => {
          lastCenterRatio.x = xr;
          lastCenterRatio.y = yr;
        })
      )
    );
  }),
  map(([xr, yr]) => [(xr / center.x), (yr / center.y)]),
  map(([xr, yr]) => ({ transform: `perspective(600px) translate(${xr * 25}px, ${yr * 25}px)  rotateX(${-(yr * 25)}deg) rotateY(${xr * 25}deg) scale(${(.5 * Math.abs(xr)) + 1})` })),
  listen(
    noop,
    style => Object.assign(square.style, style)
  )
)
