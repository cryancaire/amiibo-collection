import * as React from "react";
import { cn } from "../../lib/utils";

const Switch = React.forwardRef(({ className, defaultChecked = false, onCheckedChange, ...props }, ref) => {
  const [isChecked, setIsChecked] = React.useState(defaultChecked);
  
  // Update internal state when defaultChecked changes
  React.useEffect(() => {
    setIsChecked(defaultChecked);
  }, [defaultChecked]);

  const handleClick = () => {
    const newState = !isChecked;
    setIsChecked(newState);
    if (onCheckedChange) {
      onCheckedChange(newState);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={isChecked}
      onClick={handleClick}
      style={{
        position: "relative",
        display: "inline-flex",
        height: "24px",
        width: "44px",
        cursor: "pointer",
        borderRadius: "12px",
        border: "2px solid transparent",
        transition: "background-color 0.2s ease-in-out",
        backgroundColor: isChecked ? "#10b981" : "#6b7280",
        alignItems: "center",
        outline: "none",
        ...props.style
      }}
      {...props}
    >
      <span
        style={{
          pointerEvents: "none",
          display: "inline-block",
          height: "20px",
          width: "20px",
          borderRadius: "10px",
          backgroundColor: "white",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          transform: isChecked ? "translateX(20px)" : "translateX(0px)",
          transition: "transform 0.2s ease-in-out"
        }}
      />
    </button>
  );
});

Switch.displayName = "Switch";

export { Switch };
