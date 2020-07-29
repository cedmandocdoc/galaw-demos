import { throttle } from "agos";
import engine from "./engine";

const throttleRAF = throttle(release => {
  const id = engine.add(() => {
    release();
    engine.delete(id);
  });
});

export default throttleRAF;
