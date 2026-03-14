import {
  count,
  step,
  increment,
  decrement,
  setStep,
  reset,
} from "./Counter.state";
import {
  derive,
  effect,
  memo,
  onMount,
  onUnmount,
  portal,
  ref,
} from "@engine/index";

const SlowItem = memo(function () {
  console.log("render");
  return <div>Item</div>;
});

export default function Counter() {
  const box = ref<HTMLDivElement>();
  const doubled = derive(() => count * 2);
  const isZero = derive(() => count === 0);

  const showModal = derive(() => count % 3 === 0 && count !== 0);

  effect(() => {
    document.title = `Count: ${count}`;
  });

  onMount(() => {
    console.log("Counter mounted");
  });
  onUnmount(() => {
    document.title = "App";
  });

  const items = [
    { id: 1, name: "a" },
    { id: 2, name: "b" },
    { id: 3, name: "c" },
    { id: 4, name: "d" },
    { id: 5, name: "e" },
  ];

  console.log(items);

  return (
    <div bind={box} class="counter">
      <h2>{count}</h2>
      <p>Doubled: {doubled.value}</p>
      <p>Step: {step}</p>
      {isZero.value && <p>Zero</p>}
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
      <SlowItem />
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

      {showModal.value &&
        portal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <h2>I am a Modal Portal! (Count is {count})</h2>
          </div>,
          document.body, // This is the default target, but we're being explicit
        )}
    </div>
  );
}
