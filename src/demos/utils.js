import { map, pipe, } from "agos";
import fromEvent from "../galaw/fromEvent";
import { subscribe } from "../galaw/utils";

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
