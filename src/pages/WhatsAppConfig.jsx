import { useEffect, useState } from "react";

function WhatsAppConfig() {

  const [estado, setEstado] = useState("");

  const API = "https://whatsapp-server-production-ce68.up.railway.app";

  useEffect(() => {
    fetch(`${API}/estado`)
      .then(res => res.json())
      .then(data => setEstado(data.estado));
  }, []);

  return (

    <div style={{ padding: "30px" }}>

      <h2>Configuración WhatsApp</h2>

      <p>Estado: {estado}</p>

      {estado !== "conectado" && (
        <div>

          <h3>Escaneá este QR con tu WhatsApp</h3>

          <iframe
            src={`${API}/qr`}
            width="300"
            height="300"
            style={{ border: "none" }}
          />

        </div>
      )}

      {estado === "conectado" && (
        <p style={{ color: "green" }}>
          WhatsApp conectado ✅
        </p>
      )}

    </div>

  );

}

export default WhatsAppConfig;