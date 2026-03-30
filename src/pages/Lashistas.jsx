import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc
} from "firebase/firestore";
import Layout from "../components/layout/Layout";
import Loader from "../components/ui/Loader";

function Lashistas() {

  const { userData } = useContext(AuthContext);

  const [lashistas, setLashistas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nuevoEmail, setNuevoEmail] = useState("");

  const cargarLashistas = async () => {

    const q = query(
      collection(db, "users"),
      where("negocioId", "==", userData.negocioId)
    );

    const snapshot = await getDocs(q);

    const lista = [];

    snapshot.forEach((docItem) => {

      const data = docItem.data();

      if (data.role === "lashista") {
        lista.push({
          id: docItem.id,
          ...data
        });
      }

    });

    setLashistas(lista);
    setLoading(false);

  };

  useEffect(() => {

    if (userData) {
      cargarLashistas();
    }

  }, [userData]);

  const agregarLashista = async () => {

    if (!nuevoEmail) {
      alert("Ingrese un email");
      return;
    }

    await addDoc(collection(db, "users"), {

      email: nuevoEmail,
      role: "lashista",
      negocioId: userData.negocioId,
      active: true,
      createdAt: new Date()

    });

    setNuevoEmail("");

    cargarLashistas();

  };

  const toggleActive = async (id, currentStatus) => {

    const ref = doc(db, "users", id);

    await updateDoc(ref, {
      active: !currentStatus
    });

    cargarLashistas();

  };

  if (loading) return <Loader />;

  return (
    <Layout>

      <div style={{ maxWidth: "800px" }}>

        <h2>Lashistas 👩‍🎨</h2>

        {/* AGREGAR LASHISTA */}

        <div style={addBox}>

          <input
            type="email"
            placeholder="Email lashista"
            value={nuevoEmail}
            onChange={(e) => setNuevoEmail(e.target.value)}
            style={input}
          />

          <button
            onClick={agregarLashista}
            style={addBtn}
          >
            ➕ Agregar Lashista
          </button>

        </div>

        {/* LISTA */}

        {lashistas.length === 0 ? (
          <p>No hay lashistas registradas.</p>
        ) : (
          lashistas.map((lashista) => (

            <div key={lashista.id} style={cardStyle}>

              <div>

                <strong>{lashista.email}</strong>

                <p>
                  Estado: {lashista.active ? "Activa 🟢" : "Desactivada 🔴"}
                </p>

              </div>

              <button
                onClick={() =>
                  toggleActive(lashista.id, lashista.active)
                }
                style={btn}
              >
                {lashista.active ? "Desactivar" : "Activar"}
              </button>

            </div>

          ))
        )}

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

const addBtn = {
  padding: "10px 15px",
  border: "none",
  borderRadius: "6px",
  background: "#f8c8dc",
  cursor: "pointer"
};

const cardStyle = {
  background: "white",
  padding: "15px",
  marginBottom: "10px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const btn = {
  padding: "8px 12px",
  border: "none",
  borderRadius: "6px",
  background: "#f8c8dc",
  cursor: "pointer"
};

export default Lashistas;