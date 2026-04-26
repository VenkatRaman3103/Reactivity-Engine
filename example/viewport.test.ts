import { suite, test, expect, click, pause, viewport } from "@engine";

suite("Responsive Design Suite", () => {
  
  test("Desktop to Mobile Transition", [
    // 1. Start in Desktop
    viewport(1440, 900),
    expect("#counter-card").toBeVisible(),
    
    pause(1000), // Pause so you can see it on Desktop

    // 2. Automagically shrink to iPhone Portrait
    viewport(375, 667),
    
    // 3. Verify interactions still work in the "virtual" mobile screen
    click("#counter-inc"),
    expect("#counter-val").contains("1"),
    
    pause(1000), // Pause so you can see it on Mobile

    // 4. Test Tablet size
    viewport(768, 1024),
    pause(500)
  ]);

  test("Mobile Interaction Integrity", [
    viewport(375, 812), // iPhone X
    click("#todo-input"),
    // In a real app, you'd test if the mobile keyboard (simulated) 
    // pushes the UI correctly or if the menu collapses.
    expect(".dt-suite").toMatchSnapshot()
  ]);
});
