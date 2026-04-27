import { button } from "./button.style";
import { toggleDisabled, cycleVariant, variant } from "./button.state";
import { log } from "@engine";

export default function Button(props: { children?: any }) {
  log.greet("Hello world");
  log.hello("Hello world");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "20px",
      }}
    >
      {variant}
      <div>
        <button class={button} onClick={() => console.log("Clicked!")}>
          {props.children || "Reactive Button"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button id="toggle-btn" onClick={toggleDisabled}>
          Toggle Disabled
        </button>
        <button id="cycle-btn" onClick={cycleVariant}>
          Cycle Variant
        </button>
      </div>
    </div>
  );
}
