import { pipe, map, } from 'agos';
import { fromEvent, clip, repeat, controller, tween, easeInOutQuad } from '../galaw';

import { subscribe } from './utils';

const container = document.getElementById('demo-3');
const playground = container.getElementsByClassName('playground')[0]
const square = playground.getElementsByClassName('big-square')[0];

const { width } = container.getBoundingClientRect();
const translation = width - (width * .2) - square.clientWidth;

pipe(
  repeat(clip(1000), Infinity),
  map(data => data.alternate),
  map(easeInOutQuad),
  tween(p => [p(0, translation), p(0, 360)]),
  subscribe(
    ([translate, rotate]) => {
      square.style.transform = `translateX(${translate}px) rotate(${rotate}deg)`
    },
    controller({
      play: fromEvent(playground, 'mouseenter'),
      pause: fromEvent(playground, 'mouseleave')
    })
  )
);
