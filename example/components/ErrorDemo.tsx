import { onMount } from "../../src/effect";
import { derive } from "../../src/derived";
import { page } from "../state/app.state";

/**
 * ERROR SYSTEM TEST BENCH
 *
 * Uncomment the sections below one by one to test different error conditions.
 * Make sure you have your Browser Console open (F12)!
 */

export default function ErrorDemo() {
  // 1. TEST: Direct Mutation Warning
  // State variables should only be updated through exported functions.
  /*
  onMount(() => {
    console.log("%c[Test] Attempting direct mutation...", "color: blue; font-weight: bold;");
    // We import the wrapped state to try and mutate it
    import("../state/app.state").then(mod => {
        // @ts-ignore
        mod.page = "broken"; 
    });
  });
  */

  // 2. TEST: Circular Dependency Error
  /*
  const a: any = derive(() => b.value + 1);
  const b: any = derive(() => a.value + 1);
  onMount(() => {
    console.log("%c[Test] Triggering circular dependency...", "color: blue; font-weight: bold;");
    console.log(a.value);
  });
  */

  return (
    <div
      style={{
        padding: "20px",
        border: "2px solid #ff4444",
        borderRadius: "12px",
        marginTop: "20px",
        background: "#fff5f5",
        color: "#2d3436",
        fontFamily: "system-ui",
      }}
    >
      <h2 style={{ color: "#ff4444", marginTop: 0 }}>
        Error System Test Bench
      </h2>
      <p>
        Open your console and uncomment sections in{" "}
        <code>example/components/ErrorDemo.tsx</code> to see the rich error
        messages.
      </p>

      <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
        <div
          style={{
            padding: "10px",
            background: "#fff",
            borderRadius: "6px",
            border: "1px solid #ffebeb",
          }}
        >
          <strong>Status:</strong> Active Page is "{page}"
        </div>
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid #ffebeb",
          margin: "20px 0",
        }}
      />

      {/* 3. TEST: Component returning Nothing (Error) */}
      {/* <BrokenComponent /> */}

      {/* 4. TEST: Component returning Invalid Type (Error) */}
      {/* <InvalidTypeComponent /> */}
    </div>
  );
}

function BrokenComponent() {
  // @ts-ignore
  return null;
}

function InvalidTypeComponent() {
  return { name: "bob" };
}
