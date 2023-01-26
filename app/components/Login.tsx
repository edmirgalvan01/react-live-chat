import { useSupabase } from "../hooks/useSupabase";

export const Login = () => {
  const supabase = useSupabase();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) console.log("Error al cerrar sesion", error);
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
    });

    if (error) console.log("Error al iniciar sesion", error);
  };

  return (
    <div style={{ display: "flex", gap: "12px" }}>
      <button onClick={handleLogout}>Cerrar sesion</button>
      <button onClick={handleLogin}>Iniciar sesion</button>
    </div>
  );
};
