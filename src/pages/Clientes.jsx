import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import Layout from "../components/layout/Layout";

function Clientes() {

  const { userData } = useContext(AuthContext);

  const [clientes, setClientes] = useState([]);

  const cargarClientes = async () => {

    const q = query(
      collection(db, "clientes"),
      where("negocioId", "==", userData.negocioId)
    );

    const snapshot = await getDocs(q);

    const lista = [];

    snapshot.forEach((doc) => {
      lista.push(doc.data());
    });

    setClientes(lista);

  };

  useEffect(() => {

    if (userData) {
      cargarClientes();
    }

  }, [userData]);

  return (

    <Layout>

      <h2>Clientes 💗</h2>

      {clientes.map((cliente, index) => (

        <div key={index} style={{
          background: "white",
          padding: "15px",
          marginBottom: "10px",
          borderRadius: "10px"
        }}>

          <strong>{cliente.nombre}</strong>

          <br/>

          📞 {cliente.telefono}

          <br/>

          Última visita: {cliente.ultimaVisita}

        </div>

      ))}

    </Layout>

  );

}

export default Clientes;