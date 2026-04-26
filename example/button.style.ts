import { style } from "@engine/style";
import { color, spacing, radius } from "./theme.style";
import { isDisabled, variant } from "./button.state";

export const button = style({
  display: "inline-flex",
  alignItems: "center",
  padding: `${spacing.sm} ${spacing.md}`,
  borderRadius: radius.md,
  border: "none",
  transition: "all 0.2s ease",
  fontSize: "14px",
  fontWeight: "500",
  color: "white",

  // reactive — reads from state
  backgroundColor: variant === "primary" ? color.primary : color.surface,
  opacity: isDisabled ? 0.5 : 1,
  cursor: isDisabled ? "not-allowed" : "pointer",

  // pseudo selectors
  hover: {
    backgroundColor: color.primaryHover,
  },

  focus: {
    outline: `2px solid ${color.primary}`,
    outlineOffset: "2px",
  },

  // responsive
  sm: { padding: spacing.xs },
  lg: { padding: spacing.lg },
});
