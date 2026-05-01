import { useState, useEffect } from 'react'
import { Plus, Folder, LayoutDashboard, LogOut, Trash2, CheckSquare, Kanban, MoreHorizontal, User, Calendar } from 'lucide-react'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  
  // Auth state
  const [isLoginView, setIsLoginView] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('member')
  const [authLoading, setAuthLoading] = useState(false)

  // App state
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [profiles, setProfiles] = useState([])
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectBoardType, setNewProjectBoardType] = useState('kanban')
  
  // Task Creation State
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [newTaskAssignee, setNewTaskAssignee] = useState('')
  
  const [activeTab, setActiveTab] = useState('board')
  const [selectedBoardId, setSelectedBoardId] = useState(null) // which project's board to view

  useEffect(() => {
    if (token) {
      // In a real app we'd validate token here
      const storedUser = localStorage.getItem('user')
      if (storedUser) setUser(JSON.parse(storedUser))
      
      fetchProjects()
      fetchTasks()
      fetchProfiles()
    }
  }, [token])

  // --- API Calls to Flask ---
  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      if (res.ok) {
        setProjects(data)
        if (data.length > 0 && !selectedBoardId) setSelectedBoardId(data[0].id)
      }
    } catch (err) { console.error(err) }
  }

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      if (res.ok) setTasks(data)
    } catch (err) { console.error(err) }
  }

  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/profiles')
      const data = await res.json()
      if (res.ok) setProfiles(data)
    } catch (err) { console.error(err) }
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    try {
      const url = isLoginView ? '/api/auth/login' : '/api/auth/signup'
      const payload = isLoginView ? { email, password } : { email, password, role }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      
      if (!res.ok) {
        const errorMsg = data.error_description || data.message || data.error || 'Authentication failed';
        throw new Error(errorMsg);
      }
      
      if (isLoginView) {
        setToken(data.access_token)
        setUser(data.user)
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
      } else {
        alert("Account created! You can now log in.")
        setIsLoginView(true)
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!newProjectName.trim()) return
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName, board_type: newProjectBoardType })
      })
      if (res.ok) {
        setNewProjectName('')
        fetchProjects()
      } else {
        const data = await res.json()
        alert("Error: " + (data.message || data.error || JSON.stringify(data)))
      }
    } catch (err) { alert(err.message) }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim() || !selectedProjectId) return
    try {
      const payload = { title: newTaskTitle, project_id: selectedProjectId }
      if (newTaskDueDate) payload.due_date = newTaskDueDate
      if (newTaskAssignee) payload.assigned_to = newTaskAssignee

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setNewTaskTitle('')
        setNewTaskDueDate('')
        setNewTaskAssignee('')
        fetchTasks()
      } else {
        const data = await res.json()
        alert("Error: " + (data.message || data.error || JSON.stringify(data)))
      }
    } catch (err) { alert(err.message) }
  }

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      fetchTasks()
    } catch (err) { console.error(err) }
  }

  const handleDeleteTask = async (taskId) => {
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    fetchTasks()
  }

  const handleDeleteProject = async (projectId) => {
    await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
    fetchProjects()
    fetchTasks()
  }

  // --- UI Layouts ---

  if (!user || !token) {
    return (
      <div className="min-h-screen flex bg-zinc-950 font-sans selection:bg-rose-900/50">
        
        {/* Left Informative Panel (Hidden on Mobile) */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-rose-950 via-zinc-950 to-zinc-950 border-r border-zinc-800/80 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-900/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-rose-900/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-rose-800 p-2 rounded-xl border border-rose-700/50 shadow-lg shadow-rose-900/20">
              <Kanban className="h-6 w-6 text-rose-50" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">TeamFlow <span className="text-rose-500">Enterprise</span></h1>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-5xl font-extrabold text-white leading-tight mb-6">
              Manage your team's work in <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">real-time.</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-md">
              The professional agile project management tool. Choose between Scrum and Kanban boards, assign tasks, track deadlines, and deliver results faster.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-zinc-300 font-medium bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/80 max-w-sm backdrop-blur-sm">
                <CheckSquare className="h-5 w-5 text-emerald-500" /> Advanced Role-Based Access
              </div>
              <div className="flex items-center gap-3 text-zinc-300 font-medium bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/80 max-w-sm backdrop-blur-sm">
                <Kanban className="h-5 w-5 text-rose-500" /> Scrum & Kanban Support
              </div>
              <div className="flex items-center gap-3 text-zinc-300 font-medium bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/80 max-w-sm backdrop-blur-sm">
                <Calendar className="h-5 w-5 text-blue-500" /> Deadline Tracking
              </div>
            </div>
          </div>

          <div className="relative z-10 text-zinc-500 text-sm font-medium">
            © 2026 TeamFlow Enterprise. All rights reserved.
          </div>
        </div>

        {/* Right Login Panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-zinc-950 relative">
          <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-zinc-800/80 relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-2">{isLoginView ? 'Welcome back' : 'Create account'}</h2>
              <p className="text-zinc-400 font-medium">Please enter your details to continue.</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Email address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:bg-zinc-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600/50 transition-all placeholder-zinc-600"
                  placeholder="name@company.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:bg-zinc-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600/50 transition-all placeholder-zinc-600"
                  placeholder="••••••••"
                  required
                />
              </div>

              {!isLoginView && (
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">Select your role</label>
                  <select 
                    value={role} 
                    onChange={e => setRole(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:bg-zinc-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600/50 transition-all font-medium"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}

              <button 
                type="submit" 
                disabled={authLoading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-rose-800 hover:bg-rose-700 disabled:opacity-70 transition-all shadow-lg shadow-rose-900/20 active:scale-[0.98] mt-4"
              >
                {authLoading ? 'Authenticating...' : (isLoginView ? 'Log In' : 'Sign Up')}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setIsLoginView(!isLoginView)}
                className="text-zinc-400 hover:text-white font-medium transition-colors text-sm"
              >
                {isLoginView ? "Don't have an account? Sign up" : "Already have an account? Log in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Active Project Context
  const activeProject = projects.find(p => p.id === selectedBoardId) || projects[0]
  const boardTasks = tasks.filter(t => t.project_id === activeProject?.id)
  
  const todoTasks = boardTasks.filter(t => t.status === 'todo')
  const doneTasks = boardTasks.filter(t => t.status === 'done')
  
  const today = new Date().toISOString().split('T')[0]
  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.due_date && t.due_date < today)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-rose-900/50 flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-rose-950 border-b border-rose-900/50 text-rose-50 sticky top-0 z-50 shadow-md">
        <div className="px-5 h-16 flex justify-between items-center w-full">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="bg-rose-800/80 p-1.5 rounded-lg border border-rose-700/50 shadow-sm">
                <Kanban className="h-5 w-5 text-rose-100" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white hidden sm:block">TeamFlow</span>
            </div>
            <div className="hidden md:flex gap-2">
              <button onClick={() => setActiveTab('board')} className={`px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'board' ? 'bg-rose-900 text-white' : 'text-rose-200 hover:bg-rose-900 hover:text-white'}`}>Boards</button>
              <button onClick={() => setActiveTab('projects')} className={`px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'projects' ? 'bg-rose-900 text-white' : 'text-rose-200 hover:bg-rose-900 hover:text-white'}`}>Projects</button>
              <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-rose-900 text-white' : 'text-rose-200 hover:bg-rose-900 hover:text-white'}`}>Dashboard</button>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="text-sm font-semibold text-rose-200 bg-rose-900/40 px-3 py-1.5 rounded-full border border-rose-800/30 truncate max-w-[150px] sm:max-w-none">
              {user.email}
            </div>
            <button onClick={handleSignOut} className="p-2 text-rose-300 hover:bg-rose-900 hover:text-white rounded-lg transition-colors" title="Logout">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 shrink-0 bg-zinc-950 border-r border-zinc-800/80 p-5 hidden md:flex flex-col overflow-y-auto">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-800 to-rose-950 flex items-center justify-center shadow-lg border border-rose-700/50">
              <CheckSquare className="text-white h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-[15px] text-zinc-100 truncate">{activeProject?.name || 'Workspace'}</div>
              <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-0.5">{activeProject?.board_type || 'Project'}</div>
            </div>
          </div>

          <div className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-3 px-3">Your Boards</div>
          <div className="space-y-1 mb-8">
            {projects.map(p => (
              <button 
                key={p.id}
                onClick={() => { setActiveTab('board'); setSelectedBoardId(p.id) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all truncate ${selectedBoardId === p.id && activeTab === 'board' ? 'bg-rose-900/30 text-rose-300' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}
              >
                {p.board_type === 'scrum' ? <LayoutDashboard className="h-4 w-4 shrink-0" /> : <Kanban className="h-4 w-4 shrink-0" />}
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10">
          
          {activeTab === 'board' && (
            <div className="animate-in fade-in duration-500">
              {projects.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-zinc-800/50">
                  <Folder className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-zinc-300 mb-2">No Projects Yet</h3>
                  <p className="text-zinc-500 mb-6">Create a project in the Projects tab to get started.</p>
                  <button onClick={() => setActiveTab('projects')} className="bg-rose-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-rose-700">Go to Projects</button>
                </div>
              ) : (
                <>
                  <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="text-sm text-zinc-500 mb-1 font-semibold uppercase tracking-wider flex items-center gap-2">
                        {activeProject?.board_type === 'scrum' ? <span className="bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded text-xs border border-blue-800/50">SCRUM</span> : <span className="bg-rose-900/30 text-rose-400 px-2 py-0.5 rounded text-xs border border-rose-800/50">KANBAN</span>}
                        Board
                      </div>
                      <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight">{activeProject?.name}</h2>
                    </div>
                  </div>

                  {/* Task Creation Form inline */}
                  <div className="mb-8 bg-zinc-900/50 p-2 sm:p-3 rounded-2xl border border-zinc-800/80 shadow-sm w-full max-w-5xl">
                    <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        placeholder="What needs to be done?"
                        className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-rose-600/50 focus:ring-1 focus:ring-rose-600/50 transition-all font-medium placeholder-zinc-600"
                        required
                      />
                      <div className="flex gap-2 w-full sm:w-auto">
                        <select 
                          value={newTaskAssignee} 
                          onChange={e => setNewTaskAssignee(e.target.value)}
                          className="px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 focus:outline-none focus:border-rose-600/50 font-medium w-full sm:w-32 text-sm"
                        >
                          <option value="">Unassigned</option>
                          {profiles.map(p => <option key={p.id} value={p.id}>{p.email.split('@')[0]}</option>)}
                        </select>
                        <input 
                          type="date"
                          value={newTaskDueDate}
                          onChange={e => setNewTaskDueDate(e.target.value)}
                          className="px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 focus:outline-none focus:border-rose-600/50 font-medium w-full sm:w-36 text-sm"
                        />
                        <button 
                          type="submit" 
                          onClick={() => setSelectedProjectId(activeProject.id)}
                          className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-bold text-white bg-rose-800 hover:bg-rose-700 transition-all shadow-md shrink-0"
                        >
                          <Plus className="h-4 w-4" /> Add
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Kanban Board Layout */}
                  <div className="flex flex-col md:flex-row gap-6 items-start overflow-x-auto pb-8">
                    
                    {/* TO DO Column */}
                    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3 w-full md:w-80 shrink-0 flex flex-col max-h-[70vh] shadow-sm">
                      <div className="px-3 py-3 font-bold text-zinc-400 text-xs uppercase tracking-wider flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                          <span>{activeProject?.board_type === 'scrum' ? 'Sprint Backlog' : 'To Do'}</span>
                          <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full ml-1">{todoTasks.length}</span>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-3 p-1 mt-2">
                        {todoTasks.map(t => (
                          <div key={t.id} className="bg-zinc-950 p-4 rounded-xl shadow-sm border border-zinc-800 hover:border-rose-900/50 transition-all cursor-pointer group flex flex-col gap-3">
                            <p className="text-zinc-200 text-[15px] font-semibold leading-snug">{t.title}</p>
                            
                            <div className="flex flex-wrap gap-2 text-xs font-medium">
                              {t.assigned_to && (
                                <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md flex items-center gap-1"><User className="w-3 h-3"/> {profiles.find(p=>p.id===t.assigned_to)?.email.split('@')[0] || 'User'}</span>
                              )}
                              {t.due_date && (
                                <span className={`px-2 py-1 rounded-md flex items-center gap-1 border ${t.due_date < today ? 'bg-red-950/50 text-red-400 border-red-900/50' : 'bg-zinc-800 border-transparent text-zinc-400'}`}><Calendar className="w-3 h-3"/> {t.due_date}</span>
                              )}
                            </div>

                            <div className="flex justify-between items-center mt-1 pt-3 border-t border-zinc-800/50">
                              <span className="text-xs text-zinc-500 font-medium">#{t.id.substring(0,4)}</span>
                              <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button onClick={() => updateTaskStatus(t.id, 'done')} className="text-xs font-bold bg-rose-800/20 text-rose-400 hover:bg-rose-800/40 px-2.5 py-1.5 rounded-lg transition-colors">
                                  Done
                                </button>
                                <button onClick={() => handleDeleteTask(t.id)} className="text-zinc-500 hover:text-red-400 p-1">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* DONE Column */}
                    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3 w-full md:w-80 shrink-0 flex flex-col max-h-[70vh] shadow-sm">
                      <div className="px-3 py-3 font-bold text-zinc-400 text-xs uppercase tracking-wider flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span>Done</span>
                          <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full ml-1">{doneTasks.length}</span>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-3 p-1 mt-2">
                        {doneTasks.map(t => (
                          <div key={t.id} className="bg-zinc-950/50 p-4 rounded-xl shadow-sm border border-zinc-800/50 hover:border-zinc-700 transition-all cursor-pointer group flex flex-col gap-3">
                            <p className="text-zinc-500 text-[15px] font-medium line-through leading-snug">{t.title}</p>
                            
                            <div className="flex flex-wrap gap-2 text-xs font-medium opacity-60">
                              {t.assigned_to && (
                                <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md flex items-center gap-1"><User className="w-3 h-3"/> {profiles.find(p=>p.id===t.assigned_to)?.email.split('@')[0]}</span>
                              )}
                            </div>

                            <div className="flex justify-between items-center mt-1 pt-3 border-t border-zinc-800/50">
                               <span className="text-xs text-zinc-600 font-medium">#{t.id.substring(0,4)}</span>
                              <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button onClick={() => updateTaskStatus(t.id, 'todo')} className="text-xs font-bold bg-zinc-800 text-zinc-400 hover:bg-zinc-700 px-2.5 py-1.5 rounded-lg transition-colors">
                                  Reopen
                                </button>
                                <button onClick={() => handleDeleteTask(t.id)} className="text-zinc-600 hover:text-red-400 p-1">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="max-w-4xl animate-in fade-in duration-500">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Projects</h2>
                <p className="text-zinc-400 font-medium mt-2">Manage your team's folders and initiatives.</p>
              </div>
              
              <div className="bg-zinc-900/50 p-3 sm:p-4 rounded-2xl border border-zinc-800/80 mb-8 w-full">
                <form onSubmit={handleCreateProject} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    placeholder="Enter project name..."
                    className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-rose-600/50 focus:ring-1 focus:ring-rose-600/50 transition-all font-medium placeholder-zinc-600"
                    required
                  />
                  <select 
                    value={newProjectBoardType} 
                    onChange={e => setNewProjectBoardType(e.target.value)}
                    className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 focus:outline-none focus:border-rose-600/50 font-medium"
                  >
                    <option value="kanban">Kanban Board</option>
                    <option value="scrum">Scrum Board</option>
                  </select>
                  <button type="submit" className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-white bg-rose-800 hover:bg-rose-700 transition-colors shadow-md">
                    <Plus className="h-4 w-4" /> Create
                  </button>
                </form>
              </div>

              <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-zinc-800/80 bg-zinc-900/60">
                        <th className="py-4 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Project Name</th>
                        <th className="py-4 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Type</th>
                        <th className="py-4 px-6 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {projects.map(p => (
                        <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors group">
                          <td className="py-4 px-6 font-semibold text-zinc-200 flex items-center gap-3">
                            <div className="p-2 bg-zinc-800 rounded-lg text-rose-400"><Folder className="h-4 w-4" /></div>
                            {p.name}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${p.board_type==='scrum'?'bg-blue-900/20 text-blue-400 border-blue-800/50':'bg-rose-900/20 text-rose-400 border-rose-800/50'}`}>
                              {p.board_type}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button onClick={() => handleDeleteProject(p.id)} className="text-zinc-600 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {projects.length === 0 && (
                        <tr>
                          <td colSpan="3" className="py-12 text-center text-zinc-500 font-medium">No projects found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="max-w-5xl animate-in fade-in duration-500">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Reports & Analytics</h2>
                <p className="text-zinc-400 font-medium mt-2">Get a high-level overview of your workspace.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800/80 shadow-sm relative overflow-hidden group hover:border-rose-900/50 transition-colors">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Total Tasks</div>
                  <div className="text-4xl font-extrabold text-zinc-100">{tasks.length}</div>
                </div>
                
                <div className="bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800/80 shadow-sm relative overflow-hidden group hover:border-rose-900/50 transition-colors">
                  <div className="text-xs font-bold text-rose-500/80 uppercase tracking-widest mb-3">Pending</div>
                  <div className="text-4xl font-extrabold text-rose-400">{tasks.filter(t=>t.status==='todo').length}</div>
                </div>

                <div className="bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800/80 shadow-sm relative overflow-hidden group hover:border-rose-900/50 transition-colors">
                  <div className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest mb-3">Completed</div>
                  <div className="text-4xl font-extrabold text-emerald-400">{tasks.filter(t=>t.status==='done').length}</div>
                </div>
                
                <div className="bg-red-950/20 p-6 rounded-3xl border border-red-900/50 shadow-sm relative overflow-hidden group hover:bg-red-950/30 transition-colors">
                  <div className="text-xs font-bold text-red-500/80 uppercase tracking-widest mb-3">Overdue</div>
                  <div className="text-4xl font-extrabold text-red-400">{overdueTasks.length}</div>
                </div>
              </div>
              
              {overdueTasks.length > 0 && (
                <div className="mt-8 bg-zinc-900/40 rounded-2xl border border-red-900/30 p-5">
                  <h3 className="text-lg font-bold text-zinc-200 mb-4 flex items-center gap-2"><Calendar className="h-5 w-5 text-red-500" /> Overdue Tasks Action Required</h3>
                  <div className="space-y-2">
                    {overdueTasks.map(t => (
                      <div key={t.id} className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl flex justify-between items-center text-sm">
                        <span className="font-semibold text-zinc-300">{t.title}</span>
                        <span className="text-red-400 font-medium">Due: {t.due_date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default App
