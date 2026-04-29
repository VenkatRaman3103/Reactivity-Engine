import { device } from "@engine";
import DemoPage from "./demo/DemoPage";
import "./demo/DemoStyles.css";
import "./kitchen-sink.test";

export default function App() {
  return (
    <div>
      <DemoPage />

      {/* Testing Dashboard */}
      <div style={{ padding: "40px", fontFamily: "system-ui" }}>
        <div
          style={{
            marginBottom: "40px",
            background: "#f5f5f5",
            padding: "24px",
            borderRadius: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 8px 0", color: "#333" }}>
              Testing Dashboard
            </h2>
            <p style={{ margin: 0, color: "#666", fontSize: "15px" }}>
              Tests are now integrated into the ⚡{" "}
              <strong>Engine DevTools</strong>.
            </p>
            <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
              <span style={{ padding: "4px 8px", background: "#e0e0e0", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>Ctrl</span>
              <span style={{ padding: "4px 8px", background: "#e0e0e0", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>Shift</span>
              <span style={{ padding: "4px 8px", background: "#e0e0e0", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>E</span>
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: "14px", color: "#888", borderLeft: "1px solid #ddd", paddingLeft: "24px" }}>
            <strong>Environment:</strong> Development<br />
            <strong>Platform:</strong> {device.platform}<br />
            <strong>Viewport:</strong> {device.isMobile ? "Mobile" : "Desktop"}
          </div>
        </div>
      </div>
    </div>
  );
}
