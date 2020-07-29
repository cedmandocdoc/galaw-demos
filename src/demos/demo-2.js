import { listen, map, pipe, switchMap, collectLatest, tap } from "agos";
import tween from "../galaw/tween";
import spring from "../galaw/spring";
import autoplay from "../galaw/autoplay";
import fromMouseMove from "../galaw/fromMouseMove";
import { noop } from "../galaw/utils";

const container = document.getElementById('demo-2');
const playground = container.getElementsByClassName('playground')[0]
const square = playground.getElementsByClassName('big-square')[0];

const bouncy = (displacement = 100) =>
  pipe(
    spring({
      mass: 50,
      stiffness: 3000,
      damping: 350,
      initialDisplacement: displacement,
      initialVelocity: 0
    }),
    map(data => Math.abs(data.displacement - displacement) / displacement)
  );


const center = { x: playground.clientWidth / 2, y: playground.clientHeight / 2 };
const lastCenterRatio = { x: 0, y: 0 };

pipe(
  fromMouseMove(playground),
  map(e => ({ x: e.layerX - center.x, y: e.layerY - center.y })),
  switchMap(({ x, y }) => {
    const centerRatio = { x: (x / center.x), y: (y / center.y) };

    const lastCenterRatioX = lastCenterRatio.x;
    const lastCenterRatioY = lastCenterRatio.y;
    return autoplay(
      pipe(
        bouncy(),
        collectLatest([
          tween(p => p(lastCenterRatioX, centerRatio.x)),
          tween(p => p(lastCenterRatioY, centerRatio.y)),
        ]),
        tap(([xr, yr]) => {
          lastCenterRatio.x = xr;
          lastCenterRatio.y = yr;
        })
      )
    );
  }),
  map(([xr, yr]) => ({ transform: `perspective(600px) translate(${xr * 20}px, ${yr * 20}px)  rotateX(${-(yr * 20)}deg) rotateY(${xr * 20}deg) scale(${(.4 * Math.abs(xr)) + 1})` })),
  listen(
    noop,
    style => Object.assign(square.style, style)
  )
)
