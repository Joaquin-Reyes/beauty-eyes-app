import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";

import Layout from "../components/layout/Layout";
import Toast from "../components/ui/Toast";
import Loader from "../components/ui/Loader";

const diasSemana = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado"
];

const formatearTelefonoWhatsApp = (telefono) => {

  let tel = telefono
    .replace(/\D/g, ""); // dejar solo números

  // quitar prefijo 54 si existe
  if (tel.startsWith("54")) {
    tel = tel.substring(2);
  }

  // quitar 0 inicial
  if (tel.startsWith("0")) {
    tel = tel.substring(1);
  }

  // quitar 9 inicial si alguien lo puso
  if (tel.startsWith("9")) {
    tel = tel.substring(1);
  }

  return "549" + tel;

};

function Turnos() {

  const { user, userData } = useContext(AuthContext);

  const [cliente, setCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [servicioSeleccionado, setServicioSeleccionado] = useState("");

  const [servicios, setServicios] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [clientes, setClientes] = useState([]);

  const [lashistas, setLashistas] = useState([]);
  const [lashistaSeleccionada, setLashistaSeleccionada] = useState("");

  const [configHorario, setConfigHorario] = useState(null);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [turnoEditando, setTurnoEditando] = useState(null);

  const [vistaFecha, setVistaFecha] = useState("");

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarConfiguracion = async () => {

    const ref = doc(db, "configuracionHorario", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      setConfigHorario(data.horarios || data);
    }

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

  const cargarTurnos = async () => {

    const q = query(
      collection(db, "turnos"),
      where("negocioId", "==", userData.negocioId)
    );

    const snapshot = await getDocs(q);

    const lista = [];

    snapshot.forEach((docItem) => {
      lista.push({ id: docItem.id, ...docItem.data() });
    });

    setTurnos(lista);

  };

  const cargarClientes = async () => {

    const q = query(
      collection(db, "clientes"),
      where("negocioId", "==", userData.negocioId)
    );

    const snapshot = await getDocs(q);

    const lista = [];

    snapshot.forEach((docItem) => {
      lista.push(docItem.data());
    });

    setClientes(lista);

  };

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

  };

  useEffect(() => {

    const init = async () => {

      setLoading(true);

      await cargarServicios();
      await cargarConfiguracion();
      await cargarTurnos();
      await cargarLashistas();
      await cargarClientes();

      setLoading(false);

    };

    if (user && userData) init();

  }, [user, userData]);

  const generarHorarios = () => {

    if (!fecha || !servicioSeleccionado || !configHorario || !lashistaSeleccionada) {
      setHorariosDisponibles([]);
      return;
    }

    const fechaObj = new Date(fecha);
    const diaNombre = diasSemana[fechaObj.getDay()];
    const configDia = configHorario[diaNombre];

    if (!configDia || !configDia.activo) {
      setHorariosDisponibles([]);
      return;
    }

    const servicio = servicios.find(
      (s) => s.id === servicioSeleccionado
    );

    if (!servicio) return;

    const duracionMin = (servicio?.duracionHoras || 1) * 60;

    const inicioJornada = new Date(`${fecha}T${configDia.inicio}`);
    const finJornada = new Date(`${fecha}T${configDia.fin}`);

    const bloques = [];

    let cursor = new Date(inicioJornada);

    while (cursor < finJornada) {

      const inicioBloque = new Date(cursor);

      const finBloque = new Date(
        cursor.getTime() + duracionMin * 60000
      );

      if (finBloque <= finJornada) {
        bloques.push(inicioBloque);
      }

      cursor.setMinutes(cursor.getMinutes() + 30);

    }

    const libres = bloques.filter((bloque) => {

      const finNuevo = new Date(
        bloque.getTime() + duracionMin * 60000
      );

      const conflicto = turnos.some((turno) => {

        if (turno.fecha !== fecha) return false;
        if (turno.lashistaId !== lashistaSeleccionada) return false;

        const inicioExistente = new Date(`${fecha}T${turno.hora}`);

        const finExistente = new Date(
          inicioExistente.getTime() + duracionMin * 60000
        );

        return (
          bloque < finExistente &&
          finNuevo > inicioExistente
        );

      });

      return !conflicto;

    });

    setHorariosDisponibles(libres);

  };

  useEffect(() => {
    generarHorarios();
  }, [fecha, servicioSeleccionado, lashistaSeleccionada, turnos]);


  const crearTurno = async () => {

    if (!cliente || !telefono || !fecha || !horaSeleccionada || !servicioSeleccionado || !lashistaSeleccionada) {

      setToast({
        message: "Completa todos los campos",
        type: "error"
      });

      return;

    }

    try {

      const servicio = servicios.find(
        (s) => s.id === servicioSeleccionado
      );

      const lashista = lashistas.find(
        (l) => l.id === lashistaSeleccionada
      );

      if (turnoEditando) {

  await updateDoc(doc(db, "turnos", turnoEditando.id), {

    cliente: cliente,
    telefono: formatearTelefonoWhatsApp(telefono),
    fecha: fecha,
    hora: horaSeleccionada,
    servicio: servicio?.nombre || "",
    servicioId: servicio?.id || "",
    lashistaId: lashistaSeleccionada,
    lashistaNombre: lashista?.email || ""

  });

} else {

  await addDoc(collection(db, "turnos"), {

    cliente: cliente,
    telefono: formatearTelefonoWhatsApp(telefono),
    fecha: fecha,
    hora: horaSeleccionada,
    servicio: servicio?.nombre || "",
    servicioId: servicio?.id || "",
    lashistaId: lashistaSeleccionada,
    lashistaNombre: lashista?.email || "",
    negocioId: userData.negocioId,
    createdAt: serverTimestamp(),

    recordatorio24h: false,
    whatsappEnviado: false

  });

}

setTurnoEditando(null);

      const clienteExistente = clientes.find(
        (c) => c.telefono === telefono
      );

      if (!clienteExistente) {

        await addDoc(collection(db, "clientes"), {

          nombre: cliente,
          telefono: formatearTelefonoWhatsApp(telefono),
          negocioId: userData.negocioId

        });

      }

      const mensaje = `Hola ${cliente} 😊
Tu turno fue confirmado.

📅 Fecha: ${fecha}
⏰ Hora: ${horaSeleccionada}hs
💅 Servicio: ${servicio?.nombre || ""}

Te esperamos 💗`;


      await cargarTurnos();

      setCliente("");
      setTelefono("");
      setHoraSeleccionada("");

      setToast({
        message: "Turno creado correctamente",
        type: "success"
      });

    } catch (error) {

      console.error(error);

      setToast({
        message: "Error al crear turno",
        type: "error"
      });

    }

  };

  const eliminarTurno = async (turnoId) => {

  const confirmar = window.confirm("¿Eliminar este turno?");

  if (!confirmar) return;

  try {

    await deleteDoc(doc(db, "turnos", turnoId));

    await cargarTurnos();

    setToast({
      message: "Turno eliminado",
      type: "success"
    });

  } catch (error) {

    console.error(error);

    setToast({
      message: "Error al eliminar turno",
      type: "error"
    });

  }

};

const editarTurno = (turno) => {

  setCliente(turno.cliente);
  setTelefono(turno.telefono);
  setFecha(turno.fecha);
  setHoraSeleccionada(turno.hora);
  setServicioSeleccionado(turno.servicioId);
  setLashistaSeleccionada(turno.lashistaId);

  setTurnoEditando(turno);

};

  const generarHorariosVista = () => {

    if (!vistaFecha || !configHorario) return [];

    const fechaObj = new Date(vistaFecha);
    const diaNombre = diasSemana[fechaObj.getDay()];
    const configDia = configHorario[diaNombre];

    if (!configDia || !configDia.activo) return [];

    const horarios = [];

    let cursor = new Date(`${vistaFecha}T${configDia.inicio}`);
    const fin = new Date(`${vistaFecha}T${configDia.fin}`);

    while (cursor < fin) {

      horarios.push(cursor.toTimeString().slice(0,5));
      cursor.setMinutes(cursor.getMinutes() + 30);

    }

    return horarios;

  };

  const horariosTabla = generarHorariosVista();

  if (loading) return <Loader />;

  return (
    <Layout>

      <div style={{ maxWidth: "1000px" }}>

        <h2>Agenda 💗</h2>

        {/* CREAR TURNO */}

        <div className="card">

          <h3>Crear Turno</h3>

          <div className="form-row">

            <input
              type="text"
              placeholder="Nombre cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="input"
            />

            <input
              type="text"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => {

                const tel = e.target.value;

                setTelefono(tel);

                const clienteExistente = clientes.find(
                  (c) => c.telefono === tel
                );

                if (clienteExistente) {
                  setCliente(clienteExistente.nombre);
                }

              }}
              className="input"
            />

          </div>

          <div className="form-row">

            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="input"
            />

            <select
              value={servicioSeleccionado}
              onChange={(e) => setServicioSeleccionado(e.target.value)}
              className="input"
            >

              <option value="">Seleccionar servicio</option>

              {servicios.map((servicio) => (

                <option key={servicio.id} value={servicio.id}>
                  {servicio.nombre}
                </option>

              ))}

            </select>

          </div>

          <div className="form-row">

            <select
              value={lashistaSeleccionada}
              onChange={(e) => setLashistaSeleccionada(e.target.value)}
              className="input"
            >

              <option value="">Seleccionar lashista</option>

              {lashistas.map((lashista) => (

                <option key={lashista.id} value={lashista.id}>
                  {lashista.email}
                </option>

              ))}

            </select>

          </div>

          <h4>Horarios Disponibles</h4>

          <div>

            {horariosDisponibles.map((bloque, index) => {

              const horaFormateada =
                bloque.toTimeString().slice(0, 5);

              return (

                <button
  key={index}
  onClick={() => setHoraSeleccionada(horaFormateada)}
  className={`slot-btn ${
    horaSeleccionada === horaFormateada ? "active" : ""
  }`}
>
  {horaFormateada}
</button>

              );

            })}

          </div>

          <button onClick={crearTurno} className="button-primary">
            Crear Turno
          </button>

        </div>

        <h3 style={{ marginTop: "40px" }}>Vista Calendario</h3>

<input
  type="date"
  value={vistaFecha}
  onChange={(e) => setVistaFecha(e.target.value)}
  style={{ marginBottom: "20px" }}
/>

{vistaFecha && (

  <div className="agenda-desktop">

    <div className="table-wrapper">

      <table className="table">

        <thead>
          <tr>

            <th>Hora</th>

            {lashistas.map((lashista) => (
              <th key={lashista.id}>
                {lashista.email}
              </th>
            ))}

          </tr>
        </thead>

        <tbody>

          {horariosTabla.map((hora) => (

            <tr key={hora}>

              <td>{hora}</td>

              {lashistas.map((lashista) => {

                const turno = turnos.find(
                  (t) =>
                    t.fecha === vistaFecha &&
                    t.hora === hora &&
                    t.lashistaId === lashista.id
                );

                return (
                  <td
                     key={lashista.id}
                     className="celda-turno"
                     style={{
                     background: turno ? "#f8c8dc" : "#fafafa"
                     }}
                     >

                    {turno ? (
                      <div>

                        <strong>{turno.cliente}</strong>

                        <div style={{ fontSize: "12px" }}>
                          {turno.servicio}
                        </div>

                        <button
                          onClick={() => editarTurno(turno)}
                          style={{
                            marginTop: "4px",
                            fontSize: "11px",
                            padding: "2px 5px",
                            border: "none",
                            borderRadius: "4px",
                            background: "#4CAF50",
                            color: "white",
                            cursor: "pointer"
                           }}
                         >
                           ✏
                          </button>

                        <button
                          onClick={() => eliminarTurno(turno.id)}
                          style={{
                            marginTop: "5px",
                            fontSize: "11px",
                            padding: "4px 6px",
                            border: "none",
                            borderRadius: "4px",
                            background: "#ff6b6b",
                            color: "white",
                            cursor: "pointer"
                          }}
                        >
                          Eliminar
                        </button>

                      </div>
                    ) : (
                      ""
                    )}

                  </td>
                );

              })}

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  </div>

)}

{vistaFecha && (

  <div className="agenda-mobile">

    {horariosTabla.map((hora) => (

      <div key={hora} className="agenda-slot">

        <div className="agenda-hora">
          {hora}
        </div>

        {lashistas.map((lashista) => {

          const turno = turnos.find(
            (t) =>
              t.fecha === vistaFecha &&
              t.hora === hora &&
              t.lashistaId === lashista.id
          );

          if (!turno) return null;

          return (

            <div className="agenda-turno">

  <strong>{turno.cliente}</strong>

  <div style={{ fontSize: "12px" }}>
    {turno.servicio}
  </div>

  <div className="agenda-actions">

    <a
      href={`https://wa.me/${turno.telefono}`}
      target="_blank"
      rel="noopener noreferrer"
      className="action-btn whatsapp"
    >
      WhatsApp
    </a>

    <button
      onClick={() => eliminarTurno(turno.id)}
      className="action-btn delete"
    >
      Eliminar
    </button>

  </div>

</div>

          );

        })}

      </div>

    ))}

  </div>

)}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

      </div>

    </Layout>
  );

}


export default Turnos;



