import { useEffect } from "react";

function Loader() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={container}>
      <h2 style={title}>BeautyFlow</h2>
      <div style={spinner}></div>
    </div>
  );
}

const container = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "#ffe6f2", // rosa claro
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999
};

const title = {
  color: "#ff4da6", // rosa fuerte
  fontWeight: "bold",
  marginBottom: "20px"
};

const spinner = {
  width: "50px",
  height: "50px",
  border: "6px solid #ffb3d9",
  borderTop: "6px solid #ff1493",
  borderRadius: "50%",
  animation: "spin 1s linear infinite"
};

export default Loader;