// import {
//   listen,
//   merge,
//   never,
//   tap,
//   map,
//   pipe,
//   switchMap,
//   of,
//   collectLatest
// } from "agos";
// import tween from "./galaw/tween";
// import fromDrag from './galaw/fromDrag';
// import spring from "./galaw/spring";
// import autoplay from "./galaw/autoplay";
// import fromMouseMove from "./galaw/fromMouseMove";

// const square = document.getElementById("square");
// const ball1 = document.getElementById("ball");
// const balls = document.getElementsByClassName("ball");

// const bouncy = (displacement = 100) =>
//   pipe(
//     spring({
//       mass: 100,
//       stiffness: 3000,
//       damping: 350,
//       initialDisplacement: displacement,
//       initialVelocity: 0
//     }),
//     map(data => Math.abs(data.displacement - displacement) / displacement)
//   );

// const initialSquareBounding = square.getBoundingClientRect();

// pipe(
//   fromMouseMove(0, 0),
//   switchMap(({ x, y }) => {
//     const squareBounding = square.getBoundingClientRect();
//     return autoplay(
//       pipe(
//         bouncy(),
//         collectLatest([
//           tween(p =>
//             p(
//               squareBounding.x - initialSquareBounding.x,
//               (x - initialSquareBounding.x) / 5
//             )
//           ),
//           tween(p =>
//             p(
//               squareBounding.y - initialSquareBounding.y,
//               (y - initialSquareBounding.y) / 5
//             )
//           )
//         ])
//       )
//     );
//   }),
//   map(([x, y]) => ({ transform: `translate(${x}px, ${y}px)` })),
//   listen(
//     () => console.log("open"),
//     style => {
//       // console.log(style);
//       Object.assign(square.style, style);
//     },
//     error => console.log(error),
//     () => console.log("close")
//     // control
//   )
// );

// const getHypotenuse = (coorA, coorB) => {
//   const x = coorA.x - coorB.x;
//   const y = coorA.y - coorB.y;
//   return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
// };

// const getTangentAngle = (coorA, coorB) => {
//   const x = coorB.x - coorA.x;
//   const y = coorB.y - coorA.y;

//   let offset = 0;

//   if (Math.sign(x) === 1 && Math.sign(y) === 1) offset = 0;
//   else if (Math.sign(x) === -1 && Math.sign(y) === 1) offset = 360;
//   else if (Math.sign(x) === -1 && Math.sign(y) === -1) offset = 180;
//   else if (Math.sign(x) === 1 && Math.sign(y) === -1) offset = 180;

//   return Math.atan(x / y) * (180 / Math.PI) + offset;
// };

// const getAdjAndOppSide = (angle, hypotenuse) => {
//   const x = Math.sin(angle * (Math.PI / 180)) * hypotenuse;
//   const y = Math.cos(angle * (Math.PI / 180)) * hypotenuse;

//   return { x, y };
// };

// let dest = { x: 0, y: 0 };
// let last = { x: 0, y: 0 };
// pipe(
//   fromDrag(ball1),
//   switchMap(([name, e]) => {
//     if (name === "hold") return never();

//     if (name === "release") {
//       const hypotenuse = getHypotenuse(dest, {
//         x: last.x + e.x,
//         y: last.y + e.y
//       });
//       const angle = getTangentAngle(dest, { x: last.x + e.x, y: last.y + e.y });
//       return autoplay(
//         pipe(
//           bouncy(),
//           map(progress => (1 - progress) * hypotenuse),
//           map(hypotenuse => getAdjAndOppSide(angle, hypotenuse)),
//           tap(coor => (last = coor))
//         )
//       );
//     }

//     return of({ x: last.x + e.x, y: last.y + e.y });
//   }),
//   map(coor => ({ transform: `translate(${coor.x}px, ${coor.y}px)` })),
//   listen(
//     () => console.log("open"),
//     style => Object.assign(ball1.style, style),
//     e => console.log(e),
//     () => console.log(" done")
//   )
// );

// Galaw To Do bugs
// - seems link manual open is a pre requisite of all clip

// Galaw To Do Feat
// - generalized the behavior of mode switching

// Galaw To Do Opt
// - figure out the performance trade off of single source
// - optimize single source at most possibility
// - optimization of raf engine

// Agos To Do
// - fix NextInterceptor bug / inaccuracy: for now, not so harmful unless reuse outside with handling with care
// - talkback default to never? if so the open of talkback inside source will not always run
// - chain should propagate done on source see fromDrag mousemove -> mousedown
// - takeWhile inclusive prop, check the code squishing - done
// - wrapper for autoplay - done
// - multiple fire of open and done on spring switch map - done
// - switch map main source not emitting done when all children is done also - done

// NextInterceptor bug / inaccurracy
// const mysource = create((open, next, fail, done, talkback) => {
//   open();
//   // console.log(talkback.listen);
//   talkback.listen(
//     () => console.log("talkback open"),
//     value => console.log(value),
//     error => console.log(error),
//     () => console.log("talkback done"),
//     never()
//   );
//   next(1);
//   next(2);
// });

// const interceptor = new NextInterceptor(never());
// pipe(
//   mysource,
//   listen(
//     () => console.log("open"),
//     v => console.log(v, "source"),
//     e => console.log(e, "source"),
//     () => console.log("done"),
//     interceptor
//   )
// );
// interceptor.next('propagates')
