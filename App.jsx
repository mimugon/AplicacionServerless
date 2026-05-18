import { useEffect, useState } from "react";
import { supabase } from "./supabase";

function App() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tasks, setTasks] = useState([]);

  async function signUp() {
    await supabase.auth.signUp({
      email,
      password,
    });

    alert("Usuario creado");
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      getTasks();
    }
  }

  async function addTask() {
    const user = await supabase.auth.getUser();

    await supabase.from("tasks").insert({
      title: "Nueva tarea",
      user_id: user.data.user.id,
    });

    getTasks();
  }

  async function getTasks() {
    const { data } = await supabase
      .from("tasks")
      .select("*");

    setTasks(data);
  }

  async function updateTask(id) {
    await supabase
      .from("tasks")
      .update({ title: "Tarea editada" })
      .eq("id", id);

    getTasks();
  }

  async function deleteTask(id) {
    await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    getTasks();
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  useEffect(() => {
    getTasks();
  }, []);

  return (
    <div>

      <h1>StudyTracker</h1>

      <input
        type="email"
        placeholder="email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={signUp}>
        Registrarse
      </button>

      <button onClick={signIn}>
        Iniciar sesión
      </button>

      <hr />

      <button onClick={addTask}>
        Agregar tarea
      </button>

      <button onClick={logout}>
        Logout
      </button>

      {
        tasks.map((task) => (
          <div key={task.id}>

            <p>{task.title}</p>

            <button onClick={() => updateTask(task.id)}>
              Editar
            </button>

            <button onClick={() => deleteTask(task.id)}>
              Eliminar
            </button>

          </div>
        ))
      }

    </div>
  );
}

export default App;