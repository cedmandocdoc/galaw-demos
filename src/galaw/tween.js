import { map } from "agos";

const tween = callback =>
  map(progress => callback((from, to) => (to - from) * progress + from));

export default tween;
