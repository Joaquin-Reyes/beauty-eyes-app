import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Turnos from "./pages/Turnos";
import Servicios from "./pages/Servicios";
import Lashistas from "./pages/Lashistas";
import Configuracion from "./pages/Configuracion";
import Clientes from "./pages/Clientes";
import WhatsAppConfig from "./pages/WhatsAppConfig";

function App() {

  return (

    <Router>

      <Routes>

        <Route path="/" element={<Dashboard />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/turnos" element={<Turnos />} />

        <Route path="/servicios" element={<Servicios />} />

        <Route path="/clientes" element={<Clientes />} />

        <Route path="/lashistas" element={<Lashistas />} />

        <Route path="/configuracion" element={<Configuracion />} />

        <Route path="/whatsapp" element={<WhatsAppConfig />} />

      </Routes>

    </Router>

  );

}

export default App;


