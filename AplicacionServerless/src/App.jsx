import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from './supabase'

function App() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [taskText, setTaskText] = useState("")
  const [tasks, setTasks] = useState([])
  const [darkMode, setDarkMode] = useState(false)
  const [name, setName] = useState("")
  const [user, setUser] = useState(null)
  const [filter, setFilter] = useState("all")
  const [message, setMessage] = useState("")
  const [screen, setScreen] = useState("register")
  const [showPassword, setShowPassword] = useState(false)
  const [profile, setProfile] = useState(null)
  function showMessage(text) {

  setMessage(text)

  setTimeout(() => {
    setMessage("")
  }, 3000)
}

  async function signUp() {

  const { data: existingUsers } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)

  if (existingUsers.length > 0) {

    showMessage("Ya existe un usuario con este email")
    return
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name
      }
    }
  })

  if (error) {

  if (
    error.message.includes("User already registered")
  ) {

    showMessage("Ya existe un usuario con este email")

  } else {

    showMessage("Ocurrió un error al registrarse")
  }

  } else {

    await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        email,
        name
      })

    showMessage("Usuario creado correctamente")

    setScreen("login")
  }
}

  async function signIn() {

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {

    showMessage("Email o contraseña incorrectos")

  } else {

    setUser(data.user)

    getProfile(data.user.id)

    showMessage("Inicio de sesión exitoso")

    getTasks()
  }
}

  async function logout() {
  
  await supabase.auth.signOut()
  setTasks([])
  setUser(null)

  window.location.reload()
}

  async function addTask() {

    if (!taskText) return

    const user = await supabase.auth.getUser()

    await supabase.from("tasks").insert({
      title: taskText,
      completed: false,
      user_id: user.data.user.id,
    })

    setTaskText("")
    getTasks()
  }

  async function getTasks() {

    const { data } = await supabase
      .from("tasks")
      .select("*")

    setTasks(data)
  }

  async function getProfile(userId) {

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  setProfile(data)
}

  async function toggleTask(task) {

    await supabase
      .from("tasks")
      .update({
        completed: !task.completed
      })
      .eq("id", task.id)

    getTasks()
  }

  async function deleteTask(id) {

    await supabase
      .from("tasks")
      .delete()
      .eq("id", id)

    getTasks()
  }

  async function deleteAllTasks() {

    const user = await supabase.auth.getUser()

    await supabase
      .from("tasks")
      .delete()
      .eq("user_id", user.data.user.id)

    getTasks()
  }

  async function completeAllTasks() {

    const user = await supabase.auth.getUser()

    await supabase
      .from("tasks")
      .update({ completed: true })
      .eq("user_id", user.data.user.id)

    getTasks()
  }

  useEffect(() => {

  async function getSession() {

    const { data } = await supabase.auth.getSession()

    if (data.session) {
      setUser(data.session.user)

      getProfile(data.session.user.id)

      getTasks()
    }
  }

  getSession()

}, [])

  return (

  <div className={darkMode ? "dark" : "light"}>
    {
      message && (
        <div className="message">
          {message}
        </div>
      )
    }

    {

  !user ? (

    screen === "register" ? (

      <div className="auth">

        <h1>
          Crear cuenta
        </h1>

        

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
        >
          {
            showPassword
              ? "Ocultar contraseña"
              : "Ver contraseña"
          }
        </button>

        <input
          type="text"
          placeholder="Nombre"
          onChange={(e) => setName(e.target.value)}
        />

        <button onClick={signUp}>
          Registrarse
        </button>

        <p
          className="link"
          onClick={() => setScreen("login")}
        >
          Ya tengo cuenta
        </p>

      </div>

    ) : (

      <div className="auth">

        <h1>
          Iniciar sesión
        </h1>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
        >
          {
            showPassword
              ? "Ocultar contraseña"
              : "Ver contraseña"
          }
        </button>

        <button onClick={signIn}>
          Iniciar sesión
        </button>

        <p
          className="link"
          onClick={() => setScreen("register")}
        >
          ← Registrar otro usuario
        </p>

      </div>

    )

  ) : (
        <>

          <div className="welcome">

            <h1>
              Hola, {profile?.name}
            </h1>

            <h2>
              Bienvenido a StudyTracker
            </h2>

          </div>

          <div className="sidebar">

            <button onClick={addTask}>
              Agregar tarea
            </button>

            <button onClick={completeAllTasks}>
              Completar todas
            </button>

            <button onClick={deleteAllTasks}>
              Borrar todas
            </button>

            <button onClick={() => setDarkMode(!darkMode)}>
              Dark Mode
            </button>

            <button onClick={logout}>
              Logout
            </button>

          </div>

          <input
            type="text"
            placeholder="Nueva tarea..."
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
          />

          <h2>
            Mis tareas
          </h2>

          <div className="filters">

            <button onClick={() => setFilter("all")}>
              Todas
            </button>

            <button onClick={() => setFilter("completed")}>
              Completadas
            </button>

            <button onClick={() => setFilter("pending")}>
              Pendientes
            </button>

          </div>

          <div className="tasks">

            {
              tasks
                .filter((task) => {

                  if (filter === "completed") {
                    return task.completed
                  }

                  if (filter === "pending") {
                    return !task.completed
                  }

                  return true
                })
                .map((task) => (

                  <div className="task-card" key={task.id}>

                    <p
                      onClick={() => toggleTask(task)}
                      style={{
                        textDecoration: task.completed
                          ? "line-through"
                          : "none"
                      }}
                    >
                      {task.title}
                    </p>

                    <button
                      onDoubleClick={() => deleteTask(task.id)}
                    >
                      Eliminar
                    </button>

                  </div>
                ))
            }

          </div>

        </>

      )
    }

  </div>
)
}

export default App