import { useEffect } from "react";

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "12px 20px",
        borderRadius: "8px",
        background: type === "error" ? "#ff6b81" : "#4CAF50",
        color: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        zIndex: 999
      }}
    >
      {message}
    </div>
  );
}

export default Toast;