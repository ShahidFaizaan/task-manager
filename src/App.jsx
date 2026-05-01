import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Plus, Folder, LayoutDashboard, LogOut, Trash2, AlignLeft, CheckSquare, Kanban, MoreHorizontal, User } from 'lucide-react'

function App() {
  const [user, setUser] = useState(null)
  
  // Auth state
  const [isLoginView, setIsLoginView] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // App state
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [newProjectName, setNewProjectName] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [activeTab, setActiveTab] = useState('board')

  // Listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      fetchProjects()
      fetchTasks()
    }
  }, [user])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
      if (error) throw error
      if (data) setProjects(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
      if (error) throw error
      if (data) setTasks(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    try {
      if (isLoginView) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert("Account created! If your Supabase requires email confirmation, check your inbox. Otherwise, you should be logged in.")
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!newProjectName.trim()) return
    const { error } = await supabase.from('projects').insert([{ name: newProjectName }])
    if (error) {
      alert("Error creating project: " + error.message)
    } else {
      setNewProjectName('')
      fetchProjects()
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) {
      alert("Please enter a task title.")
      return
    }
    if (!selectedProjectId) {
      alert("Please select a project before adding a task.")
      return
    }
    
    const { error } = await supabase.from('tasks').insert([{ title: newTaskTitle, project_id: selectedProjectId, status: 'todo' }])
    if (error) {
      alert("Error creating task: " + error.message)
    } else {
      setNewTaskTitle('')
      fetchTasks()
    }
  }

  const updateTaskStatus = async (taskId, newStatus) => {
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    if (!error) {
      fetchTasks()
    }
  }

  const handleDeleteTask = async (taskId) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (!error) fetchTasks()
  }

  const handleDeleteProject = async (projectId) => {
    const { error } = await supabase.from('projects').delete().eq('id', projectId)
    if (!error) {
      fetchProjects()
      fetchTasks()
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7] font-sans">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-[#DFE1E6]">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-[#0052CC] p-1.5 rounded">
                <Kanban className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-[#172B4D]">TeamFlow</h1>
            </div>
            <p className="text-[#5E6C84] font-medium">Log in to your account</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#172B4D] mb-1.5">Email address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAFBFC] border border-[#DFE1E6] rounded text-[#172B4D] focus:bg-white focus:outline-none focus:border-[#4C9AFF] focus:ring-1 focus:ring-[#4C9AFF] transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#172B4D] mb-1.5">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAFBFC] border border-[#DFE1E6] rounded text-[#172B4D] focus:bg-white focus:outline-none focus:border-[#4C9AFF] focus:ring-1 focus:ring-[#4C9AFF] transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={authLoading}
              className="w-full py-2 px-4 rounded font-semibold text-white bg-[#0052CC] hover:bg-[#0047B3] disabled:opacity-70 transition-colors"
            >
              {authLoading ? 'Please wait...' : (isLoginView ? 'Log In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <button 
              onClick={() => setIsLoginView(!isLoginView)}
              className="text-[#0052CC] hover:underline font-medium"
            >
              {isLoginView ? "Sign up for an account" : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const todoTasks = tasks.filter(t => t.status === 'todo')
  const doneTasks = tasks.filter(t => t.status === 'done')

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#172B4D] font-sans">
      {/* Navbar (Jira Style) */}
      <nav className="bg-[#0052CC] text-white">
        <div className="px-4 h-14 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer">
              <Kanban className="h-5 w-5" />
              <span className="font-bold text-xl tracking-tight">TeamFlow</span>
            </div>
            <div className="hidden md:flex gap-4">
              <button className="text-white hover:bg-[#0047B3] px-3 py-1.5 rounded font-medium text-sm transition-colors">Your Work</button>
              <button className="text-white hover:bg-[#0047B3] px-3 py-1.5 rounded font-medium text-sm transition-colors">Projects</button>
              <button className="text-white hover:bg-[#0047B3] px-3 py-1.5 rounded font-medium text-sm transition-colors">Filters</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium hidden sm:block">{user.email}</div>
            <button 
              onClick={handleSignOut}
              className="p-1.5 hover:bg-[#0047B3] rounded transition-colors" 
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex max-w-[1600px] mx-auto">
        {/* Sidebar */}
        <div className="w-64 shrink-0 bg-[#F4F5F7] border-r border-[#DFE1E6] min-h-[calc(100vh-56px)] p-4 hidden md:block">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded bg-gradient-to-br from-[#0052CC] to-[#00B8D9] flex items-center justify-center shadow-sm">
              <CheckSquare className="text-white h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-[15px] text-[#172B4D]">Engineering Board</div>
              <div className="text-xs text-[#5E6C84]">Software project</div>
            </div>
          </div>

          <div className="space-y-0.5">
            <button 
              onClick={() => setActiveTab('board')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded transition-colors ${activeTab === 'board' ? 'bg-[#EBECF0] text-[#0052CC]' : 'text-[#42526E] hover:bg-[#EBECF0]'}`}
            >
              <Kanban className="h-4 w-4" /> Kanban Board
            </button>
            <button 
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded transition-colors ${activeTab === 'projects' ? 'bg-[#EBECF0] text-[#0052CC]' : 'text-[#42526E] hover:bg-[#EBECF0]'}`}
            >
              <Folder className="h-4 w-4" /> Projects
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded transition-colors ${activeTab === 'dashboard' ? 'bg-[#EBECF0] text-[#0052CC]' : 'text-[#42526E] hover:bg-[#EBECF0]'}`}
            >
              <LayoutDashboard className="h-4 w-4" /> Reports
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          
          {activeTab === 'board' && (
            <div>
              <div className="mb-6">
                <div className="text-sm text-[#5E6C84] mb-2 font-medium">Projects / Engineering / Board</div>
                <h2 className="text-2xl font-bold text-[#172B4D]">Sprint Board</h2>
              </div>

              {/* Task Creation Form inline */}
              <div className="mb-8">
                <form onSubmit={handleCreateTask} className="flex gap-2 w-full max-w-3xl">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    placeholder={projects.length === 0 ? "Create a project in the Projects tab first!" : "What needs to be done?"}
                    className="flex-1 px-3 py-2 bg-white border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:border-[#4C9AFF] focus:ring-1 focus:ring-[#4C9AFF] transition-all"
                    disabled={projects.length === 0}
                  />
                  <select 
                    value={selectedProjectId} 
                    onChange={e => setSelectedProjectId(e.target.value)}
                    className="px-3 py-2 bg-[#FAFBFC] border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:border-[#4C9AFF]"
                    disabled={projects.length === 0}
                  >
                    <option value="" disabled>Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <button 
                    type="submit" 
                    disabled={projects.length === 0}
                    className="flex items-center gap-2 py-2 px-4 rounded font-medium text-white bg-[#0052CC] hover:bg-[#0047B3] disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" /> Create
                  </button>
                </form>
              </div>

              {/* Kanban Board Layout */}
              <div className="flex gap-6 items-start overflow-x-auto pb-8">
                
                {/* TO DO Column */}
                <div className="bg-[#EBECF0] rounded p-2 w-80 shrink-0 flex flex-col max-h-[70vh]">
                  <div className="px-2 py-2 font-semibold text-[#5E6C84] text-xs uppercase flex justify-between items-center">
                    <span>To Do ({todoTasks.length})</span>
                    <MoreHorizontal className="h-4 w-4 cursor-pointer" />
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 p-1">
                    {todoTasks.map(t => (
                      <div key={t.id} className="bg-white p-3 rounded shadow-[0_1px_2px_rgba(9,30,66,0.25)] hover:bg-[#FAFBFC] cursor-pointer group">
                        <p className="text-[#172B4D] text-sm font-medium mb-3">{t.title}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5 text-xs text-[#5E6C84] bg-[#EBECF0] px-1.5 py-0.5 rounded font-semibold">
                            {projects.find(p => p.id === t.project_id)?.name || 'Task'}
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => updateTaskStatus(t.id, 'done')} className="text-xs bg-[#0052CC] text-white px-2 py-1 rounded hover:bg-[#0047B3]">
                              Move to Done
                            </button>
                            <button onClick={() => handleDeleteTask(t.id)} className="text-[#5E6C84] hover:text-[#DE350B]">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DONE Column */}
                <div className="bg-[#EBECF0] rounded p-2 w-80 shrink-0 flex flex-col max-h-[70vh]">
                  <div className="px-2 py-2 font-semibold text-[#5E6C84] text-xs uppercase flex justify-between items-center">
                    <span>Done ({doneTasks.length})</span>
                    <MoreHorizontal className="h-4 w-4 cursor-pointer" />
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 p-1">
                    {doneTasks.map(t => (
                      <div key={t.id} className="bg-white p-3 rounded shadow-[0_1px_2px_rgba(9,30,66,0.25)] hover:bg-[#FAFBFC] cursor-pointer group">
                        <p className="text-[#172B4D] text-sm font-medium line-through mb-3">{t.title}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5 text-xs text-[#5E6C84] bg-[#EBECF0] px-1.5 py-0.5 rounded font-semibold">
                            <CheckSquare className="h-3 w-3 text-[#36B37E]" />
                            {projects.find(p => p.id === t.project_id)?.name || 'Task'}
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => updateTaskStatus(t.id, 'todo')} className="text-xs bg-[#EBECF0] text-[#5E6C84] px-2 py-1 rounded hover:bg-[#DFE1E6]">
                              Reopen
                            </button>
                            <button onClick={() => handleDeleteTask(t.id)} className="text-[#5E6C84] hover:text-[#DE350B]">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="max-w-4xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#172B4D]">Projects</h2>
              </div>
              
              <div className="bg-white p-4 rounded border border-[#DFE1E6] mb-6 shadow-sm">
                <form onSubmit={handleCreateProject} className="flex gap-2">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    placeholder="Enter project name..."
                    className="flex-1 px-3 py-2 bg-[#FAFBFC] border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:border-[#4C9AFF]"
                    required
                  />
                  <button type="submit" className="flex items-center gap-2 py-2 px-4 rounded font-medium text-white bg-[#0052CC] hover:bg-[#0047B3] transition-colors">
                    Create Project
                  </button>
                </form>
              </div>

              <div className="bg-white rounded border border-[#DFE1E6] overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#DFE1E6] bg-[#FAFBFC]">
                      <th className="py-3 px-4 text-xs font-semibold text-[#5E6C84] uppercase">Project Name</th>
                      <th className="py-3 px-4 text-xs font-semibold text-[#5E6C84] uppercase">Created</th>
                      <th className="py-3 px-4 text-xs font-semibold text-[#5E6C84] uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(p => (
                      <tr key={p.id} className="border-b border-[#DFE1E6] last:border-0 hover:bg-[#FAFBFC]">
                        <td className="py-3 px-4 font-medium flex items-center gap-2">
                          <Folder className="h-4 w-4 text-[#5E6C84]" /> {p.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-[#5E6C84]">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => handleDeleteProject(p.id)} className="text-[#5E6C84] hover:text-[#DE350B]">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {projects.length === 0 && (
                      <tr>
                        <td colSpan="3" className="py-8 text-center text-[#5E6C84]">No projects found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="max-w-4xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#172B4D]">Reports</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded border border-[#DFE1E6] shadow-sm">
                  <div className="text-sm font-semibold text-[#5E6C84] uppercase mb-2">Total Tasks</div>
                  <div className="text-3xl font-bold text-[#172B4D]">{tasks.length}</div>
                </div>
                <div className="bg-white p-6 rounded border border-[#DFE1E6] shadow-sm">
                  <div className="text-sm font-semibold text-[#5E6C84] uppercase mb-2">To Do</div>
                  <div className="text-3xl font-bold text-[#0052CC]">{todoTasks.length}</div>
                </div>
                <div className="bg-white p-6 rounded border border-[#DFE1E6] shadow-sm">
                  <div className="text-sm font-semibold text-[#5E6C84] uppercase mb-2">Done</div>
                  <div className="text-3xl font-bold text-[#36B37E]">{doneTasks.length}</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default App
