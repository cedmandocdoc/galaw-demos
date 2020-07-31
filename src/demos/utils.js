import { map, pipe, listen } from "agos";
import fromEvent from "../galaw/fromEvent";

const noop = () => { };

export const createSpringSettings = container => {
  const fields = container.getElementsByClassName('spring-setting')[0].getElementsByClassName('field');
  const inputs = [...fields].map(field => field.getElementsByTagName('input'));

  const settings = {};
  inputs.forEach((input, index) => {
    fields[index].firstElementChild.firstElementChild.innerHTML = input[0].value;;
    settings[input[0].name] = input[0].value;
    pipe(
      fromEvent(input[0], 'change'),
      map(e => [e.target.name, e.target.value]),
      subscribe(([name, value]) => {
        settings[name] = value;
        fields[index].firstElementChild.firstElementChild.innerHTML = value;
      })
    )
  });

  return () => settings;
};


// agos specific

export const subscribe = (sink, external) => {
  if (typeof sink === "function") return listen(noop, sink, noop, noop, external);
  return listen(sink.open, sink.next, sink.fail, sink.done, external);
}

export const mapTo = value => map(() => value);