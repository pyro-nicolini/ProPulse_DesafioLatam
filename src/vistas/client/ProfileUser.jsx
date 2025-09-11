import { useAuth } from "../../contexts/AuthContext";

export default function ProfileUser() {
  const { user } = useAuth();

  if (!user) return <p>No has iniciado sesión</p>;

  return (
    <div>
      <h1>Perfil de {user.nombre}</h1>
      <p>Email: {user.email}</p>
      <p>Rol: {user.rol}</p>
    </div>
  );
}
