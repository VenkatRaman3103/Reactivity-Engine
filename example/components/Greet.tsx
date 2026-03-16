import { name, updateName } from "./Greet.state";

export default function Greet() {
  let obj = {
    //
  };

  return (
    <div>
      <div>hello {name}</div>
      <button onClick={() => updateName("Venkat")}>update</button>
    </div>
  );
}
