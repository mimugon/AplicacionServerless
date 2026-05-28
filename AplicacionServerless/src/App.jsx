import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from './supabase'

function App() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [taskText, setTaskText] = useState("")
  const [tasks, setTasks] = useState([])
  const [darkMode, setDarkMode] = useState(true)
  const [name, setName] = useState("")
  const [user, setUser] = useState(null)
  const [filter, setFilter] = useState("all")
  const [message, setMessage] = useState({ text: "", type: "success" })
  const [screen, setScreen] = useState("register")
  const [showPassword, setShowPassword] = useState(false)
  const [profile, setProfile] = useState(null)
  const [fabOpen, setFabOpen] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)

  function showMessage(text, type = "success") {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: "", type: "success" }), 3000)
  }

  async function signUp() {
    const { data: existingUsers } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)

    if (existingUsers.length > 0) {
      showMessage("Ya existe un usuario con este email", "error")
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })

    if (error) {
      showMessage(error.message.includes("User already registered")
        ? "Ya existe un usuario con este email"
        : "Ocurrió un error al registrarse", "error")
    } else {
      await supabase.from("profiles").insert({ id: data.user.id, email, name })
      showMessage("Usuario creado correctamente ✓")
      setScreen("login")
    }
  }

  async function signIn() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      showMessage("Email o contraseña incorrectos", "error")
    } else {
      setUser(data.user)
      getProfile(data.user.id)
      showMessage("Bienvenido de vuelta ✓")
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
    if (!taskText.trim()) return
    const user = await supabase.auth.getUser()
    await supabase.from("tasks").insert({
      title: taskText,
      completed: false,
      user_id: user.data.user.id,
    })
    setTaskText("")
    setShowAddTask(false)
    setFabOpen(false)
    getTasks()
  }

  async function getTasks() {
    const { data } = await supabase.from("tasks").select("*")
    setTasks(data)
  }

  async function getProfile(userId) {
    const { data } = await supabase
      .from("profiles").select("*").eq("id", userId).single()
    setProfile(data)
  }

  async function toggleTask(task) {
    await supabase.from("tasks").update({ completed: !task.completed }).eq("id", task.id)
    getTasks()
  }

  async function deleteTask(id) {
    await supabase.from("tasks").delete().eq("id", id)
    getTasks()
  }

  async function deleteAllTasks() {
    const user = await supabase.auth.getUser()
    await supabase.from("tasks").delete().eq("user_id", user.data.user.id)
    getTasks()
  }

  async function completeAllTasks() {
    const user = await supabase.auth.getUser()
    await supabase.from("tasks").update({ completed: true }).eq("user_id", user.data.user.id)
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

  const filteredTasks = tasks.filter(task => {
    if (filter === "completed") return task.completed
    if (filter === "pending") return !task.completed
    return true
  })

  const completedCount = tasks.filter(t => t.completed).length
  const pendingCount = tasks.filter(t => !t.completed).length
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  // ── AUTH SCREENS ────────────────────────────────────────────
  if (!user) {
    return (
      <div className={`app ${darkMode ? "dark" : "light"}`}>
        {message.text && (
          <div className={`toast toast--${message.type}`}>{message.text}</div>
        )}

        <div className="auth-page">
          <div className="auth-brand">
            <div className="auth-logo">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="10" fill="url(#grad)" />
                <path d="M8 16l5 5 11-11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32">
                    <stop stopColor="#7c6aff"/>
                    <stop offset="1" stopColor="#a78bfa"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="auth-brand-name">StudyTracker</span>
          </div>

          <div className="auth-card">
            <h2 className="auth-title">
              {screen === "register" ? "Crear cuenta" : "Iniciar sesión"}
            </h2>
            <p className="auth-subtitle">
              {screen === "register"
                ? "Organizá tus tareas en un solo lugar"
                : "Bienvenido de vuelta"}
            </p>

            <div className="auth-fields">
              {screen === "register" && (
                <div className="field-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div className="field-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label>Contraseña</label>
                <div className="password-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="password-toggle"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={screen === "register" ? signUp : signIn}
            >
              {screen === "register" ? "Crear cuenta" : "Entrar"}
            </button>

            <p className="auth-switch">
              {screen === "register" ? (
                <>¿Ya tenés cuenta? <span onClick={() => setScreen("login")}>Iniciá sesión</span></>
              ) : (
                <span onClick={() => setScreen("register")}>← Crear cuenta nueva</span>
              )}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── DASHBOARD ───────────────────────────────────────────────
  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      {message.text && (
        <div className={`toast toast--${message.type}`}>{message.text}</div>
      )}

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="auth-logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="url(#grad2)" />
              <path d="M8 16l5 5 11-11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="grad2" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#7c6aff"/>
                  <stop offset="1" stopColor="#a78bfa"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="sidebar-brand-name">StudyTracker</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Todas
            <span className="nav-badge">{tasks.length}</span>
          </button>

          <button
            className={`nav-item ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Pendientes
            <span className="nav-badge nav-badge--warn">{pendingCount}</span>
          </button>

          <button
            className={`nav-item ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            Completadas
            <span className="nav-badge nav-badge--success">{completedCount}</span>
          </button>
        </nav>

        <div className="sidebar-actions">
          <button className="sidebar-btn" onClick={completeAllTasks}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            Completar todas
          </button>
          <button className="sidebar-btn sidebar-btn--danger" onClick={deleteAllTasks}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            Borrar todas
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {profile?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="user-details">
              <span className="user-name">{profile?.name}</span>
              <span className="user-email">{profile?.email}</span>
            </div>
          </div>
          <div className="sidebar-footer-btns">
            <button className="icon-btn" title="Dark/Light mode" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              )}
            </button>
            <button className="icon-btn icon-btn--danger" title="Cerrar sesión" onClick={logout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        <header className="main-header">
          <div>
            <h1 className="main-title">Hola, {profile?.name?.split(" ")[0]} 👋</h1>
            <p className="main-subtitle">
              {pendingCount === 0
                ? "¡No tenés tareas pendientes!"
                : `Tenés ${pendingCount} tarea${pendingCount !== 1 ? "s" : ""} pendiente${pendingCount !== 1 ? "s" : ""}`}
            </p>
          </div>
        </header>

        {/* STAT CARDS */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-label">Total</span>
            <span className="stat-value">{tasks.length}</span>
          </div>
          <div className="stat-card stat-card--warn">
            <span className="stat-label">Pendientes</span>
            <span className="stat-value">{pendingCount}</span>
          </div>
          <div className="stat-card stat-card--success">
            <span className="stat-label">Completadas</span>
            <span className="stat-value">{completedCount}</span>
          </div>
          <div className="stat-card stat-card--accent">
            <span className="stat-label">Progreso</span>
            <span className="stat-value">{progress}%</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* TASKS */}
        <section className="tasks-section">
          <div className="tasks-header">
            <h2 className="tasks-title">
              {filter === "all" ? "Todas las tareas" : filter === "pending" ? "Pendientes" : "Completadas"}
            </h2>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
              <p>No hay tareas aquí todavía</p>
            </div>
          ) : (
            <div className="tasks-list">
              {filteredTasks.map((task) => (
                <div
                  className={`task-card ${task.completed ? "task-card--done" : ""}`}
                  key={task.id}
                >
                  <button
                    className={`task-check ${task.completed ? "task-check--done" : ""}`}
                    onClick={() => toggleTask(task)}
                  >
                    {task.completed && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </button>
                  <span className="task-title">{task.title}</span>
                  <button
                    className="task-delete"
                    onClick={() => deleteTask(task.id)}
                    title="Eliminar"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* FAB */}
      {fabOpen && showAddTask && (
        <div className="fab-modal-overlay" onClick={() => { setFabOpen(false); setShowAddTask(false) }}>
          <div className="fab-modal" onClick={e => e.stopPropagation()}>
            <h3>Nueva tarea</h3>
            <input
              type="text"
              className="fab-input"
              placeholder="¿Qué necesitás hacer?"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              autoFocus
            />
            <div className="fab-modal-actions">
              <button className="btn-ghost" onClick={() => { setFabOpen(false); setShowAddTask(false) }}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={addTask}>
                Agregar tarea
              </button>
            </div>
          </div>
        </div>
      )}

      {fabOpen && !showAddTask && (
        <div className="fab-speed-dial">
          <button
            className="fab-action"
            onClick={() => setShowAddTask(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Nueva tarea</span>
          </button>
        </div>
      )}

      <button
        className={`fab ${fabOpen ? "fab--open" : ""}`}
        onClick={() => {
          if (fabOpen && showAddTask) {
            setShowAddTask(false)
            setFabOpen(false)
          } else {
            setFabOpen(!fabOpen)
          }
        }}
      >
        <svg
          className="fab-icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <line x1="12" y1="5" x2="12" y2="19" className="fab-line-v"/>
          <line x1="5" y1="12" x2="19" y2="12" className="fab-line-h"/>
        </svg>
      </button>
    </div>
  )
}

export default App
