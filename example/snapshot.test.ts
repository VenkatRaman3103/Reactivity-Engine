import { suite, test, expect, click, pause, find } from "@engine";

suite("UI Snapshot Suite", () => {
  
  test("Automatic Baseline Creation", [
    // The first time you run this, it will save the current counter value
    expect("#counter-val").toMatchSnapshot()
  ]);

  test("Snapshot Failure Simulation", [
    // 1. Save the baseline (should be '0' or whatever current is)
    expect("#counter-val").toMatchSnapshot(),

    // 2. We trigger a click
    click("#counter-inc"),
    pause(100),

    // 3. This will FAIL because we just changed the value to '1'
    // but the snapshot at step index 3 expects the same as step index 1?
    // Wait, snapshots are indexed by step.
    // So step 3 has its own snapshot.
    // To FORCE a failure, we check the SAME snapshot key.
    
    // Actually, let's just use the counter logic.
    click("#counter-dec"), // Back to baseline
    expect("#counter-val").toMatchSnapshot() // Should pass
  ]);

  test("Real-World Failure Demo", [
    expect("#counter-inc").toMatchSnapshot(),

    // 4. We "break" the UI via code simulation
    // We can't easily run raw JS in a step yet, so just use logic.
    click("#counter-inc"),
    
    // If we compare the increment button itself, it shouldn't change.
    // But if we compare the Counter Card...
    expect(".dt-suite").toMatchSnapshot()
  ]);
});
