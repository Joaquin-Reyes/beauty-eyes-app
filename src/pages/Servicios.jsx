import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";
import Layout from "../components/layout/Layout";

function Servicios() {

  const { user, userData } = useContext(AuthContext);

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [duracionHoras, setDuracionHoras] = useState("");
  const [servicios, setServicios] = useState([]);

  const crearServicio = async () => {

    if (!nombre || !precio || !duracionHoras) {
      alert("Completa todos los campos");
      return;
    }

    await addDoc(collection(db, "servicios"), {
      nombre,
      precio: Number(precio),
      duracionHoras: Number(duracionHoras),
      negocioId: userData.negocioId,
      createdAt: new Date()
    });

    setNombre("");
    setPrecio("");
    setDuracionHoras("");

    cargarServicios();

  };

  const eliminarServicio = async (id) => {

    await deleteDoc(doc(db, "servicios", id));
    cargarServicios();

  };

  const cargarServicios = async () => {

    const q = query(
      collection(db, "servicios"),
      where("negocioId", "==", userData.negocioId)
    );

    const snapshot = await getDocs(q);

    const lista = [];

    snapshot.forEach((docItem) => {
      lista.push({ id: docItem.id, ...docItem.data() });
    });

    setServicios(lista);

  };

  useEffect(() => {

    if (user && userData) {
      cargarServicios();
    }

  }, [user, userData]);

  return (

    <Layout>

      <div>

        <h2>Servicios 💗</h2>

        <input
          type="text"
          placeholder="Nombre del servicio"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <br /><br />

        <input
          type="number"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />

        <br /><br />

        <input
          type="number"
          step="0.5"
          min="0.5"
          placeholder="Duración en horas (ej: 1 o 1.5)"
          value={duracionHoras}
          onChange={(e) => setDuracionHoras(e.target.value)}
        />

        <br /><br />

        <button onClick={crearServicio}>
          Crear Servicio
        </button>

        <hr />

        {servicios.map((servicio) => (

          <div key={servicio.id} style={{ marginBottom: "15px" }}>

            <strong>{servicio.nombre}</strong>

            <br />

            💰 ${servicio.precio}

            <br />

            ⏱ {servicio.duracionHoras} hs

            <button
              onClick={() => eliminarServicio(servicio.id)}
              style={{ marginLeft: "10px" }}
            >
              Eliminar
            </button>

          </div>

        ))}

      </div>

    </Layout>

  );

}

export default Servicios;


