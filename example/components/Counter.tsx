import {
  count,
  step,
  increment,
  decrement,
  setStep,
  reset,
} from "./Counter.state";
import { derive, effect, onMount, onUnmount, ref } from "@engine/index";

export default function Counter() {
  const box = ref<HTMLDivElement>();
  const doubled = derive(() => count * 2);
  const isZero = derive(() => count === 0);

  effect(() => {
    document.title = `Count: ${count}`;
  });

  onMount(() => {
    console.log("Counter mounted");
  });
  onUnmount(() => {
    document.title = "App";
  });

  return (
    <div bind={box} class="counter">
      <h1>{count}</h1>
      <p>Doubled: {doubled.value}</p>
      <p>Step: {step}</p>
      {isZero.value && <p>Zero</p>}
      <div>
        <button onClick={decrement}>-</button>
        <button onClick={increment}>+</button>
        <button onClick={reset}>Reset</button>
      </div>
      <div>
        <button onClick={() => setStep(1)}>Step 1</button>
        <button onClick={() => setStep(5)}>Step 5</button>
        <button onClick={() => setStep(10)}>Step 10</button>
      </div>
    </div>
  );
}
