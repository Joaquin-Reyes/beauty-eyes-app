import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Layout from "../components/layout/Layout";

const diasSemana = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo"
];

function Configuracion() {

  const { user } = useContext(AuthContext);

  const [horarios, setHorarios] = useState({});
  const [estadoWhatsApp, setEstadoWhatsApp] = useState("");

  const API = "https://whatsapp-server-production-ce68.up.railway.app";

  const cargarEstadoWhatsApp = () => {

    fetch(`${API}/estado`)
      .then(res => res.json())
      .then(data => setEstadoWhatsApp(data.estado))
      .catch(() => setEstadoWhatsApp("desconectado"));

  };

  useEffect(() => {

    const cargarConfig = async () => {

      const ref = doc(db, "configuracionHorario", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {

        const data = snap.data();
        setHorarios(data.horarios || data);

      } else {

        const inicial = {};

        diasSemana.forEach((dia) => {

          inicial[dia] = {
            activo: dia !== "domingo",
            inicio: "09:00",
            fin: "18:00"
          };

        });

        setHorarios(inicial);

      }

      cargarEstadoWhatsApp();

    };

    if (user) cargarConfig();

  }, [user]);

  const guardarConfig = async () => {

    await setDoc(
      doc(db, "configuracionHorario", user.uid),
      {
        horarios
      }
    );

    alert("Configuración guardada");

  };

  const actualizarDia = (dia, campo, valor) => {

    setHorarios({
      ...horarios,
      [dia]: {
        ...horarios[dia],
        [campo]: valor
      }
    });

  };


  return (

    <Layout>

      <div>

        <h2>Configuración de Horarios 💗</h2>

        {diasSemana.map((dia) => (

          <div key={dia} style={{ marginBottom: "20px" }}>

            <strong>{dia.toUpperCase()}</strong>

            <br />

            <label>

              Activo:

              <input
                type="checkbox"
                checked={horarios[dia]?.activo || false}
                onChange={(e) =>
                  actualizarDia(dia, "activo", e.target.checked)
                }
              />

            </label>

            <br />

            <input
              type="time"
              value={horarios[dia]?.inicio || ""}
              onChange={(e) =>
                actualizarDia(dia, "inicio", e.target.value)
              }
              disabled={!horarios[dia]?.activo}
            />

            <input
              type="time"
              value={horarios[dia]?.fin || ""}
              onChange={(e) =>
                actualizarDia(dia, "fin", e.target.value)
              }
              disabled={!horarios[dia]?.activo}
            />

          </div>

        ))}

        <button onClick={guardarConfig}>
          Guardar Configuración
        </button>

        <hr style={{ margin: "40px 0" }} />

        <h2>Conectar WhatsApp</h2>

        <p>Estado: {estadoWhatsApp}</p>

        {estadoWhatsApp === "conectado" && (

  <p style={{ color: "green" }}>
    WhatsApp conectado ✅
  </p>

)}

      </div>

    </Layout>

  );

}

export default Configuracion;
