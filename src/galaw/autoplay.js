import { pipe, create, merge, of, map, tap } from "agos";
import { CLOCK_MODE } from "./utils";
import { PLAY } from "./clock";

const autoplay = source =>
  create((open, next, fail, done, talkback) => {
    source.listen(
      open,
      next,
      fail,
      done,
      pipe(
        merge([of([CLOCK_MODE]), of([PLAY]), talkback]),
        map(([value]) => value)
      )
    );
  });

export default autoplay;