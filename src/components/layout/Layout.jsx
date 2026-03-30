import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

function Layout({ children }) {

  const navigate = useNavigate();
  const auth = getAuth();

  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarSesion = async () => {

    await signOut(auth);
    navigate("/");

  };

  return (

    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>

      {/* HEADER */}

      <div style={headerStyle}>

        <h2 style={{ margin: 0 }}>BeautyFlow</h2>

        <button
          style={menuBtn}
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          ☰
        </button>

      </div>

      {/* MENU */}

      {menuAbierto && (

        <div style={menuStyle}>

          <button
            style={menuItem}
            onClick={() => {
              navigate("/dashboard");
              setMenuAbierto(false);
            }}
          >
            Dashboard
          </button>

          <button
            style={menuItem}
            onClick={() => {
              navigate("/turnos");
              setMenuAbierto(false);
            }}
          >
            Turnos
          </button>

          <button
            style={menuItem}
            onClick={() => {
              navigate("/servicios");
              setMenuAbierto(false);
            }}
          >
            Servicios
          </button>

          {/* NUEVA SECCION CLIENTES */}

          <button
            style={menuItem}
            onClick={() => {
              navigate("/clientes");
              setMenuAbierto(false);
            }}
          >
            Clientes
          </button>

          <button
            style={menuItem}
            onClick={() => {
              navigate("/lashistas");
              setMenuAbierto(false);
            }}
          >
            Lashistas
          </button>

          <button
            style={menuItem}
            onClick={() => {
              navigate("/configuracion");
              setMenuAbierto(false);
            }}
          >
            Configuración
          </button>

          <button
            style={logoutBtn}
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>

        </div>

      )}

      {/* CONTENIDO */}

      <div style={{ padding: "30px" }}>
        {children}
      </div>

    </div>

  );

}

const headerStyle = {
  background: "#e7b6c8",
  padding: "15px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const menuBtn = {
  background: "transparent",
  border: "none",
  fontSize: "22px",
  cursor: "pointer"
};

const menuStyle = {
  background: "#efefef",
  padding: "20px"
};

const menuItem = {
  display: "block",
  width: "100%",
  padding: "15px",
  marginBottom: "10px",
  border: "none",
  borderRadius: "6px",
  background: "#ddd",
  cursor: "pointer"
};

const logoutBtn = {
  display: "block",
  width: "100%",
  padding: "15px",
  border: "none",
  borderRadius: "6px",
  background: "#ff5c6c",
  color: "white",
  cursor: "pointer"
};

export default Layout;
