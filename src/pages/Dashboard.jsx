import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import Layout from "../components/layout/Layout";

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [role, setRole] = useState("");
  const [lashistas, setLashistas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        if (userData.active === false) {
          alert("Cuenta desactivada. Contacte al administrador.");
          await signOut(auth);
          navigate("/");
          return;
        }

        setRole(userData.role);

        if (userData.role === "admin") {
          fetchLashistas();
        }
      }
    };

    const fetchLashistas = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = [];

      querySnapshot.forEach((docItem) => {
        if (docItem.data().role === "lashista") {
          usersList.push({
            id: docItem.id,
            ...docItem.data(),
          });
        }
      });

      setLashistas(usersList);
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const toggleActive = async (id, currentStatus) => {
    const userRef = doc(db, "users", id);

    await updateDoc(userRef, {
      active: !currentStatus
    });

    const querySnapshot = await getDocs(collection(db, "users"));
    const usersList = [];

    querySnapshot.forEach((docItem) => {
      if (docItem.data().role === "lashista") {
        usersList.push({
          id: docItem.id,
          ...docItem.data(),
        });
      }
    });

    setLashistas(usersList);
  };

  return (
    <Layout>
      <div>

        <h1>Beauty Eyes PRO</h1>

        {/* PANEL ADMIN */}
        {role === "admin" && (
          <div>
            <h2>Panel Admin 👑</h2>

            <h3>Lashistas Registradas:</h3>

            {lashistas.length === 0 ? (
              <p>No hay lashistas registradas.</p>
            ) : (
              lashistas.map((lashista) => (
                <div
                  key={lashista.id}
                  style={{
                    border: "1px solid #ddd",
                    padding: "15px",
                    marginBottom: "10px",
                    borderRadius: "8px"
                  }}
                >
                  <p><strong>Email:</strong> {lashista.email}</p>

                  <p>
                    <strong>Estado:</strong>{" "}
                    {lashista.active ? "Activa 🟢" : "Desactivada 🔴"}
                  </p>

                  <button
                    onClick={() => toggleActive(lashista.id, lashista.active)}
                  >
                    {lashista.active ? "Desactivar" : "Activar"}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* PANEL LASHISTA */}
        {role === "lashista" && (
          <div>
            <h2>Panel Lashista 💗</h2>
            <p>Gestiona tus turnos y servicios desde el menú lateral.</p>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default Dashboard;




