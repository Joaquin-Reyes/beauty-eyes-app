import { useState } from "react";
import { auth, db } from "../firebase/config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const register = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verificar si es el primer usuario (será admin)
      const usersSnapshot = await getDocs(collection(db, "users"));
      const role = usersSnapshot.empty ? "admin" : "lashista";

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role,
        active: true,
        createdAt: new Date()
      });

      alert("Usuario creado como " + role);
      navigate("/dashboard");

    } catch (error) {
      alert(error.message);
    }
  };

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Beauty Eyes PRO</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={register}>Registrarse</button>
      <button onClick={login}>Iniciar Sesión</button>
    </div>
  );
}

export default Login;
