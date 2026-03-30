import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  addDoc
} from "firebase/firestore";
import Layout from "../components/layout/Layout";

function SuperAdmin() {

  const [negocios, setNegocios] = useState([]);
  const [nuevoNegocio, setNuevoNegocio] = useState("");

  const cargarNegocios = async () => {

    const snapshot = await getDocs(collection(db, "negocios"));

    const lista = [];

    snapshot.forEach((docItem) => {
      lista.push({
        id: docItem.id,
        ...docItem.data()
      });
    });

    setNegocios(lista);

  };

  useEffect(() => {
    cargarNegocios();
  }, []);

  const crearNegocio = async () => {

    if (!nuevoNegocio) {
      alert("Ingrese nombre del centro");
      return;
    }

    await addDoc(collection(db, "negocios"), {

      nombre: nuevoNegocio,
      active: true,
      createdAt: new Date()

    });

    setNuevoNegocio("");

    cargarNegocios();

  };

  return (
    <Layout>

      <div style={{ maxWidth: "800px" }}>

        <h2>Super Admin 👑</h2>

        <div style={addBox}>

          <input
            type="text"
            placeholder="Nombre centro de estética"
            value={nuevoNegocio}
            onChange={(e) => setNuevoNegocio(e.target.value)}
            style={input}
          />

          <button onClick={crearNegocio} style={btn}>
            Crear Centro
          </button>

        </div>

        <h3>Centros Registrados</h3>

        {negocios.map((negocio) => (

          <div key={negocio.id} style={card}>

            <strong>{negocio.nombre}</strong>

          </div>

        ))}

      </div>

    </Layout>
  );

}

const addBox = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px"
};

const input = {
  flex: 1,
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ddd"
};

const btn = {
  padding: "10px 15px",
  border: "none",
  borderRadius: "6px",
  background: "#f8c8dc",
  cursor: "pointer"
};

const card = {
  background: "white",
  padding: "15px",
  borderRadius: "8px",
  marginBottom: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
};

export default SuperAdmin;