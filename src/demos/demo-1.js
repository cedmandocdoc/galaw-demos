import { never, tap, map, pipe, switchMap, of, merge } from "agos";
import fromDrag from '../galaw/fromDrag';
import spring from "../galaw/spring";
import autoplay from "../galaw/autoplay";
import { subscribe } from "../galaw/utils";
import { createSpringSettings } from "./utils";

const container = document.getElementById('demo-1');
const playground = container.getElementsByClassName('playground')[0]
const ball = playground.getElementsByClassName('big-ball')[0];

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

const getHypotenuse = (coorA, coorB) => {
  const x = coorA.x - coorB.x;
  const y = coorA.y - coorB.y;
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
};

const getTangentAngle = (coorA, coorB) => {
  const x = coorB.x - coorA.x;
  const y = coorB.y - coorA.y;

  let offset = 0;

  if (Math.sign(x) === 1 && Math.sign(y) === 1) offset = 0;
  else if (Math.sign(x) === -1 && Math.sign(y) === 1) offset = 360;
  else if (Math.sign(x) === -1 && Math.sign(y) === -1) offset = 180;
  else if (Math.sign(x) === 1 && Math.sign(y) === -1) offset = 180;

  return Math.atan(x / y) * (180 / Math.PI) + offset;
};

const getAdjAndOppSide = (angle, hypotenuse) => {
  const x = Math.sin(angle * (Math.PI / 180)) * hypotenuse;
  const y = Math.cos(angle * (Math.PI / 180)) * hypotenuse;

  return { x, y };
};

let dest = { x: 0, y: 0 };
let last = { x: 0, y: 0 };
pipe(
  fromDrag(ball),
  switchMap(([name, e]) => {
    if (name === "hold") return merge([of('grabbing'), never()])

    if (name === "release") {
      const hypotenuse = getHypotenuse(dest, {
        x: last.x + e.x,
        y: last.y + e.y
      });
      const angle = getTangentAngle(dest, { x: last.x + e.x, y: last.y + e.y });
      return merge([of('grab'), autoplay(
        pipe(
          bouncy(),
          map(progress => (1 - progress) * hypotenuse),
          map(hypotenuse => getAdjAndOppSide(angle, hypotenuse)),
          tap(coor => (last = coor))
        )
      )]);
    }

    return merge([of('grabbing'), of({ x: last.x + e.x, y: last.y + e.y })])
  }),
  subscribe(([key, index]) => {
    if (index === 0) return ball.style.cursor = key;
    const { x, y } = key;
    return Object.assign(ball.style, { transform: `translate(${x}px, ${y}px)` })
  })
);
